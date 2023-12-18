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

import type { IRange, ISelectionCellWithCoord, Nullable } from '@univerjs/core';
import { BooleanNumber, CellValueType, HorizontalAlign, ObjectMatrix, sortRules, WrapStrategy } from '@univerjs/core';

import type { BaseObject } from '../../base-object';
import { FIX_ONE_PIXEL_BLUR_OFFSET, RENDER_CLASS_TYPE } from '../../basics/const';
import { clearLineByBorderType, getLineWith } from '../../basics/draw';
import { fixLineWidthByScale, getCellByIndex, getCellPositionByIndex, getColor, getScale } from '../../basics/tools';
import type { IViewportBound } from '../../basics/vector2';
import { Vector2 } from '../../basics/vector2';
import { Canvas } from '../../canvas';
import type { Engine } from '../../engine';
import type { Scene } from '../../scene';
import type { SceneViewer } from '../../scene-viewer';
import type { Viewport } from '../../viewport';
import { Documents } from '../docs/document';
import { SpreadsheetExtensionRegistry } from '../extension';
import type { Background } from './extensions/background';
import type { Border } from './extensions/border';
import type { Font } from './extensions/font';
import type { BorderCacheItem } from './interfaces';
import { SheetComponent } from './sheet-component';
import type { SpreadsheetSkeleton } from './sheet-skeleton';
import { getDocsSkeletonPageSize } from './sheet-skeleton';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';

export class Spreadsheet extends SheetComponent {
    private _backgroundExtension!: Background;

    private _borderExtension!: Border;

    private _fontExtension!: Font;

    private _cacheCanvas!: Canvas;

    private _refreshIncrementalState = false;

    private _forceDirty = false;

    private _overflowCacheRuntime: { [row: number]: boolean } = {};

    private _overflowCacheRuntimeRange = new ObjectMatrix<IRange>();

    private _overflowCacheRuntimeTimeout: number | NodeJS.Timeout = -1;

    private _documents: Documents = new Documents(OBJECT_KEY, undefined, {
        pageMarginLeft: 0,
        pageMarginTop: 0,
    });

