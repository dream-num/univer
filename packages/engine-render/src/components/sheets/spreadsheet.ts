/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IPosition, IRange, Nullable } from '@univerjs/core';
import type { IBoundRectNoAngle, IViewportInfo, Vector2 } from '../../basics/vector2';
import type { Canvas } from '../../canvas';
import type { UniverRenderingContext2D } from '../../context';
import type { Engine } from '../../engine';
import type { Scene } from '../../scene';
import type { SceneViewer } from '../../scene-viewer';
import type { IDrawInfo } from '../extension';
import type { Background } from './extensions/background';
import type { Border } from './extensions/border';
import type { Font } from './extensions/font';
import type { IPaintForRefresh, IPaintForScrolling, SHEET_VIEWPORT_KEY } from './interfaces';
import type { SpreadsheetSkeleton } from './sheet.render-skeleton';
import { BooleanNumber, sortRules, Tools } from '@univerjs/core';
import { FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from '../../basics/const';
import { getColor } from '../../basics/tools';
import { Documents } from '../docs/document';
import { SpreadsheetExtensionRegistry } from '../extension';
import { sheetContentViewportKeys, sheetHeaderViewportKeys } from './constants';
import { SHEET_EXTENSION_PREFIX } from './extensions/sheet-extension';
import { SheetComponent } from './sheet-component';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';

export class Spreadsheet extends SheetComponent {
    private _backgroundExtension!: Background;

    private _borderExtension!: Border;

    private _fontExtension!: Font;

    private _refreshIncrementalState = false;

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

    override dispose() {
        super.dispose();
        this._documents?.dispose();

        // TODO: fix memory leak without reassigning these properties
        this._documents = null as unknown as Documents;
        this._backgroundExtension = null as unknown as Background;
        this._borderExtension = null as unknown as Border;
        this._fontExtension = null as unknown as Font;
    }

    /**
     * draw by viewport
     * @param ctx
     * @param viewportInfo
     */
    override draw(ctx: UniverRenderingContext2D, viewportInfo: IViewportInfo) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        this._drawAuxiliary(ctx);
        const parentScale = this.getParentScale();

        const diffRanges = this._refreshIncrementalState && viewportInfo.diffBounds
            ? viewportInfo.diffBounds?.map((bound) => spreadsheetSkeleton.getRangeByViewBound(bound))
            : [];

        const viewRanges = [spreadsheetSkeleton.getCacheRangeByViewport(viewportInfo)];
        const extensions = this.getExtensionsByOrder();
        // At this moment, ctx.transform is at topLeft of sheet content, cell(0, 0)

        const scene = this.getScene();
        for (const extension of extensions) {
            const timeKey = `${SHEET_EXTENSION_PREFIX}${extension.uKey}`;
            const st = Tools.now();
            extension.draw(ctx, parentScale, spreadsheetSkeleton, diffRanges, {
                viewRanges,
                checkOutOfViewBound: true,
                viewportKey: viewportInfo.viewportKey,
                viewBound: viewportInfo.cacheBound,
                diffBounds: viewportInfo.diffBounds,
            } as IDrawInfo);
            this.addRenderFrameTimeMetricToScene(timeKey, Tools.now() - st, scene);
        }
    }

    addRenderFrameTimeMetricToScene(timeKey: string, val: number, scene: Scene) {
        scene = scene ?? this.getScene();
        // scene?.addRenderFrameTimeMetric(timeKey, val);
        const engine = scene.getEngine() as Engine;
        engine.renderFrameTimeMetric$.next([timeKey, val]);
    }

    addRenderTagToScene(renderKey: string, val: any, scene?: Scene) {
        scene = scene ?? this.getScene();
        const engine = scene.getEngine() as Engine;
        engine.renderFrameTags$.next([renderKey, val]);
        // scene?.addRenderFrameTags(timeKey, val);
    }

    /**
     * override for return type as Scene.
     * @returns Scene
     */
    override getScene() {
        return super.getScene() as Scene;
    }

    override isHit(coord: Vector2) {
        const oCoord = this.getInverseCoord(coord);
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

    override getNoMergeCellPositionByIndex(rowIndex: number, columnIndex: number): IPosition {
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return { startX: 0, startY: 0, endX: 0, endY: 0 };
        }
        return skeleton.getNoMergeCellWithCoordByIndex(rowIndex, columnIndex);
        // const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } =
        //     spreadsheetSkeleton;

        // let { startY, endY, startX, endX } = getCellWithCoordByIndexCore(
        //     rowIndex,
        //     columnIndex,
        //     rowHeightAccumulation,
        //     columnWidthAccumulation
        // );

        // startY += columnHeaderHeight;
        // endY += columnHeaderHeight;
        // startX += rowHeaderWidth;
        // endX += rowHeaderWidth;

        // return {
        //     startY,
        //     endY,
        //     startX,
        //     endX,
        // };
    }

    override getScrollXYByRelativeCoords(coord: Vector2) {
        const scene = this.getParent() as Scene;
        let x = 0;
        let y = 0;
        const viewPort = scene.findViewportByPosToScene(coord);
        if (viewPort) {
            const actualX = viewPort.viewportScrollX || 0;
            const actualY = viewPort.viewportScrollY || 0;
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
    override makeForceDirty(state = true) {
        this.makeDirty(state);
        this._forceDirty = state;
    }

    setForceDisableGridlines(disabled: boolean) {
        this._forceDisableGridlines = disabled;
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return this.getSkeleton()?.expandRangeByMerge({ startRow, startColumn, endRow, endColumn });
    }

    /**
     * Since multiple controllers, not just the sheet-render.controller, invoke spreadsheet.makeDirty() — for instance, the cf.render-controller — it's essential to also call viewport.markDirty() whenever spreadsheet.makeDirty() is triggered.
     * @param state
     */
    override makeDirty(state: boolean = true) {
        (this.getParent() as Scene)?.getViewports().forEach((vp) => vp.markDirty(state));
        super.makeDirty(state);
        if (state === false) {
            this._dirtyBounds = [];
        }
        return this;
    }

    setDirtyArea(dirtyBounds: IBoundRectNoAngle[]) {
        this._dirtyBounds = dirtyBounds;
    }

    renderByViewports(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { diffBounds, diffX, diffY, viewPortPosition, cacheCanvas, leftOrigin, topOrigin, bufferEdgeX, bufferEdgeY, isDirty: isViewportDirty, isForceDirty: isViewportForceDirty } = viewportInfo as Required<IViewportInfo>;
        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const { a: scaleX = 1, d: scaleY = 1 } = mainCtx.getTransform();
        const bufferEdgeSizeX = bufferEdgeX * scaleX / window.devicePixelRatio;
        const bufferEdgeSizeY = bufferEdgeY * scaleY / window.devicePixelRatio;

        const cacheCtx = cacheCanvas.getContext();
        cacheCtx.save();

        const isForceDirty = isViewportForceDirty || this.isForceDirty();
        const isDirty = isViewportDirty || this.isDirty();
        if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || isForceDirty || isDirty) {
            if (isDirty || isForceDirty) {
                this.addRenderTagToScene('scrolling', false);
                this.refreshCacheCanvas(viewportInfo, { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY });
            }
        } else if (diffBounds.length !== 0 || diffX !== 0 || diffY !== 0) {
            // scrolling && no dirty
            this.addRenderTagToScene('scrolling', true);
            this.paintNewAreaForScrolling(viewportInfo, {
                cacheCanvas,
                cacheCtx,
                mainCtx,
                topOrigin,
                leftOrigin,
                bufferEdgeX,
                bufferEdgeY,
                scaleX,
                scaleY,
                columnHeaderHeight,
                rowHeaderWidth,
            });
        }
        // support for browser native zoom (only windows has this problem)
        const sourceLeft = bufferEdgeSizeX * Math.min(1, window.devicePixelRatio);
        const sourceTop = bufferEdgeSizeY * Math.min(1, window.devicePixelRatio);
        const { left, top, right, bottom } = viewPortPosition;
        const dw = right - left + rowHeaderWidth;
        const dh = bottom - top + columnHeaderHeight;
        this._applyCache(cacheCanvas, mainCtx, sourceLeft, sourceTop, dw, dh, left, top, dw, dh);
        cacheCtx.restore();
    }

    paintNewAreaForScrolling(viewportInfo: IViewportInfo, param: IPaintForScrolling) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY, scaleX, scaleY, columnHeaderHeight, rowHeaderWidth } = param;
        const { shouldCacheUpdate, diffCacheBounds, diffX, diffY } = viewportInfo;
        cacheCtx.save();
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.globalCompositeOperation = 'copy';
        cacheCtx.drawImage(cacheCanvas.getCanvasEle(), diffX * scaleX, diffY * scaleY);
        cacheCtx.restore();

        this._refreshIncrementalState = true;
        // Reset the ctx position to the spreadsheet content origin before drawing.
        // trasnlation should be (rowHeaderWidth, colHeaderHeight) at start.
        const m = mainCtx.getTransform();
        cacheCtx.setTransform(m.a, m.b, m.c, m.d, 0, 0);

        // leftOrigin 是 viewport 相对 sheetcorner 的偏移(不考虑缩放)
        // - (leftOrigin - bufferEdgeX)  ----> 简化  - leftOrigin + bufferEdgeX
        cacheCtx.translateWithPrecision(m.e / m.a - leftOrigin + bufferEdgeX, m.f / m.d - topOrigin + bufferEdgeY);

        if (shouldCacheUpdate) {
            for (const diffBound of diffCacheBounds) {
                const { left: diffLeft, right: diffRight, bottom: diffBottom, top: diffTop } = diffBound;

                // this.draw 的时候 ctx.translate 单元格偏移是相对 spreadsheet content
                // 但是 diffBounds 包括 rowHeader columnWidth, 因此绘制前需要减去行头列头的偏移
                const x = diffLeft - rowHeaderWidth;
                const y = diffTop - columnHeaderHeight;
                const w = diffRight - diffLeft;
                const h = diffBottom - diffTop; // w h 必须精确和 diffarea 大小匹配, 否则会造成往回滚时, clear 的区域过大, 导致上一帧有效内容被擦除

                cacheCtx.clearRectByPrecision(x, y, w, h);
                // cacheCtx.fillStyle = this.testGetRandomLightColor();
                // cacheCtx.fillRectByPrecision(x, y, w, h); // x, y is diffBounds, means it's relative to scrolling distance.

                cacheCtx.save();
                cacheCtx.beginPath();
                cacheCtx.rectByPrecision(x, y, w, h);
                cacheCtx.closePath();
                // The reason for clipping here is to avoid duplicate drawing (otherwise the text would be jagged, especially on Windows)
                cacheCtx.clip();
                this.draw(cacheCtx, {
                    ...viewportInfo,
                    diffBounds: [diffBound],
                });
                cacheCtx.restore();
            }
        }

        // this.testShowRuler(cacheCtx, viewportInfo);
        this._refreshIncrementalState = false;
    }

    /**
     * Redraw the entire viewport.
     */
    refreshCacheCanvas(viewportInfo: IViewportInfo, param: IPaintForRefresh) {
        const { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY } = param;
        cacheCtx.save();
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCanvas.clear();
        cacheCtx.restore();

        cacheCtx.save();
        // cacheCtx.setTransform is rowHeaderWidth + viewport + scroll
        const m = mainCtx.getTransform();
        // cacheCtx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        cacheCtx.setTransform(m.a, m.b, m.c, m.d, 0, 0);

        // The 'leftOrigin' is the offset of the viewport relative to the sheet corner, which is the position of cell(0, 0), and it does not consider scaling.
        // - (leftOrigin - bufferEdgeX)  ----> - leftOrigin + bufferEdgeX
        cacheCtx.translateWithPrecision(m.e / m.a - leftOrigin + bufferEdgeX, m.f / m.d - topOrigin + bufferEdgeY);
        // when extension drawing, sheet content coordinate was used by sheet extension, not viewport coordinate, that means ext does not take rowheader into consideration
        this.draw(cacheCtx, viewportInfo);
        cacheCtx.restore();
    }

    override render(mainCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        const spreadsheetSkeleton = this.getSkeleton();

        if (!spreadsheetSkeleton) {
            return;
        }
        spreadsheetSkeleton.setStylesCache(viewportInfo);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (!segment) {
            return;
        }

        if (
            (segment.startRow === -1 && segment.endRow === -1) ||
            (segment.startColumn === -1 && segment.endColumn === -1)
        ) {
            return;
        }

        mainCtx.save();

        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        mainCtx.translateWithPrecision(rowHeaderWidth, columnHeaderHeight);

        this.getScene()?.updateTransformerZero(spreadsheetSkeleton.rowHeaderWidth, spreadsheetSkeleton.columnHeaderHeight);

        const { viewportKey } = viewportInfo;
        // scene --> layer, getObjects --> viewport.render(object) --> spreadsheet
        // SHEET_COMPONENT_MAIN_LAYER_INDEX = 0;
        // SHEET_COMPONENT_SELECTION_LAYER_INDEX = 1;
        // SHEET_COMPONENT_HEADER_LAYER_INDEX = 10;
        // SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX = 11;
        // ......
        // SHEET_COMPONENT_MAIN_LAYER_INDEX spreadsheet  this.getObjectsByOrder() ---> [spreadsheet]
        // SHEET_COMPONENT_HEADER_LAYER_INDEX rowHeader & colHeader & freezeBorder this.getObjectsByOrder() ---> [SpreadsheetRowHeader, SpreadsheetColumnHeader, _Rect..., HeaderMenuResizeShape]
        // SHEET_COMPONENT_HEADER_SELECTION_LAYER_INDEX selection  this.getObjectsByOrder() ---> [_Rect, Group]

        // SpreadsheetRowHeader SpreadsheetColumnHeader is not render by spreadsheet
        if (sheetContentViewportKeys.includes(viewportKey as SHEET_VIEWPORT_KEY)) {
            if (viewportInfo && viewportInfo.cacheCanvas) {
                this.renderByViewports(mainCtx, viewportInfo, spreadsheetSkeleton);
            } else {
                this._draw(mainCtx, viewportInfo);
            }
        } else if (sheetHeaderViewportKeys.includes(viewportKey as SHEET_VIEWPORT_KEY)) {
            // doing nothing, other components(SpreadsheetRowHeader...) will render
        } else {
            // embed in doc & slide
            // now there are bugs in embed mode with cache on, 3f12ad80188a83283bcd95c65e6c5dcc2d23ad72
            if (viewportInfo && viewportInfo.cacheCanvas) {
                this.renderByViewports(mainCtx, viewportInfo, spreadsheetSkeleton);
            } else {
                this._draw(mainCtx, viewportInfo);
            }
        }
        mainCtx.restore();
        return this;
    }

    /**
     * applyCache from cache canvas
     * @param cacheCanvas Source Image
     * @param ctx MainCtx
     * @param sx
     * @param sy
     * @param sw
     * @param sh
     * @param dx
     * @param dy
     * @param dw
     * @param dh
     */
    protected _applyCache(
        cacheCanvas: Canvas,
        ctx: UniverRenderingContext2D,
        sx: number = 0,
        sy: number = 0,
        sw: number = 0,
        sh: number = 0,
        dx: number = 0,
        dy: number = 0,
        dw: number = 0,
        dh: number = 0
    ) {
        if (!ctx) {
            return;
        }

        const pixelRatio = cacheCanvas.getPixelRatio();
        const cacheCtx = cacheCanvas.getContext();
        cacheCtx.save();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
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
        ctx.restore();
        cacheCtx.restore();
    }

    protected override _draw(ctx: UniverRenderingContext2D, bounds?: IViewportInfo) {
        this.draw(ctx, bounds!);
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
        this._backgroundExtension = this.getExtensionByKey('DefaultBackgroundExtension') as Background;
        this._borderExtension = this.getExtensionByKey('DefaultBorderExtension') as Border;
        this._fontExtension = this.getExtensionByKey('DefaultFontExtension') as Font;
    }

    /**
     * draw gridlines
     * @param ctx
     */
    // eslint-disable-next-line max-lines-per-function
    private _drawAuxiliary(ctx: UniverRenderingContext2D) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (spreadsheetSkeleton == null) {
            return;
        }

        const { rowColumnSegment, overflowCache, showGridlines, gridlinesColor } = spreadsheetSkeleton;
        const mergeCellRanges = spreadsheetSkeleton.getCurrentRowColumnSegmentMergeData(rowColumnSegment);
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

        ctx.strokeStyle = gridlinesColor ?? ctx.renderConfig.gridlinesColor ?? getColor([214, 216, 219]);

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

        //#region draw horizontal lines
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
        //#endregion

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
        //#endregion

        // clear line of merge cell
        this._clearRectangle(ctx, rowHeightAccumulation, columnWidthAccumulation, mergeCellRanges);

        // clear line of overflow cell
        this._clearRectangle(ctx, rowHeightAccumulation, columnWidthAccumulation, overflowCache.toNativeArray());

        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: UniverRenderingContext2D,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        cellRanges?: IRange[]
    ) {
        if (cellRanges == null) {
            return;
        }
        for (const range of cellRanges) {
            const { startRow, endRow, startColumn, endColumn } = range;

            const startY = rowHeightAccumulation[startRow - 1] ?? 0;
            const endY = rowHeightAccumulation[endRow] ?? rowHeightAccumulation[rowHeightAccumulation.length - 1];

            const startX = columnWidthAccumulation[startColumn - 1] ?? 0;
            const endX =
                columnWidthAccumulation[endColumn] ?? columnWidthAccumulation[columnWidthAccumulation.length - 1];

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

    testShowRuler(cacheCtx: UniverRenderingContext2D, viewportInfo: IViewportInfo): void {
        const { cacheBound } = viewportInfo;
        const spreadsheetSkeleton = this.getSkeleton()!;
        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const { left, top, right, bottom } = cacheBound;
        const findClosestHundred = (number: number) => {
            const remainder = number % 100;
            return number + (100 - remainder);
        };
        const startX = findClosestHundred(left);
        const endX = findClosestHundred(right);
        const startY = findClosestHundred(top);
        const endY = findClosestHundred(bottom);
        cacheCtx.save();
        cacheCtx.beginPath();
        cacheCtx.strokeStyle = '#000000';
        cacheCtx.fillStyle = '#000000';
        cacheCtx.font = '16px Arial';
        cacheCtx.lineWidth = 1;
        cacheCtx.textAlign = 'center';
        cacheCtx.textBaseline = 'middle';

        for (let i = startX; i <= endX; i += 50) {
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = (i % 100 === 0) ? 'red' : '#aaa';
            cacheCtx.moveTo(i - rowHeaderWidth, top - columnHeaderHeight);
            cacheCtx.lineTo(i - rowHeaderWidth, bottom - columnHeaderHeight);
            cacheCtx.stroke();
            cacheCtx.closePath();
        }
        for (let j = startY; j <= endY; j += 50) {
            cacheCtx.beginPath();
            cacheCtx.strokeStyle = (j % 100 === 0) ? 'red' : '#aaa';
            cacheCtx.moveTo(left - rowHeaderWidth, j - columnHeaderHeight);
            cacheCtx.lineTo(right - rowHeaderWidth, j - columnHeaderHeight);
            cacheCtx.stroke();
            cacheCtx.closePath();
        }
        cacheCtx.fillStyle = '#666';
        for (let i = startX; i <= endX; i += 100) {
            for (let j = startY; j <= endY; j += 100) {
                cacheCtx.fillText(`${i},${j}`, i - rowHeaderWidth, j - columnHeaderHeight);
            }
        }
        // start
        // cacheCtx.textAlign = 'left';
        // for (let j = startY; j <= endY; j += 100) {
        //     cacheCtx.clearRect(left - rowHeaderWidth, j - columnHeaderHeight - 15, 30, 30);
        //     cacheCtx.fillText(`${left}`, left - rowHeaderWidth, j - columnHeaderHeight);
        // }
        cacheCtx.closePath();
        cacheCtx.restore();
    }

    testGetRandomLightColor(): string {
        const letters = 'ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 6)];
        }

        const r = Number.parseInt(color.substring(1, 3), 16);
        const g = Number.parseInt(color.substring(3, 5), 16);
        const b = Number.parseInt(color.substring(5, 7), 16);
        if (r + g + b < 610) {
            return this.testGetRandomLightColor();
        }

        return color;
    }
}
