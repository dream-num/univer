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

import type { IRange, Nullable } from '@univerjs/core';
import { CellValueType, HorizontalAlign, ObjectMatrix, sortRules, WrapStrategy } from '@univerjs/core';

import type { BaseObject } from '../../base-object';
import { RENDER_CLASS_TYPE } from '../../basics/const';
import { getTranslateInSpreadContextWithPixelRatio } from '../../basics/draw';
import type { ITransformChangeState } from '../../basics/interfaces';
import { fixLineWidthByScale, getCellByIndex, getCellPositionByIndex, getScale } from '../../basics/tools';
import type { IBoundRect } from '../../basics/vector2';
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
import type { BorderAuxiliary } from './extensions/border-auxiliary';
import type { Font } from './extensions/font';
import { SheetComponent } from './sheet-component';
import type { SpreadsheetSkeleton } from './sheet-skeleton';
import { getDocsSkeletonPageSize } from './sheet-skeleton';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';

export class Spreadsheet extends SheetComponent {
    private _borderAuxiliaryExtension!: BorderAuxiliary;

    private _backgroundExtension!: Background;

    private _borderExtension!: Border;

    private _fontExtension!: Font;

    private _cacheCanvas!: Canvas;

    private _boundsCache: Nullable<IBoundRect>;

    private _cacheOffsetX = 0;

    private _cacheOffsetY = 0;

