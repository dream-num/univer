import {
    CellValueType,
    HorizontalAlign,
    IRange,
    Nullable,
    ObjectMatrix,
    sortRules,
    WrapStrategy,
} from '@univerjs/core';

import { BaseObject } from '../../BaseObject';
import { ORIENTATION_TYPE, RENDER_CLASS_TYPE } from '../../Basics/Const';
import {
    getRotateOffsetAndFarthestHypotenuse,
    getRotateOrientation,
    getTranslateInSpreadContextWithPixelRatio,
} from '../../Basics/Draw';
import { IDocumentSkeletonColumn } from '../../Basics/IDocumentSkeletonCached';
import { ITransformChangeState } from '../../Basics/Interfaces';
import { fixLineWidthByScale, getCellByIndex, getCellPositionByIndex, getScale } from '../../Basics/Tools';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { Canvas } from '../../Canvas';
import { Engine } from '../../Engine';
import { Scene } from '../../Scene';
import { SceneViewer } from '../../SceneViewer';
import { Viewport } from '../../Viewport';
import { columnIterator } from '../Docs/Common/Tools';
import { DocumentSkeleton } from '../Docs/DocSkeleton';
import { Documents } from '../Docs/Document';
import { SpreadsheetExtensionRegistry } from '../Extension';
import { Background } from './Extensions/Background';
import { Border } from './Extensions/Border';
import { BorderAuxiliary } from './Extensions/BorderAuxiliary';
import { Font } from './Extensions/Font';
import { SheetComponent } from './SheetComponent';
import { SpreadsheetSkeleton } from './SheetSkeleton';

const OBJECT_KEY = '__SHEET_EXTENSION_FONT_DOCUMENT_INSTANCE__';

/**
 * Obtain the height and width of a cell's text, taking into account scenarios with rotated text.
 * @param documentSkeleton Data of the document's ViewModel
 * @param angle The rotation angle of an Excel cell
 * @returns
 */
export function getDocsSkeletonPageSize(documentSkeleton: DocumentSkeleton, angle: number = 0) {
    const skeletonData = documentSkeleton?.getSkeletonData();

    if (!skeletonData) {
        return;
    }
    const { pages } = skeletonData;
    const lastPage = pages[pages.length - 1];

    if (angle === 0) {
        const { width, height } = lastPage;
        return { width, height };
    }

    let allRotatedWidth = 0;
    let allRotatedHeight = 0;

    const orientation = getRotateOrientation(angle);
    const widthArray: Array<{ rotatedWidth: number; spaceWidth: number }> = [];
    columnIterator([lastPage], (column: IDocumentSkeletonColumn) => {
        const { lines, width: columnWidth, spaceWidth } = column;

        const { rotatedHeight, rotatedWidth } = getRotateOffsetAndFarthestHypotenuse(lines, columnWidth, angle);
        allRotatedHeight += rotatedHeight;

        widthArray.push({ rotatedWidth, spaceWidth });
    });

    const tanTheta = Math.tan(angle);
    const sinTheta = Math.sin(angle);

    const widthCount = widthArray.length;
    for (let i = 0; i < widthCount; i++) {
        const { rotatedWidth, spaceWidth } = widthArray[i];

        if (i === 0) {
            allRotatedWidth += rotatedWidth;
        }

        if (
            (orientation === ORIENTATION_TYPE.UP && i === 0) ||
            (orientation === ORIENTATION_TYPE.DOWN && i === widthCount - 1)
        ) {
            allRotatedWidth += (rotatedWidth + spaceWidth / sinTheta) / tanTheta;
        }
    }

    return {
        width: allRotatedWidth,
        height: allRotatedHeight,
    };
}

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

        spreadsheetSkeleton.calculate(bounds);

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
        const { stylesCache, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache, mergeData } =
            spreadsheetSkeleton;
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
                    const { documentSkeleton, angle = 0, verticalAlign, horizontalAlign, wrapStrategy } = docsConfig;
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
                        documentSkeleton.getModel().updateDocumentDataPageSize(cellHeight);
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
