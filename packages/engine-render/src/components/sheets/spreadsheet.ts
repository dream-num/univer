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

import type { BaseObject } from '../../base-object';

import { FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from '../../basics/const';

// import { clearLineByBorderType } from '../../basics/draw';
import { getCellPositionByIndex, getColor } from '../../basics/tools';
import type { IBoundRectNoAngle, IViewportInfo, Vector2 } from '../../basics/vector2';
import { Canvas } from '../../canvas';
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

    private _cacheCanvas!: Canvas;
    private _cacheCanvasTop!: Canvas;
    private _cacheCanvasLeft!: Canvas;
    private _cacheCanvasLeftTop!: Canvas;
    private _cacheCanvasMap: Map<string, Canvas> = new Map();

    /**
     * 增量更新
     */
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
        if (this._allowCache) {

            this.onIsAddedToParentObserver.add((parent) => {
                // (parent as Scene)?.getEngine()?.onTransformChangeObservable.add(() => {
                //     this._resizeCacheCanvas();
                // });
                // this._resizeCacheCanvas();
                // this._addMakeDirtyToScroll();

                // (parent as Scene)?.getViewports().forEach(vp => vp.makeDirty());
                window.scene = parent;

            });
        }

        this._initialDefaultExtension();
        this.makeDirty(true);

        window.spreadsheet = this;
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
        this._cacheCanvas?.dispose();
        this._cacheCanvas = null as unknown as Canvas;
        this._backgroundExtension = null as unknown as Background;
        this._borderExtension = null as unknown as Border;
        this._fontExtension = null as unknown as Font;
    }

    override draw(ctx: UniverRenderingContext, bounds?: IViewportBound) {
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

        if((viewportInfo?.viewPortKey === 'viewMain' || viewportInfo?.viewPortKey === 'viewMainLeft')) {
            // console.log(bounds?.viewPortKey, 'diffRange count', diffRanges.length, 'diffY StartRow', diffRanges[0].startRow, 'diffY startColumn', diffRanges[0].startColumn , ':::::height', diffRanges[0].endRow - diffRanges[0].startRow,':::::width', diffRanges[0].endColumn - diffRanges[0].startColumn);
            console.log(viewportInfo?.viewPortKey, ' ranges', viewRanges[0],'diffRanges', diffRanges, 'bounds', viewportInfo?.cacheBound, viewportInfo?.viewBound);
        }

        const timeKey = `diffRange ${viewportInfo?.viewPortKey}!!ext!!`;
        console.time(timeKey);
        for (const extension of extensions) {
            const timeKey = `${viewportInfo?.viewPortKey}!!ext!!${extension.uKey}`;
            console.time(timeKey);
            extension.draw(ctx, parentScale, spreadsheetSkeleton, {
                viewRanges,
                diffRanges,
                checkOutOfViewBound: viewportInfo.allowCache, //!!bounds!.cacheCanvas,
            });
            console.timeEnd(timeKey);
        }
        console.timeEnd(timeKey);
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

        // this.onPointerDownObserver.add((evt) => {
        //     evt.offsetX;
        // });
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
     * canvas resize & zoom
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
        if(state === false) {
            this._dirtyBounds = [];
        }
        return this;
    }

    setDirtyArea(dirtyBounds: IBoundRectNoAngle[]) {
        this._dirtyBounds = dirtyBounds;
    }

    renderByViewport(mainCtx: UniverRenderingContext, viewportBoundsInfo: IViewportInfo, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { viewBound, cacheBound: cacheBounds, diffBounds, diffCacheBounds, diffX, diffY, viewPortPosition, viewPortKey, isDirty, isForceDirty, shouldCacheUpdate, cacheCanvas, leftOrigin, topOrigin, bufferEdgeX, bufferEdgeY } = viewportBoundsInfo as Required<IViewportInfo>;
        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;
        const { a: scaleX = 1, d: scaleY = 1 } = mainCtx.getTransform();
        const bufferEdgeSizeX = bufferEdgeX * scaleX / window.devicePixelRatio;
        const bufferEdgeSizeY = bufferEdgeY * scaleY / window.devicePixelRatio;
        // mainCtx this._scene.getEngine()?.getCanvas().getContext();


        if (viewPortKey === 'viewMain') {
            const cacheCtx = cacheCanvas.getContext();
            cacheCtx.save();

            //
            const { left, top, right, bottom } = viewPortPosition;

            const dw = right - left + rowHeaderWidth;
            const dh = bottom - top + columnHeaderHeight;


            // 没有滚动
            if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || isForceDirty) {
                if (isDirty || isForceDirty) {
                    cacheCtx.save();
                    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                    cacheCanvas.clear();
                    cacheCtx.restore();

                    cacheCtx.save();
                    // mainCtx.translateWithPrecision(rowHeaderWidth, columnHeaderHeight);
                    // 所以 cacheCtx.setTransform 已经包含了 rowHeaderWidth + viewport + scroll 距离
                    const m = mainCtx.getTransform();
                    cacheCtx.setTransform(m.a,m.b, m.c, m.d, m.e, m.f);

                    // leftOrigin 是 viewport 相对 sheetcorner 的偏移(不考虑缩放)
                    // - (leftOrigin - bufferEdgeX)  ----> 简化
                    cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);

                    // extension 绘制时按照内容的左上角计算, 不考虑 rowHeaderWidth
                    this.draw(cacheCtx, viewportBoundsInfo);


                    cacheCtx.restore();
                }
                this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);
            } else {
                if( isDirty ){

                    cacheCtx.save();
                    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                    cacheCtx.globalCompositeOperation = 'copy';
                    cacheCtx.drawImage(cacheCanvas.getCanvasEle(), diffX * scaleX, diffY * scaleY);
                    cacheCtx.restore();

                    this._refreshIncrementalState = true;

                    // 绘制之前重设画笔位置到 spreadsheet 原点, 当没有滚动时, 这个值是 (rowHeaderWidth, colHeaderHeight)
                    cacheCtx.setTransform(mainCtx.getTransform());
                    cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);


                    console.time('!!!viewMain_render_222---222');
                    if (shouldCacheUpdate) {

                        for (const diffBound of diffCacheBounds) {
                            cacheCtx.save();

                            let { left: diffLeft, right: diffRight, bottom: diffBottom, top: diffTop } = diffBound;
                            cacheCtx.beginPath();

                            // 再次注意!  draw 的时候 ctx.translate 单元格偏移是相对 spreadsheet content
                            // 不考虑 rowHeaderWidth
                            // 但是 diffBounds 是包括 rowHeader 信息
                            diffLeft -= bufferEdgeX; // 必须扩大范围 不然存在空白贴图
                            diffTop -= bufferEdgeY;
                            const x = diffLeft - (rowHeaderWidth) - FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const y = diffTop - columnHeaderHeight - FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const w = diffRight - diffLeft + (rowHeaderWidth) + FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const h = diffBottom - diffTop + columnHeaderHeight + FIX_ONE_PIXEL_BLUR_OFFSET * 2;


                            cacheCtx.rectByPrecision(x, y, w, h);
                            cacheCtx.clip();

                            this.draw(cacheCtx, {
                                ...viewportBoundsInfo,
                                diffBounds: [diffBound],
                            });
                            cacheCtx.restore();
                        }
                    }
                    console.timeEnd('!!!viewMain_render_222---222');
                    this._refreshIncrementalState = false;

                }
                this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);

            }
            cacheCtx.restore();
        } else {
            const cacheCtx = cacheCanvas.getContext();
            cacheCtx.save();
            const { left, top, right, bottom } = viewPortPosition;
            const dw = right - left + rowHeaderWidth;
            const dh = bottom - top + columnHeaderHeight;

            if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || isForceDirty) {
                if (isDirty || isForceDirty || this.isForceDirty()) {
                    cacheCtx.save();
                    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                    cacheCanvas.clear();
                    cacheCtx.restore();

                    cacheCtx.save();
                    cacheCtx.setTransform(mainCtx.getTransform());
                    cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);


                    viewportBoundsInfo.viewBound = viewportBoundsInfo.cacheBound;
                    this._draw(cacheCtx, viewportBoundsInfo);

                    cacheCtx.restore();
                }
                this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);
            } else {
                if(isDirty){
                    cacheCtx.save();
                    cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
                    cacheCtx.globalCompositeOperation = 'copy';
                    cacheCtx.drawImage(cacheCanvas.getCanvasEle(), diffX * scaleX, diffY * scaleY);
                    cacheCtx.restore();

                    this._refreshIncrementalState = true;
                    cacheCtx.setTransform(mainCtx.getTransform());
                    cacheCtx.translate(-leftOrigin + bufferEdgeX, -topOrigin + bufferEdgeY);



                    if (shouldCacheUpdate) {
                        for (const diffBound of diffCacheBounds) {
                            let { left: diffLeft, right: diffRight, bottom: diffBottom, top: diffTop } = diffBound;
                            cacheCtx.save();
                            cacheCtx.beginPath();
                            diffLeft -= bufferEdgeX; // 必须扩大范围 不然存在空白贴图
                            diffTop -= bufferEdgeY;
                            const x = diffLeft - (rowHeaderWidth) - FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const y = diffTop - columnHeaderHeight - FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const w = diffRight - diffLeft + (rowHeaderWidth) + FIX_ONE_PIXEL_BLUR_OFFSET * 2;
                            const h = diffBottom - diffTop + columnHeaderHeight + FIX_ONE_PIXEL_BLUR_OFFSET * 2;


                            cacheCtx.rectByPrecision(x, y, w, h);
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
                this._applyCacheFreeze(mainCtx, cacheCanvas, bufferEdgeSizeX, bufferEdgeSizeY, dw, dh, left, top, dw, dh);
            }
            cacheCtx.restore();
        }

    }

    override render(mainCtx: UniverRenderingContext, viewportInfo: IViewportInfo) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) return;

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
        if(['viewMain', 'viewMainLeftTop', 'viewMainTop', 'viewMainLeft'].includes(viewPortKey)) {
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
        mainCtx.globalCompositeOperation = "source-over";
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
        // console.log('xx2', scaleX, scaleY, columnTotalWidth, rowTotalHeight, rowHeightAccumulation, columnWidthAccumulation);

        // border?.forValue((rowIndex, columnIndex, borderCaches) => {
        //     if (!borderCaches) {
        //         return true;
        //     }

        //     const cellInfo = spreadsheetSkeleton.getCellByIndexWithNoHeader(rowIndex, columnIndex);

        //     let { startY, endY, startX, endX } = cellInfo;
        //     const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

        //     if (isMerged) {
        //         return true;
        //     }

        //     if (isMergedMainCell) {
        //         startY = mergeInfo.startY;
        //         endY = mergeInfo.endY;
        //         startX = mergeInfo.startX;
        //         endX = mergeInfo.endX;
        //     }

        //     if (!(mergeInfo.startRow >= rowStart && mergeInfo.endRow <= rowEnd)) {
        //         return true;
        //     }

        //     for (const key in borderCaches) {
        //         const { type } = borderCaches[key] as BorderCacheItem;

        //         clearLineByBorderType(ctx, type, { startX, startY, endX, endY });
        //     }
        // });

        // Clearing the dashed line issue caused by overlaid auxiliary lines and strokes
        // merge cell
        // this._clearRectangle(ctx, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

        // overflow cell
        // this._clearRectangle(ctx, rowHeightAccumulation, columnWidthAccumulation, overflowCache.toNativeArray());

        // this._clearBackground(ctx, backgroundPositions);

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