    private _hasSelection = false;

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
        }

        this.onIsAddedToParentObserver.add((parent) => {
            (parent as Scene)?.getEngine()?.onTransformChangeObservable.add((change: ITransformChangeState) => {
                this.resizeCacheCanvas();
            });
            this.resizeCacheCanvas();
            this._addMakeDirtyToScroll();
        });

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get borderAuxiliaryExtension() {
        return this._borderAuxiliaryExtension;
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

    override draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        // const { parent = { scaleX: 1, scaleY: 1 } } = this;
        // const mergeData = this.getMergeData();
        // const showGridlines = this.getShowGridlines() || 1;
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }

        const parentScale = this.getParentScale();

        spreadsheetSkeleton.calculateWithoutClearingCache(bounds);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (
            (segment.startRow === -1 && segment.endRow === -1) ||
            (segment.startColumn === -1 && segment.endColumn === -1)
        ) {
            return;
        }

        const scale = getScale(parentScale);

        const { left: fixTranslateLeft, top: fixTranslateTop } = getTranslateInSpreadContextWithPixelRatio();

        const { rowHeaderWidth, columnHeaderHeight } = spreadsheetSkeleton;

        ctx.translate(
            fixLineWidthByScale(rowHeaderWidth, scale) - fixTranslateLeft / scale,
            fixLineWidthByScale(columnHeaderHeight, scale) - fixTranslateTop / scale
        );

        // insert overflow cache
        this._calculateOverflow();

        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
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
        const { scaleX = 1, scaleY = 1 } = this.getParentScale();
        let { startY, endY, startX, endX } = getCellPositionByIndex(
            rowIndex,
            columnIndex,
            rowHeightAccumulation,
            columnWidthAccumulation
        );

        startY = fixLineWidthByScale(startY + columnHeaderHeight, scaleY);
        endY = fixLineWidthByScale(endY + columnHeaderHeight, scaleY);
        startX = fixLineWidthByScale(startX + rowHeaderWidth, scaleX);
        endX = fixLineWidthByScale(endX + rowHeaderWidth, scaleX);

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

    override render(mainCtx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        if (!this.visible) {
            this.makeDirty(false);
            return this;
        }

        if (this._allowCache) {
            this._cacheOffsetX = 0;
            this._cacheOffsetY = 0;

            if (this.isDirty() || this._checkNewBounds(bounds)) {
                const newBounds = bounds;
                const ctx = this._cacheCanvas.getContext();

                if (newBounds) {
                    const { dx = 0, dy = 0 } = newBounds;
                    this._cacheOffsetX = dx;
                    this._cacheOffsetY = dy;
                }
                this._cacheCanvas.clear();
                ctx.save();
                // ctx.globalCompositeOperation = 'copy';
                // ctx.drawImage(canvasEle, this._cacheOffsetX, this._cacheOffsetY);
                // ctx.globalCompositeOperation = 'source-over';
                ctx.setTransform(mainCtx.getTransform());
                this._draw(ctx, newBounds);
                // console.log('newBounds', JSON.stringify(newBounds));
                // console.log('bounds', JSON.stringify(bounds));
                // console.log('_boundsCache', JSON.stringify(this._boundsCache));
                ctx.restore();

                this._boundsCache = bounds;
            }
            this._applyCache(mainCtx);
        } else {
            mainCtx.save();
            this._draw(mainCtx, bounds);
            mainCtx.restore();
        }

        this.makeDirty(false);
        return this;
        // console.log('render', ctx);
        // console.log('mainCtx', mainCtx, this.width, this.height);
    }

    override resizeCacheCanvas() {
        const parentSize = this._getAncestorSize();
        if (!parentSize || this._cacheCanvas == null) {
            return;
        }
        const { width, height } = parentSize;
        const skeleton = this.getSkeleton();
        let rowHeaderWidth = 0;
        let columnHeaderHeight = 0;
        if (skeleton) {
            rowHeaderWidth = skeleton.rowHeaderWidth;
            columnHeaderHeight = skeleton.columnHeaderHeight;
        }

        this._cacheCanvas.setSize(width, height);
        this.makeDirty(true);
    }

    // enableSelection() {
    //     if (this._hasSelection) {
    //         return;
    //     }
    //     this._selection = SelectionManager.create(this);
    //     this._hasSelection = true;
    // }

    // disableSelection() {
    //     this._selection?.dispose();
    //     this._hasSelection = false;
    // }
    // scaleCacheCanvas() {
    //     let scaleX = this.getParent()?.ancestorScaleX || 1;
    //     let scaleY = this.getParent()?.ancestorScaleX || 1;

    //     this._cacheCanvas?.setPixelRatio(Math.max(scaleX, scaleY) * getDevicePixelRatio());
    //     this.makeDirty(true);
    // }

    private _checkNewBounds(bounds?: IBoundRect) {
        const oldBounds = this._boundsCache;
        if (oldBounds === bounds) {
            return false;
        }

        if (bounds == null || oldBounds == null) {
            return true;
        }

        const { tl, br } = bounds;
        const { tl: oldTl, br: oldBr } = oldBounds;

        if (tl.equals(oldTl) && br.equals(oldBr)) {
            return false;
        }

        return true;
    }

    protected _applyCache(ctx?: CanvasRenderingContext2D) {
        if (!ctx) {
            return;
        }
        // const skeleton = this.getSkeleton();
        // let offsetX = 0;
        // let offsetY = 0;
        // if (skeleton) {
        //     const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        //     const { scaleX, scaleY } = this.getParentScale();
        //     offsetX = fixLineWidthByScale(rowHeaderWidth, scaleX);
        //     offsetY = fixLineWidthByScale(columnHeaderHeight, scaleY);
        // }
        // const pixelRatio = this._cacheCanvas.getPixelRatio();
        // const width = this._cacheCanvas.getWidth() * pixelRatio;
        // const height = this._cacheCanvas.getHeight() * pixelRatio;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // ctx.rect(offsetX + 100, offsetY + 100, width, height);
        // ctx.clip();
        ctx.drawImage(this._cacheCanvas.getCanvasEle(), 0, 0);
        ctx.restore();
    }

    protected override _draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
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
        this._borderAuxiliaryExtension = this.getExtensionByKey('DefaultBorderAuxiliaryExtension') as BorderAuxiliary;
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
                for (const viewport of viewports) {
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

    // getOverflowRevertHorizontalAlign(row: number, column: number, docsConfig: fontCacheItem) {
    //     const spreadsheetSkeleton = this.getSkeleton();
    //     let { documentSkeleton, angle = 0, horizontalAlign, wrapStrategy } = docsConfig;
    //     if (!spreadsheetSkeleton) {
    //         return horizontalAlign;
    //     }
    //     const { rowHeightAccumulation, columnWidthAccumulation, dataMergeCache } = spreadsheetSkeleton;
    //     const cell = spreadsheetSkeleton.getCellData().getValue(row, column);
    //     if (wrapStrategy === WrapStrategy.OVERFLOW && angle !== 0 && cell?.n !== BooleanNumber.TRUE && horizontalAlign !== HorizontalAlign.JUSTIFIED) {
    //         let contentSize = documentSkeleton.getLastPageSize(angle);

    //         if (!contentSize) {
    //             return horizontalAlign;
    //         }
    //         let { startY, endY, startX, endX } = getCellByIndex(row, column, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
    //         const cellWidth = endX - startX;
    //         const cellHeight = endY - startY;
    //         if (contentSize.height > cellHeight) {
    //             contentSize = {
    //                 width: cellHeight / Math.tan(Math.abs(angle)) + cellWidth,
    //                 height: cellHeight,
    //             };
    //             if (angle > 0) {
    //                 return HorizontalAlign.LEFT;
    //             } else {
    //                 return HorizontalAlign.RIGHT;
    //             }
    //         }
    //     }
    //     return horizontalAlign;
    // }

    /**
     * Calculate the overflow of cell text. If there is no value on either side of the cell,
     * the text content of this cell can be drawn to both sides, not limited by the cell's width.
     * Overflow on the left or right is aligned according to the text's horizontal alignment.
     */
    private _calculateOverflow() {
        const overflowCache = new ObjectMatrix<IRange>();
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

                fontObjectArray.forValue((row, column, docsConfig) => {
                    // Merged cells do not support overflow.
                    if (spreadsheetSkeleton.intersectMergeRange(row, column)) {
                        return true;
                    }

                    // wrap and angle handler
                    const { documentSkeleton, angle = 0, horizontalAlign, wrapStrategy } = docsConfig;

                    const cell = spreadsheetSkeleton.getCellData().getValue(row, column);

                    const sheetSkeleton = this.getSkeleton();
                    if (!sheetSkeleton) {
                        return true;
                    }

                    const { t: cellValueType = CellValueType.STRING } = cell || {};

                    if (
                        wrapStrategy === WrapStrategy.OVERFLOW &&
                        cellValueType !== CellValueType.NUMBER &&
                        cellValueType !== CellValueType.BOOLEAN &&
                        horizontalAlign !== HorizontalAlign.JUSTIFIED
                    ) {
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

                        overflowCache.setValue(row, column, {
                            startRow: row,
                            endRow: row,
                            startColumn,
                            endColumn,
                        });
                    } else if (wrapStrategy === WrapStrategy.WRAP && angle !== 0) {
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
                        overflowCache.setValue(row, column, { startRow: row, endRow: row, startColumn, endColumn });
                    }

                    // console.log('appendToOverflowCache', cellHeight, angle, contentSize, { rowIndex, columnIndex, startColumn, endColumn });
                });
            });

        spreadsheetSkeleton.setOverflowCache(overflowCache);
    }

    private _differentBounds(bounds: IBoundRect) {
        // if (!bounds) {
        //     return;
        // }

        if (!this._boundsCache) {
            return bounds;
        }

        // if (!this._checkSheetDifferentBounds(bounds, this._boundsCache)) {
        //     return bounds;
        // }

        const { tl, tr, bl, br, dx, dy } = bounds;

        const { tl: cacheTL, tr: cacheTR, bl: cacheBL, br: cacheBR, dx: cacheDX, dy: cacheDY } = this._boundsCache;
        const newBounds: IBoundRect = {
            tl,
            tr,
            bl,
            br,
            dx: 0,
            dy: 0,
        };

        if (tl.x === cacheTL.x) {
            if (tl.y > cacheTL.y) {
                newBounds.tl = cacheBL;
                newBounds.tr = cacheBR;
            } else {
                newBounds.bl = cacheTL;
                newBounds.br = cacheTR;
            }
            newBounds.dy = cacheTL.y - tl.y;
        } else if (tl.y === cacheTL.y) {
            if (tl.x > cacheTL.x) {
                newBounds.tl = cacheTR;
                newBounds.bl = cacheBR;
            } else {
                newBounds.tr = cacheTL;
                newBounds.br = cacheBL;
            }
            newBounds.dx = cacheTL.x - tl.x;
        }

        return newBounds;
    }

    private _checkSheetDifferentBounds(bounds1: IBoundRect, bounds2: IBoundRect) {
        const { tl, tr, bl, br } = bounds1;

        const { tl: cacheTL, tr: cacheTR, bl: cacheBL, br: cacheBR } = bounds2;

        if (tl.x === cacheTL.x && tr.x === cacheTR.x && bl.x === cacheBL.x && br.x === cacheBR.x) {
            if (tl.y >= cacheTL.y && tl.y <= cacheBL.y) {
                return true;
            }

            if (bl.y >= cacheTL.y && bl.y <= cacheBL.y) {
                return true;
            }

            return false;
        }

        if (tl.y === cacheTL.y && tr.y === cacheTR.y && bl.y === cacheBL.y && br.y === cacheBR.y) {
            if (tl.x >= cacheTL.x && tl.x <= cacheTR.x) {
                return true;
            }

            if (tr.x >= cacheTL.x && tr.x <= cacheTR.x) {
                return true;
            }
            return true;
        }

        return false;
    }
}