    constructor(
        oKey: string,
        spreadsheetSkeleton?: SpreadsheetSkeleton,
        private _allowCache: boolean = true
    ) {
        super(oKey, spreadsheetSkeleton);

        if (this._allowCache) {
            this._cacheCanvas = new Canvas();

            this.onIsAddedToParentObserver.add((parent) => {
                (parent as Scene)?.getEngine()?.onTransformChangeObservable.add(() => {
                    this._resizeCacheCanvas();
                });
                this._resizeCacheCanvas();
                this._addMakeDirtyToScroll();
            });
        }

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

    override draw(ctx: CanvasRenderingContext2D, bounds?: IViewportBound) {
        // const { parent = { scaleX: 1, scaleY: 1 } } = this;
        // const mergeData = this.getMergeData();
        // const showGridlines = this.getShowGridlines() || 1;
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }

        const parentScale = this.getParentScale();

        // insert overflow cache
        this._calculateOverflow();

        const diffRanges = this._refreshIncrementalState
            ? bounds?.diffBounds.map((bound) => spreadsheetSkeleton.getRowColumnSegmentByViewBound(bound))
            : undefined;
        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton, diffRanges);
        }

        /**
         * Caching overflow during scrolling and clearing it after waiting for 1 second without scrolling can significantly improve performance.
         */
        clearTimeout(this._overflowCacheRuntimeTimeout);
        this._overflowCacheRuntimeTimeout = setTimeout(() => {
            this._overflowCacheRuntimeRange.reset();
            this._overflowCacheRuntime = {};
        }, 1000);
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
        const { scaleX = 1, scaleY = 1 } = this.getParentScale();
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

    makeForceDirty(state = true) {
        this._forceDirty = state;
    }

    getAncestorScrollXY(offsetX: number, offsetY: number) {
        let parent: any = this.getParent();

        let x = 0;
        let y = 0;
        const coord = Vector2.FromArray([offsetX, offsetY]);
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                const scene = parent as Scene;
                const viewPort = scene.getActiveViewportByCoord(coord);
                if (viewPort) {
                    const actualX = viewPort.actualScrollX || 0;
                    const actualY = viewPort.actualScrollY || 0;
                    x += actualX;
                    y += actualY;
                }
            }
            parent = parent?.getParent && parent?.getParent();
        }
        return {
            x,
            y,
        };
    }

    override getSelectionBounding(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        return this.getSkeleton()?.getMergeBounding(startRow, startColumn, endRow, endColumn);
    }

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IViewportBound) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        const { top, left, bottom, right } = bounds!.viewBound;

        const spreadsheetSkeleton = this.getSkeleton();

        if (!spreadsheetSkeleton) {
            return;
        }

        spreadsheetSkeleton.calculateWithoutClearingCache(bounds);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (
            (segment.startRow === -1 && segment.endRow === -1) ||
            (segment.startColumn === -1 && segment.endColumn === -1)
        ) {
            return;
        }

        mainCtx.save();

        const parentScale = this.getParentScale();

        const scale = getScale(parentScale);

        // const { left: fixTranslateLeft, top: fixTranslateTop } = getTranslateInSpreadContextWithPixelRatio();

        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

        mainCtx.translate(fixLineWidthByScale(rowHeaderWidth, scale), fixLineWidthByScale(columnHeaderHeight, scale));

        this._drawAuxiliary(mainCtx);

        if (bounds && this._allowCache === true) {
            const { viewBound, diffBounds, diffX, diffY, viewPortPosition, viewPortKey } = bounds;

            if (viewPortKey === 'viewColumnRight' || viewPortKey === 'viewRowBottom' || viewPortKey === 'viewLeftTop') {
                // console.warn('ignore object', this);
                return;
            }

            if (viewPortKey === 'viewMain') {
                const ctx = this._cacheCanvas.getContext();
                ctx.save();

                const { left, top, right, bottom } = viewPortPosition;

                const dw = right - left + rowHeaderWidth;

                const dh = bottom - top + columnHeaderHeight;

                if (
                    (diffX !== 0 && diffY !== 0) ||
                    diffBounds[0] == null ||
                    (diffX === 0 && diffY === 0) ||
                    this._forceDirty
                ) {
                    if (this.isDirty() || this._forceDirty) {
                        this._cacheCanvas.clear();
                        ctx.setTransform(mainCtx.getTransform());
                        this._draw(ctx, bounds);
                        this._forceDirty = false;
                    }
                    this._applyCache(mainCtx, left, top, dw, dh, left, top, dw, dh);
                } else {
                    if (this.isDirty()) {
                        const pixelRatio = this._cacheCanvas.getPixelRatio();
                        ctx.save();
                        ctx.globalCompositeOperation = 'copy';
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.drawImage(
                            this._cacheCanvas.getCanvasEle(),
                            fixLineWidthByScale(diffX, scale) * pixelRatio * scale,
                            fixLineWidthByScale(diffY, scale) * pixelRatio * scale
                        );
                        ctx.restore();

                        this._refreshIncrementalState = true;
                        ctx.setTransform(mainCtx.getTransform());
                        this._draw(ctx, bounds);
                        this._refreshIncrementalState = false;
                    }
                    this._applyCache(mainCtx, left, top, dw, dh, left, top, dw, dh);
                }

                ctx.restore();
            } else {
                this._draw(mainCtx, bounds);
            }
        } else {
            this._draw(mainCtx, bounds);
        }

        mainCtx.restore();

        this.makeDirty(false);
        return this;
    }

    private _resizeCacheCanvas() {
        const parentSize = this._getAncestorSize();
        if (!parentSize || this._cacheCanvas == null) {
            return;
        }
        const { width, height } = parentSize;
        this._cacheCanvas.setSize(width, height);
        this.makeDirty(true);
    }

    protected _applyCache(
        ctx?: CanvasRenderingContext2D,
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

        const pixelRatio = this._cacheCanvas.getPixelRatio();

        const cacheCtx = this._cacheCanvas.getContext();
        cacheCtx.save();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        cacheCtx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(
            this._cacheCanvas.getCanvasEle(),
            sx,
            sy,
            sw * pixelRatio,
            sh * pixelRatio,
            dx,
            dy,
            dw * pixelRatio,
            dh * pixelRatio
        );
        ctx.restore();
        cacheCtx.restore();
    }

    protected override _draw(ctx: CanvasRenderingContext2D, bounds?: IViewportBound) {
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
            .forEach((extension) => {
                this.register(extension);
            });
        // this._borderAuxiliaryExtension = this.getExtensionByKey('DefaultBorderAuxiliaryExtension') as BorderAuxiliary;
        this._backgroundExtension = this.getExtensionByKey('DefaultBackgroundExtension') as Background;
        this._borderExtension = this.getExtensionByKey('DefaultBorderExtension') as Border;
        this._fontExtension = this.getExtensionByKey('DefaultFontExtension') as Font;
    }

    private _addMakeDirtyToScroll() {
        this._hasScrollViewportOperator(this, (viewport: Viewport) => {
            viewport.onScrollBeforeObserver.add(() => {
                this.makeDirty(true);
            });
        });
    }

    private _hasScrollViewportOperator(object: BaseObject, fn: (viewPort: Viewport) => void) {
        let parent: any = object.getParent();
        while (parent) {
            if (parent.classType === RENDER_CLASS_TYPE.SCENE) {
                const viewports = parent.getViewports();
                const viewPorts = this._getHasScrollViewports(viewports);
                for (const viewport of viewPorts) {
                    if (viewport) {
                        fn(viewport);
                    }
                }
            }
            parent = parent?.getParent && parent?.getParent();
        }
    }

    private _getHasScrollViewports(viewports: Viewport[]) {
        const newViewports: Viewport[] = [];
        for (const viewport of viewports) {
            const scrollBar = viewport.getScrollBar();
            if (scrollBar) {
                newViewports.push(viewport);
            }
        }
        return newViewports;
    }

    /**
     * Calculate the overflow of cell text. If there is no value on either side of the cell,
     * the text content of this cell can be drawn to both sides, not limited by the cell's width.
     * Overflow on the left or right is aligned according to the text's horizontal alignment.
     */
    private _calculateOverflow() {
        // const overflowCache = new ObjectMatrix<IRange>();
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }

        const columnCount = spreadsheetSkeleton.getColumnCount();
        const { stylesCache, rowHeightAccumulation, columnWidthAccumulation, mergeData } = spreadsheetSkeleton;
        const { font: fontList } = stylesCache;

        fontList &&
            Object.keys(fontList).forEach((fontFormat: string) => {
                const fontObjectArray = fontList[fontFormat];

                fontObjectArray.forRow((row, columns) => {
                    if (this._overflowCacheRuntime[row] != null) {
                        return;
                    }

                    columns.forEach((column) => {
                        const docsConfig = fontObjectArray.getValue(row, column);
                        // wrap and angle handler
                        const { documentSkeleton, angle = 0, horizontalAlign, wrapStrategy } = docsConfig;

                        const cell = spreadsheetSkeleton.getCellData().getValue(row, column);

                        const sheetSkeleton = this.getSkeleton();
                        if (!sheetSkeleton) {
                            return true;
                        }

                        const { t: cellValueType = CellValueType.STRING } = cell || {};

                        /**
                         * Numerical and Boolean values are not displayed with overflow.
                         */
                        if (
                            wrapStrategy === WrapStrategy.OVERFLOW &&
                            cellValueType !== CellValueType.NUMBER &&
                            cellValueType !== CellValueType.BOOLEAN &&
                            horizontalAlign !== HorizontalAlign.JUSTIFIED
                        ) {
                            // Merged cells do not support overflow.
                            if (spreadsheetSkeleton.intersectMergeRange(row, column)) {
                                return true;
                            }

                            let contentSize = getDocsSkeletonPageSize(documentSkeleton, angle);

                            if (!contentSize) {
                                return true;
                            }

                            if (angle !== 0) {
                                const { startY, endY, startX, endX } = getCellByIndex(
                                    row,
                                    column,
                                    rowHeightAccumulation,
                                    columnWidthAccumulation,
                                    mergeData
                                );
                                const cellWidth = endX - startX;
                                const cellHeight = endY - startY;

                                if (contentSize.height > cellHeight) {
                                    contentSize = {
                                        width: cellHeight / Math.tan(Math.abs(angle)) + cellWidth,
                                        height: cellHeight,
                                    };
                                    // if (angle > 0) {
                                    //     horizontalAlign = HorizontalAlign.LEFT;
                                    // } else {
                                    //     horizontalAlign = HorizontalAlign.RIGHT;
                                    // }
                                }
                            }

                            const position = spreadsheetSkeleton.getOverflowPosition(
                                contentSize,
                                horizontalAlign,
                                row,
                                column,
                                columnCount
                            );

                            const { startColumn, endColumn } = position;

                            this._overflowCacheRuntimeRange.setValue(row, column, {
                                startRow: row,
                                endRow: row,
                                startColumn,
                                endColumn,
                            });
                        } else if (wrapStrategy === WrapStrategy.WRAP && angle !== 0) {
                            // Merged cells do not support overflow.
                            if (spreadsheetSkeleton.intersectMergeRange(row, column)) {
                                return true;
                            }

                            const { startY, endY } = getCellByIndex(
                                row,
                                column,
                                rowHeightAccumulation,
                                columnWidthAccumulation,
                                mergeData
                            );

                            const cellHeight = endY - startY;
                            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(cellHeight);
                            documentSkeleton.calculate();
                            const contentSize = getDocsSkeletonPageSize(documentSkeleton, angle);

                            if (!contentSize) {
                                return true;
                            }

                            const { startColumn, endColumn } = sheetSkeleton.getOverflowPosition(
                                contentSize,
                                horizontalAlign,
                                row,
                                column,
                                sheetSkeleton.getColumnCount()
                            );
                            this._overflowCacheRuntimeRange.setValue(row, column, {
                                startRow: row,
                                endRow: row,
                                startColumn,
                                endColumn,
                            });
                        }
                    });

                    this._overflowCacheRuntime[row] = true;
                });

                fontObjectArray.forValue((row, column, docsConfig) => {
                    // console.log('appendToOverflowCache', cellHeight, angle, contentSize, { rowIndex, columnIndex, startColumn, endColumn });
                });
            });

        spreadsheetSkeleton.setOverflowCache(this._overflowCacheRuntimeRange);
    }

    private _drawAuxiliary(ctx: CanvasRenderingContext2D) {
        const spreadsheetSkeleton = this.getSkeleton();

        if (spreadsheetSkeleton == null) {
            return;
        }

        const { rowColumnSegment, dataMergeCache, overflowCache, stylesCache, showGridlines } = spreadsheetSkeleton;
        const { border, backgroundPositions } = stylesCache;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE) {
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
        const { scaleX, scaleY } = this.getParentScale();

        const scale = Math.max(scaleX, scaleY);

        ctx.beginPath();
        ctx.lineWidth = getLineWith(1) / scale;
        // eslint-disable-next-line no-magic-numbers
        ctx.strokeStyle = getColor([212, 212, 212]);

        const width = columnTotalWidth;

        const height = rowTotalHeight;

        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;

        const rowStart = startRow;

        const rowEnd = endRow;

        const columnDrawTopStart = 0;

        ctx.translate(FIX_ONE_PIXEL_BLUR_OFFSET / scale, FIX_ONE_PIXEL_BLUR_OFFSET / scale);

        for (let r = rowStart; r <= rowEnd; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            ctx.moveTo(0, fixLineWidthByScale(rowEndPosition, scale));
            ctx.lineTo(width, fixLineWidthByScale(rowEndPosition, scale));
        }

        for (let c = startColumn; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = columnWidthAccumulation[c];
            ctx.moveTo(fixLineWidthByScale(columnEndPosition, scale), columnDrawTopStart);
            ctx.lineTo(fixLineWidthByScale(columnEndPosition, scale), height);
        }
        // console.log('xx2', scaleX, scaleY, columnTotalWidth, rowTotalHeight, rowHeightAccumulation, columnWidthAccumulation);
        ctx.stroke();
        ctx.closePath();

        // Clearing the dashed line issue caused by overlaid auxiliary lines and strokes
        border?.forValue((rowIndex, columnIndex, borderCaches) => {
            if (!borderCaches) {
                return true;
            }

            const cellInfo = spreadsheetSkeleton.getCellByIndexWithNoHeader(rowIndex, columnIndex, scaleX, scaleY);

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

            if (!(mergeInfo.startRow >= rowStart && mergeInfo.endRow <= rowEnd)) {
                return true;
            }

            for (const key in borderCaches) {
                const { type } = borderCaches[key] as BorderCacheItem;

                clearLineByBorderType(ctx, type, { startX, startY, endX, endY }, scaleX, scaleY);
            }
        });
        ctx.closePath();
        // merge cell
        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);

        // overflow cell
        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, overflowCache.toNativeArray());

        this._clearBackground(ctx, scale, backgroundPositions);

        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: CanvasRenderingContext2D,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache?: IRange[]
    ) {
        if (dataMergeCache == null) {
            return;
        }
        for (const dataCache of dataMergeCache) {
            const { startRow, endRow, startColumn, endColumn } = dataCache;

            const startY = fixLineWidthByScale(rowHeightAccumulation[startRow - 1] || 0, scale);
            const endY = fixLineWidthByScale(
                rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1],
                scale
            );

            const startX = fixLineWidthByScale(columnWidthAccumulation[startColumn - 1] || 0, scale);
            const endX = fixLineWidthByScale(
                columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1],
                scale
            );

            ctx.clearRect(startX, startY, endX - startX, endY - startY);

            // After ClearRect, the lines will become thinner, and the lines will be repaired below.
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startX, endY);
            ctx.lineTo(startX, startY);
            ctx.stroke();
            ctx.closePath();
        }
    }

    private _clearBackground(
        ctx: CanvasRenderingContext2D,
        scale: number,
        backgroundPositions?: ObjectMatrix<ISelectionCellWithCoord>
    ) {
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

            ctx.clearRect(startX, startY, endX - startX, endY - startY);
        });
    }
}
