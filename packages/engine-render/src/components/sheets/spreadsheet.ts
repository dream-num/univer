/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IRange, ISelectionCellWithCoord, Nullable, ObjectMatrix } from '@univerjs/core';
import { BooleanNumber, sortRules } from '@univerjs/core';


import { FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from '../../basics/const';

// import { clearLineByBorderType } from '../../basics/draw';
import { getCellPositionByIndex, getColor } from '../../basics/tools';
import type { IBoundRectNoAngle, IViewportInfo, Vector2 } from '../../basics/vector2';
import type { Canvas } from '../../canvas';
import type { UniverRenderingContext } from '../../context';
import type { Engine } from '../../engine';
import type { Scene } from '../../scene';
import type { SceneViewer } from '../../scene-viewer';
import { Documents } from '../docs/document';
import { SpreadsheetExtensionRegistry } from '../extension';
import type { Background } from './extensions/background';
import type { Border } from './extensions/border';
import type { Font } from './extensions/font';

// import type { BorderCacheItem } from './interfaces';
import { SheetComponent } from './sheet-component';
import type { SpreadsheetSkeleton } from './sheet-skeleton';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';

export class Spreadsheet extends SheetComponent {
    private _backgroundExtension!: Background;

    private _borderExtension!: Border;

    private _fontExtension!: Font;

    private _refreshIncrementalState = false;

    private _forceDirty = false;

    private _dirtyBounds: IBoundRectNoAngle[] = [];

    private _forceDisableGridlines = false;

    private _documents: Documents = new Documents(OBJECT_KEY, undefined, {
        pageMarginLeft: 0,
        pageMarginTop: 0,
    });

    isPrinting = false;

    constructor(
        oKey: string,
        spreadsheetSkeleton?: SpreadsheetSkeleton,
        private _allowCache: boolean = true
    ) {
        super(oKey, spreadsheetSkeleton);
        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get backgroundExtension() {
        return this._backgroundExtension;
    }

    get borderExtension() {
        return this._borderExtension;
    }

    get fontExtension() {
        return this._fontExtension;
    }

    override getDocuments() {
        return this._documents;
    }

    get allowCache() {
        return this._allowCache;
    }

    get forceDisableGridlines() {
        return this._forceDisableGridlines;
    }

    /**
     * TODO: DR-Univer, fix as unknown as
     */
    override dispose() {
        super.dispose();
        this._documents.dispose();
        this._documents = null as unknown as Documents;
        // cacheCanvas 已经移动到 viewport 中了, cacheCanvas 的 dispose 在 viewport@dispose 中处理
        // this._cacheCanvas?.dispose();
        // this._cacheCanvas = null as unknown as Canvas;
        this._backgroundExtension = null as unknown as Background;
        this._borderExtension = null as unknown as Border;
        this._fontExtension = null as unknown as Font;
    }

    override draw(ctx: UniverRenderingContext, viewportInfo: IViewportInfo) {
        // const { parent = { scaleX: 1, scaleY: 1 } } = this;
        // const mergeData = this.getMergeData();
        // const showGridlines = this.getShowGridlines() || 1;
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }

        const parentScale = this.getParentScale();

        const diffRanges = this._refreshIncrementalState && viewportInfo?.diffBounds
            ? viewportInfo?.diffBounds?.map((bound) => spreadsheetSkeleton.getRowColumnSegmentByViewBound(bound))
            : undefined;
        const viewRanges = [spreadsheetSkeleton.getRowColumnSegmentByViewBound(viewportInfo?.cacheBound)];
        const extensions = this.getExtensionsByOrder();

        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton, diffRanges, {
                viewRanges,
                diffRanges,
                checkOutOfViewBound: viewportInfo.allowCache,
            });
        }
    }

    override isHit(coord: Vector2) {
        const oCoord = this._getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        if (oCoord.x > rowHeaderWidth && oCoord.y > columnHeaderHeight) {
            return true;
        }
        return false;
    }

    override getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } =
            spreadsheetSkeleton;

        let { startY, endY, startX, endX } = getCellPositionByIndex(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        startY += columnHeaderHeight;
        endY += columnHeaderHeight;
        startX += rowHeaderWidth;
        endX += rowHeaderWidth;

        return {
            startY,
            endY,
            startX,
            endX,
        };
    }

    override getScrollXYByRelativeCoords(coord: Vector2) {
        const scene = this.getParent() as Scene;
        let x = 0;
        let y = 0;
        const viewPort = scene.getActiveViewportByRelativeCoord(coord);
        if (viewPort) {
            const actualX = viewPort.actualScrollX || 0;
            const actualY = viewPort.actualScrollY || 0;
            x += actualX;
            y += actualY;
        }
        return {
            x,
            y,
        };
    }


    isForceDirty(): boolean {
        return this._forceDirty;
    }

    /**
     * canvas resize & zoom would call forceDirty
     * @param state
     */
    makeForceDirty(state = true) {
        this._forceDirty = state;
    }

    setForceDisableGridlines(disabled: boolean) {
        this._forceDisableGridlines = disabled;
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return this.getSkeleton()?.getMergeBounding(startRow, startColumn, endRow, endColumn);
    }

    /**
     * canvas resize 并不会调用此函数
     * resize 调用的是 forceDirty
     * @param state
     * @returns
     */
    override makeDirty(state: boolean = true) {
        super.makeDirty(state);
        if (state === false) {
            this._dirtyBounds = [];
        }
        return this;
    }

    setDirtyArea(dirtyBounds: IBoundRectNoAngle[]) {
        this._dirtyBounds = dirtyBounds;
    }

    renderByViewport(mainCtx: UniverRenderingContext, viewportBoundsInfo: IViewportInfo, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { diffBounds, diffX, diffY, viewPortPosition, isDirty, isForceDirty, cacheCanvas, leftOrigin, topOrigin, bufferEdgeX, bufferEdgeY } = viewportBoundsInfo as Required<IViewportInfo>;
        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const { a: scaleX = 1, d: scaleY = 1 } = mainCtx.getTransform();
        const bufferEdgeSizeX = bufferEdgeX * scaleX / window.devicePixelRatio;
        const bufferEdgeSizeY = bufferEdgeY * scaleY / window.devicePixelRatio;


        const cacheCtx = cacheCanvas.getContext();
        cacheCtx.save();

        const { left, top, right, bottom } = viewPortPosition;

        const dw = right - left + rowHeaderWidth;
        const dh = bottom - top + columnHeaderHeight;


        // 没有滚动
        if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || isForceDirty) {
            if (isDirty || isForceDirty) {
                this.refreshCacheCanvas(viewportBoundsInfo, { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY });
            }
            this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);
        } else {
            if (isDirty) {
                this.paintNewAreaOfCacheCanvas(viewportBoundsInfo, {
                    cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY, scaleX, scaleY, columnHeaderHeight, rowHeaderWidth,
                });
            }
            this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);
        }
        cacheCtx.restore();
    }

    paintNewAreaOfCacheCanvas(viewportBoundsInfo: IViewportInfo, param: {
        cacheCanvas: Canvas; cacheCtx: UniverRenderingContext; mainCtx: UniverRenderingContext;
        topOrigin: number;
        leftOrigin: number;
        bufferEdgeX: number;
        bufferEdgeY: number;
        rowHeaderWidth: number;
        columnHeaderHeight: number;
        scaleX: number;
        scaleY: number;
    }) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY, scaleX, scaleY, columnHeaderHeight, rowHeaderWidth } = param;
        const { shouldCacheUpdate, diffCacheBounds, diffX, diffY } = viewportBoundsInfo;

        cacheCtx.save();
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.globalCompositeOperation = 'copy';
        cacheCtx.drawImage(cacheCanvas.getCanvasEle(), diffX * scaleX, diffY * scaleY);
        cacheCtx.restore();

        this._refreshIncrementalState = true;

        // 绘制之前重设画笔位置到 spreadsheet 原点, 当没有滚动时, 这个值是 (rowHeaderWidth, colHeaderHeight)
        const m = mainCtx.getTransform();
        cacheCtx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);
        if (shouldCacheUpdate) {
            for (const diffBound of diffCacheBounds) {
                cacheCtx.save();

                const { left: diffLeft, right: diffRight, bottom: diffBottom, top: diffTop } = diffBound;

                // this.draw 的时候 ctx.translate 单元格偏移是相对 spreadsheet content
                // 但是 diffBounds 包括 rowHeader 信息, 因此绘制前需要减去行头列头的偏移
                const onePixelFix = FIX_ONE_PIXEL_BLUR_OFFSET * 0;
                const x = diffLeft - rowHeaderWidth - onePixelFix;
                const y = diffTop - columnHeaderHeight - onePixelFix;
                const w = diffRight - diffLeft + onePixelFix;
                const h = diffBottom - diffTop + onePixelFix;
                cacheCtx.rect(x, y, w, h);
                // 使用 clearRect 后, 很浅很细的白色线(even not zoom has blank line)
                // cacheCtx.save();
                // const m = cacheCtx.getTransform();
                // cacheCtx.setTransform(1, 0, 0, 1, m.e, m.f);
                // cacheCtx.clearRect(Math.ceil(x * m.a), y * m.a, Math.floor(w * m.a), h * m.a);
                // cacheCtx.restore();

                // 这里需要 clip 的原因是避免重复绘制 (否则文字有毛刺)
                cacheCtx.clip();
                this.draw(cacheCtx, {
                    ...viewportBoundsInfo,
                    diffBounds: [diffBound],
                });
                cacheCtx.restore();
            }
        }
        this._refreshIncrementalState = false;
    }


    /**
     * 整个 viewport 重绘
     */
    refreshCacheCanvas(viewportBoundsInfo: IViewportInfo, param: {
        cacheCanvas: Canvas; cacheCtx: UniverRenderingContext; mainCtx: UniverRenderingContext;
        topOrigin: number;
        leftOrigin: number;
        bufferEdgeX: number;
        bufferEdgeY: number;
    }) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY } = param;
        cacheCtx.save();
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCanvas.clear();
        cacheCtx.restore();

        cacheCtx.save();
        // 所以 cacheCtx.setTransform 已经包含了 rowHeaderWidth + viewport + scroll 距离
        const m = mainCtx.getTransform();
        cacheCtx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

        // leftOrigin 是 viewport 相对 sheetcorner 的偏移(不考虑缩放)
        // - (leftOrigin - bufferEdgeX)  ----> 简化
        cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);

        // extension 绘制时按照内容的左上角计算, 不考虑 rowHeaderWidth
        this.draw(cacheCtx, viewportBoundsInfo);
        cacheCtx.restore();
    }

    override render(mainCtx: UniverRenderingContext, viewportInfo: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        const spreadsheetSkeleton = this.getSkeleton();

        if (!spreadsheetSkeleton) {
            return;
        }

        spreadsheetSkeleton.calculateWithoutClearingCache(viewportInfo);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (
            (segment.startRow === -1 && segment.endRow === -1) ||
                (segment.startColumn === -1 && segment.endColumn === -1)
        ) {
            return;
        }

        mainCtx.save();


        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        mainCtx.translateWithPrecision(rowHeaderWidth, columnHeaderHeight);

        this._drawAuxiliary(mainCtx, viewportInfo);

        const { viewPortKey } = viewportInfo;
            // scene --> layer, getObjects --> viewport.render(object) --> spreadsheet
            // zIndex 0 spreadsheet  this.getObjectsByOrder() ---> [spreadsheet]
            // zIndex 2 rowHeader & colHeader & freezeBorder this.getObjectsByOrder() ---> [SpreadsheetRowHeader, SpreadsheetColumnHeader, _Rect]
            // zIndex 3 selection  this.getObjectsByOrder() ---> [group]

            // SpreadsheetRowHeader SpreadsheetColumnHeader 并不在 spreadsheet 中处理
        if (['viewMain', 'viewMainLeftTop', 'viewMainTop', 'viewMainLeft'].includes(viewPortKey)) {
            if (viewportInfo && viewportInfo.cacheCanvas) {
                this.renderByViewport(mainCtx, viewportInfo, spreadsheetSkeleton);
            } else {
                this._draw(mainCtx, viewportInfo);
            }
        }

        mainCtx.restore();
        return this;
    }

    /**
     *
     * @param mainCtx
     * @param cacheCanvas Source Image
     * @param sx
     * @param sy
     * @param sw
     * @param sh
     * @param dx
     * @param dy
     * @param dw
     * @param dh
     * @returns
     */
    protected _applyCacheFreeze(
        mainCtx: UniverRenderingContext,
        cacheCanvas: Canvas,
        sx: number = 0,
        sy: number = 0,
        sw: number = 0,
        sh: number = 0,
        dx: number = 0,
        dy: number = 0,
        dw: number = 0,
        dh: number = 0
    ) {
        if (!mainCtx) {
            return;
        }

        const pixelRatio = cacheCanvas.getPixelRatio();
        const cacheCtx = cacheCanvas.getContext();
        cacheCtx.save();
        mainCtx.save();
        mainCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        mainCtx.globalCompositeOperation = 'source-over';
        mainCtx.drawImage(
            cacheCanvas.getCanvasEle(),
            sx * pixelRatio,
            sy * pixelRatio,
            sw * pixelRatio,
            sh * pixelRatio,
            dx * pixelRatio,
            dy * pixelRatio,
            dw * pixelRatio,
            dh * pixelRatio
        );
        mainCtx.restore();
        cacheCtx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        this.draw(ctx, bounds);
    }

    private _getAncestorSize() {
        const parent = this._getAncestorParent();
        if (!parent) {
            return;
        }

        if (parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            const mainCanvas = (parent as Engine).getCanvas();
            return {
                width: mainCanvas.getWidth(),
                height: mainCanvas.getHeight(),
            };
        }
        if (parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            return {
                width: parent.width,
                height: parent.height,
            };
        }
    }

    private _getAncestorParent(): Nullable<Engine | SceneViewer> {
        let parent: any = this.parent;
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.ENGINE || parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                return parent as Nullable<Engine | SceneViewer>;
            }
            parent = parent?.getParent && parent?.getParent();
        }
    }

    private _initialDefaultExtension() {
        SpreadsheetExtensionRegistry.getData()
            .sort(sortRules)
            .forEach((Extension) => {
                this.register(new Extension());
            });
        // this._borderAuxiliaryExtension = this.getExtensionByKey('DefaultBorderAuxiliaryExtension') as BorderAuxiliary;
        this._backgroundExtension = this.getExtensionByKey('DefaultBackgroundExtension') as Background;
        this._borderExtension = this.getExtensionByKey('DefaultBorderExtension') as Border;
        this._fontExtension = this.getExtensionByKey('DefaultFontExtension') as Font;
    }

    /**
     * draw gridlines
     * @param ctx
     * @param bounds
     * @returns
     */
    private _drawAuxiliary(ctx: UniverRenderingContext, bounds?: IViewportInfo) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (spreadsheetSkeleton == null) {
            return;
        }

        const { rowColumnSegment, dataMergeCache, overflowCache, stylesCache, showGridlines } = spreadsheetSkeleton;
        const { border, backgroundPositions } = stylesCache;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE || this._forceDisableGridlines) {
            return;
        }

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;
        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }
        ctx.save();

        ctx.setLineWidthByPrecision(1);

        ctx.strokeStyle = getColor([212, 212, 212]);

        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        const EXTRA_BOUND = 0.4;
        const rowCount = endRow - startRow + 1;
        const columnCount = endColumn - startColumn + 1;
        const extraRowCount = Math.ceil(rowCount * EXTRA_BOUND);
        const extraColumnCount = Math.ceil(columnCount * EXTRA_BOUND);

        const rowStart = Math.max(Math.floor(startRow - extraRowCount), 0);
        const rowEnd = Math.min(Math.ceil(endRow + extraRowCount), rowHeightAccumulationLength - 1);
        const columnEnd = Math.min(Math.ceil(endColumn + (extraColumnCount)), columnWidthAccumulationLength - 1);
        const columnStart = Math.max(Math.floor(startColumn - (extraColumnCount)), 0);

        const startX = columnWidthAccumulation[columnStart - 1] || 0;
        const startY = rowHeightAccumulation[rowStart - 1] || 0;
        const endX = columnWidthAccumulation[columnEnd];
        const endY = rowHeightAccumulation[rowEnd];
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        ctx.beginPath();
        ctx.moveToByPrecision(startX, startY);
        ctx.lineToByPrecision(endX, startY);

        ctx.moveToByPrecision(startX, startY);
        ctx.lineToByPrecision(startX, endY);

        ctx.closePathByEnv();
        ctx.stroke();

        for (let r = rowStart; r <= rowEnd; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            ctx.beginPath();
            ctx.moveToByPrecision(startX, rowEndPosition);
            ctx.lineToByPrecision(endX, rowEndPosition);
            ctx.closePathByEnv();
            ctx.stroke();
        }

        for (let c = columnStart; c <= columnEnd; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = columnWidthAccumulation[c];
            ctx.beginPath();
            ctx.moveToByPrecision(columnEndPosition, startY);
            ctx.lineToByPrecision(columnEndPosition, endY);
            ctx.closePathByEnv();
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: UniverRenderingContext,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache?: IRange[]
    ) {
        if (dataMergeCache == null) {
            return;
        }
        for (const dataCache of dataMergeCache) {
            const { startRow, endRow, startColumn, endColumn } = dataCache;

            const startY = rowHeightAccumulation[startRow - 1] || 0;
            const endY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1];

            const startX = columnWidthAccumulation[startColumn - 1] || 0;
            const endX =
                columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1];

            ctx.clearRectByPrecision(startX, startY, endX - startX, endY - startY);

            // After ClearRect, the lines will become thinner, and the lines will be repaired below.
            ctx.beginPath();
            ctx.moveToByPrecision(startX, startY);
            ctx.lineToByPrecision(endX, startY);
            ctx.lineToByPrecision(endX, endY);
            ctx.lineToByPrecision(startX, endY);
            ctx.lineToByPrecision(startX, startY);
            ctx.stroke();
            ctx.closePath();
        }
    }

    private _clearBackground(ctx: UniverRenderingContext, backgroundPositions?: ObjectMatrix<ISelectionCellWithCoord>) {
        backgroundPositions?.forValue((row, column, cellInfo) => {
            let { startY, endY, startX, endX } = cellInfo;
            const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
            if (isMerged) {
                return true;
            }

            if (isMergedMainCell) {
                startY = mergeInfo.startY;
                endY = mergeInfo.endY;
                startX = mergeInfo.startX;
                endX = mergeInfo.endX;
            }

            ctx.clearRectForTexture(startX, startY, endX - startX + 0.5, endY - startY + 0.5);
        });
    }
}
