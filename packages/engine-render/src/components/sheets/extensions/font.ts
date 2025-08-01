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

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import type { ICellDataForSheetInterceptor, ICellWithCoord, IDocDrawingBase, ImageSourceType, IRange, IScale, Nullable, ObjectMatrix } from '@univerjs/core';
import type { IBoundRectNoAngle, IViewportInfo } from '../../../basics';
import type { UniverRenderingContext } from '../../../context';
import type { Documents } from '../../docs/document';
import type { IDrawInfo } from '../../extension';
import type { IFontCacheItem } from '../interfaces';
import type { SheetComponent } from '../sheet-component';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { CellValueType, extractPureTextFromCell, HorizontalAlign, Range, VerticalAlign, WrapStrategy } from '@univerjs/core';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics';
import { VERTICAL_ROTATE_ANGLE } from '../../../basics/text-rotation';
import { clampRange, inViewRanges } from '../../../basics/tools';
import { Text } from '../../../shape/text';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { EXPAND_SIZE_FOR_RENDER_OVERFLOW, FONT_EXTENSION_Z_INDEX } from '../constants';
import { DEFAULT_PADDING_DATA, getDocsSkeletonPageSize } from '../sheet.render-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultFontExtension';

const IMAGE_FALLBACK_SRC = 'data:image/svg+xml;base64,PHN2ZyBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PHBhdGggZD0iTTMwNC4xMjggNDU2LjE5MmM0OC42NCAwIDg4LjA2NC0zOS40MjQgODguMDY0LTg4LjA2NHMtMzkuNDI0LTg4LjA2NC04OC4wNjQtODguMDY0LTg4LjA2NCAzOS40MjQtODguMDY0IDg4LjA2NCAzOS40MjQgODguMDY0IDg4LjA2NCA4OC4wNjR6bTAtMTE2LjIyNGMxNS4zNiAwIDI4LjE2IDEyLjI4OCAyOC4xNiAyOC4xNnMtMTIuMjg4IDI4LjE2LTI4LjE2IDI4LjE2LTI4LjE2LTEyLjI4OC0yOC4xNi0yOC4xNiAxMi4yODgtMjguMTYgMjguMTYtMjguMTZ6IiBmaWxsPSIjZTZlNmU2Ii8+PHBhdGggZD0iTTg4Ny4yOTYgMTU5Ljc0NEgxMzYuNzA0Qzk2Ljc2OCAxNTkuNzQ0IDY0IDE5MiA2NCAyMzIuNDQ4djU1OS4xMDRjMCAzOS45MzYgMzIuMjU2IDcyLjcwNCA3Mi43MDQgNzIuNzA0aDE5OC4xNDRMNTAwLjIyNCA2ODguNjRsLTM2LjM1Mi0yMjIuNzIgMTYyLjMwNC0xMzAuNTYtNjEuNDQgMTQzLjg3MiA5Mi42NzIgMjE0LjAxNi0xMDUuNDcyIDE3MS4wMDhoMzM1LjM2QzkyNy4yMzIgODY0LjI1NiA5NjAgODMyIDk2MCA3OTEuNTUyVjIzMi40NDhjMC0zOS45MzYtMzIuMjU2LTcyLjcwNC03Mi43MDQtNzIuNzA0em0tMTM4Ljc1MiA3MS42OHYuNTEySDg1Ny42YzE2LjM4NCAwIDMwLjIwOCAxMy4zMTIgMzAuMjA4IDMwLjIwOHYzOTkuODcyTDY3My4yOCA0MDguMDY0bDc1LjI2NC0xNzYuNjR6TTMwNC42NCA3OTIuMDY0SDE2NS44ODhjLTE2LjM4NCAwLTMwLjIwOC0xMy4zMTItMzAuMjA4LTMwLjIwOHYtOS43MjhsMTM4Ljc1Mi0xNjQuMzUyIDEwNC45NiAxMjQuNDE2LTc0Ljc1MiA3OS44NzJ6bTgxLjkyLTM1NS44NGwzNy4zNzYgMjI4Ljg2NC0uNTEyLjUxMi0xNDIuODQ4LTE2OS45ODRjLTMuMDcyLTMuNTg0LTkuMjE2LTMuNTg0LTEyLjI4OCAwTDEzNS42OCA2NTIuOFYyNjIuMTQ0YzAtMTYuMzg0IDEzLjMxMi0zMC4yMDggMzAuMjA4LTMwLjIwOGg0NzQuNjI0TDM4Ni41NiA0MzYuMjI0em01MDEuMjQ4IDMyNS42MzJjMCAxNi44OTYtMTMuMzEyIDMwLjIwOC0yOS42OTYgMzAuMjA4SDY4MC45Nmw1Ny4zNDQtOTMuMTg0LTg3LjU1Mi0yMDIuMjQgNy4xNjgtNy42OCAyMjkuODg4IDI3Mi44OTZ6IiBmaWxsPSIjZTZlNmU2Ii8+PC9zdmc+';

function rotatedBoundingBox(width: number, height: number, angleDegrees: number) {
    const angle = angleDegrees * Math.PI / 180; // 将角度转换为弧度
    const rotatedWidth = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const rotatedHeight = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    return { rotatedWidth, rotatedHeight };
}

interface IRenderFontContext {
    ctx: UniverRenderingContext;
    scale: number;
    // rowHeightAccumulation: number[];
    columnTotalWidth: number;
    // columnWidthAccumulation: number[];
    rowTotalHeight: number;
    viewRanges: IRange[];
    checkOutOfViewBound: boolean;
    diffRanges: IRange[];
    spreadsheetSkeleton: SpreadsheetSkeleton;
    overflowRectangle: Nullable<IRange>;
    /**
     * includes documentSkeleton & cellData
     */
    fontCache?: Nullable<IFontCacheItem>;

    /**
     * cell rect startY(with merge info)
     */
    startY: number;
    /**
     * cell rect endY (with merge info)
     */
    endY: number;
    /**
     * cell rect startX(with merge info)
     */
    startX: number;
    /**
     * cell rect endX (with merge info)
     */
    endX: number;
    cellInfo: ICellWithCoord;
}

export class Font extends SheetExtension {
    override uKey = UNIQUE_KEY;
    override Z_INDEX = FONT_EXTENSION_Z_INDEX;
    private _imageFallback = new Image();

    constructor() {
        super();
        this._imageFallback.src = IMAGE_FALLBACK_SRC;
    }

    getDocuments() {
        const parent = this.parent as SheetComponent;
        return parent?.getDocuments();
    }

    /**
     * Safely draw fallback image, checking if it's fully loaded first.
     * If not loaded, draw a simple gray rectangle as placeholder.
     */
    private _drawFallbackImage(ctx: UniverRenderingContext, x: number, y: number, width: number, height: number) {
        // Check if fallback image is fully loaded
        if (this._imageFallback.complete && this._imageFallback.naturalWidth > 0) {
            try {
                ctx.drawImage(this._imageFallback, x, y, width, height);
            } catch (e) {
                console.error('Failed to draw fallback image:', e);
            }
        }
    }

    override draw(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        moreBoundsInfo: IDrawInfo
    ) {
        const { stylesCache, worksheet } = spreadsheetSkeleton;
        const { fontMatrix } = stylesCache;
        if (!spreadsheetSkeleton || !worksheet || !fontMatrix) return;

        const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } =
            spreadsheetSkeleton;
        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined ||
            !worksheet
        ) {
            return;
        }

        const scale = this._getScale(parentScale);
        const { viewRanges = [], checkOutOfViewBound } = moreBoundsInfo;
        const renderFontContext = {
            ctx,
            scale,
            // rowHeightAccumulation,
            columnTotalWidth,
            // columnWidthAccumulation,
            rowTotalHeight,
            viewRanges,
            checkOutOfViewBound: checkOutOfViewBound || true,
            diffRanges,
            spreadsheetSkeleton,
        } as IRenderFontContext;
        ctx.save();

        const uniqueMergeRanges: IRange[] = [];
        const mergeRangeIDSet = new Set();

        const lastRowIndex = spreadsheetSkeleton.getRowCount() - 1;
        const lastColIndex = spreadsheetSkeleton.getColumnCount() - 1;

        // Currently, viewRanges has only one range.
        viewRanges.forEach((range) => {
            range.startColumn -= EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range.endColumn += EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range = clampRange(range, lastRowIndex, lastColIndex);

            // collect unique merge ranges intersect with view range.
            // The ranges in mergeRanges must be unique. Otherwise, the font will render, text redrawing causes jagged edges or artifacts.
            const intersectMergeRangesWithViewRanges = spreadsheetSkeleton.worksheet.getMergedCellRange(range.startRow, range.startColumn, range.endRow, range.endColumn);
            intersectMergeRangesWithViewRanges.forEach((mergeRange) => {
                const mergeRangeIndex = spreadsheetSkeleton.worksheet.getSpanModel().getMergeDataIndex(mergeRange.startRow, mergeRange.startColumn);
                if (!mergeRangeIDSet.has(mergeRangeIndex)) {
                    mergeRangeIDSet.add(mergeRangeIndex);
                    uniqueMergeRanges.push(mergeRange);
                }
            });

            Range.foreach(range, (row, col) => {
                const index = spreadsheetSkeleton.worksheet.getSpanModel().getMergeDataIndex(row, col);
                if (index !== -1) {
                    return;
                }
                const cellInfo = spreadsheetSkeleton.getCellWithCoordByIndex(row, col, false);
                if (!cellInfo) return;

                renderFontContext.cellInfo = cellInfo;
                this._renderFontEachCell(renderFontContext, row, col, fontMatrix);
            });
        });

        uniqueMergeRanges.forEach((range) => {
            const cellInfo = spreadsheetSkeleton.getCellWithCoordByIndex(range.startRow, range.startColumn, false);
            renderFontContext.cellInfo = cellInfo;
            this._renderFontEachCell(renderFontContext, range.startRow, range.startColumn, fontMatrix);
        });

        ctx.restore();
    }

    _renderFontEachCell(renderFontCtx: IRenderFontContext, row: number, col: number, fontMatrix: ObjectMatrix<IFontCacheItem>) {
        const { ctx, viewRanges, diffRanges, spreadsheetSkeleton, cellInfo } = renderFontCtx;

        //#region merged cell
        const { startY, endY, startX, endX } = cellInfo;
        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
        renderFontCtx.startX = startX;
        renderFontCtx.startY = startY;
        renderFontCtx.endX = endX;
        renderFontCtx.endY = endY;

        // merged, but not primary cell, then skip. DO NOT RENDER AGAIN, or that would cause font blurry.
        if (isMerged && !isMergedMainCell) {
            return true;
        }

        // merged and primary cell
        if (isMergedMainCell) {
            renderFontCtx.startX = mergeInfo.startX;
            renderFontCtx.startY = mergeInfo.startY;
            renderFontCtx.endX = mergeInfo.endX;
            renderFontCtx.endY = mergeInfo.endY;
        }

        //#endregion

        const fontCache = fontMatrix.getValue(row, col);
        if (!fontCache) return true;
        renderFontCtx.fontCache = fontCache;

        //#region overflow
        // e.g. cell(12, 5)'s textwrap value is overflow(which is default), and text ends at column 9,
        // the overflowRange would be startRow: 12, startColumn: 5, endRow: 12, endColumn: 9
        // and if column 9 is not empty, then the overflowRang e endColumn would be 8
        // and if column 7 is not empty, the endColumn would be 6
        const overflowRange = spreadsheetSkeleton.overflowCache.getValue(row, col);

        // If it's neither an overflow nor within the current range,
        // then we can exit early
        const renderRange = diffRanges && diffRanges.length > 0 ? diffRanges : viewRanges;
        const notInMergeRange = !isMergedMainCell && !isMerged;
        if (!overflowRange && notInMergeRange) {
            if (!inViewRanges(renderRange, row, col)) {
                return true;
            }
        }
        //#endregion

        const visibleRow = spreadsheetSkeleton.worksheet.getRowVisible(row);
        const visibleCol = spreadsheetSkeleton.worksheet.getColVisible(col);
        if (!visibleRow || !visibleCol) return true;

        // Since we cannot predict when fontRenderExtension?.isSkip might change,
        // we must check it every time and retrieve cell data directly from the worksheet,
        // not from the cache to ensure accuracy.
        const cellData = spreadsheetSkeleton.worksheet.getCell(row, col) as ICellDataForSheetInterceptor || {};
        if (cellData?.fontRenderExtension?.isSkip) {
            return true;
        }

        ctx.save();
        ctx.beginPath();

        //#region text overflow
        renderFontCtx.overflowRectangle = overflowRange;
        this._clipByRenderBounds(renderFontCtx, row, col);
        //#endregion

        ctx.translate(renderFontCtx.startX + FIX_ONE_PIXEL_BLUR_OFFSET, renderFontCtx.startY + FIX_ONE_PIXEL_BLUR_OFFSET);
        if (fontCache.documentSkeleton) {
            this._renderDocuments(ctx, row, col, renderFontCtx, spreadsheetSkeleton.overflowCache);
        } else {
            this._renderText(ctx, row, col, renderFontCtx, spreadsheetSkeleton.overflowCache);
        }
        ctx.closePath();
        ctx.restore();

        if (fontCache.documentSkeleton) {
            const documentDataModel = fontCache.documentSkeleton.getViewModel().getDataModel();
            if (documentDataModel.getDrawingsOrder()?.length) {
                ctx.save();
                ctx.beginPath();
                this._clipByRenderBounds(renderFontCtx, row, col, 1);
                this._renderImages(ctx, fontCache, renderFontCtx.startX, renderFontCtx.startY, renderFontCtx.endX, renderFontCtx.endY);
                ctx.closePath();
                ctx.restore();
            }
        }

        renderFontCtx.startX = 0;
        renderFontCtx.startY = 0;
        renderFontCtx.endX = 0;
        renderFontCtx.endY = 0;
        renderFontCtx.overflowRectangle = null;
        return false;
    };

    private _renderImages(ctx: UniverRenderingContext, fontsConfig: IFontCacheItem, startX: number, startY: number, endX: number, endY: number) {
        const { documentSkeleton, verticalAlign, horizontalAlign } = fontsConfig;
        const fontHeight = documentSkeleton!.getSkeletonData()!.pages[0].height;
        const fontWidth = documentSkeleton!.getSkeletonData()!.pages[0].width;
        const PADDING = 2;
        let fontX = startX;
        let fontY = startY;
        switch (verticalAlign) {
            case VerticalAlign.TOP:
                fontY = startY + PADDING;
                break;
            case VerticalAlign.MIDDLE:
                fontY = (startY + endY) / 2 - fontHeight / 2;
                break;
            default:
                fontY = endY - fontHeight - PADDING;
                break;
        }

        switch (horizontalAlign) {
            case HorizontalAlign.RIGHT:
                fontX = endX - fontWidth - PADDING;
                break;
            case HorizontalAlign.CENTER:
                fontX = (startX + endX) / 2 - fontWidth / 2;
                break;
            default:
                fontX = startX + PADDING;
                break;
        }

        const documentDataModel = documentSkeleton!.getViewModel().getDataModel();
        const drawingDatas = documentDataModel.getDrawings();
        const drawings = documentSkeleton!.getSkeletonData()?.pages[0].skeDrawings;
        drawings?.forEach((drawing) => {
            const drawingData = drawingDatas?.[drawing.drawingId] as { imageSourceType: ImageSourceType; source: string } & IDocDrawingBase;
            if (drawingData) {
                const image = fontsConfig.imageCacheMap.getImage(
                    drawingData.imageSourceType,
                    drawingData.source,
                    () => {
                        this.parent?.makeDirty();
                    },
                    () => {
                        this.parent?.makeDirty();
                    }
                );

                const x = fontX + drawing.aLeft;
                const y = fontY + drawing.aTop;
                const width = drawing.width;
                const height = drawing.height;
                const angle = drawing.angle;
                const { rotatedHeight, rotatedWidth } = rotatedBoundingBox(width, height, angle);

                if (image && image.complete) {
                    const angleRadians = angle * Math.PI / 180;
                    ctx.save();
                    ctx.translate(x + rotatedWidth / 2, y + rotatedHeight / 2);
                    ctx.rotate(angleRadians);
                    const isError = image.getAttribute('data-error') === 'true';
                    if (isError) {
                        this._drawFallbackImage(ctx, -rotatedWidth / 2, -rotatedHeight / 2, width, height);
                    } else {
                        try {
                            ctx.drawImage(image, -rotatedWidth / 2, -rotatedHeight / 2, width, height);
                        } catch (e) {
                            this._drawFallbackImage(ctx, -rotatedWidth / 2, -rotatedHeight / 2, width, height);
                        }
                    }
                    ctx.restore();
                }
            }
        });
    }

    /**
     * Change font render bounds, for overflow and filter icon & custom render.
     * @param renderFontContext
     * @param row
     * @param col
     * @param fontCache
     */
    private _clipByRenderBounds(renderFontContext: IRenderFontContext, row: number, col: number, padding = 0) {
        const { ctx, scale, overflowRectangle, fontCache } = renderFontContext;
        let { startX, endX, startY, endY } = renderFontContext;

        // https://github.com/dream-num/univer-pro/issues/334
        // When horizontal alignment is not set, the default alignment for rotation angles varies to accommodate overflow scenarios.
        const { horizontalAlign = 0, vertexAngle = 0, centerAngle = 0 } = fontCache as IFontCacheItem;
        let horizontalAlignOverFlow = horizontalAlign;
        if (horizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (centerAngle === VERTICAL_ROTATE_ANGLE && vertexAngle === VERTICAL_ROTATE_ANGLE) {
                horizontalAlignOverFlow = HorizontalAlign.CENTER;
            } else if ((vertexAngle > 0 && vertexAngle !== VERTICAL_ROTATE_ANGLE) || vertexAngle === -VERTICAL_ROTATE_ANGLE) {
                horizontalAlignOverFlow = HorizontalAlign.RIGHT;
            }
        }
        // const cellDataInterceptor = renderFontContext.spreadsheetSkeleton.worksheet.getCell(row, col) as ICellDataForSheetInterceptor || {};
        const rightOffset = fontCache?.cellData?.fontRenderExtension?.rightOffset ?? 0;
        const leftOffset = fontCache?.cellData?.fontRenderExtension?.leftOffset ?? 0;
        let isOverflow = true;

        if (vertexAngle === 0) {
            startX = startX + leftOffset;
            endX = endX - rightOffset;

            if (rightOffset !== 0 || leftOffset !== 0) {
                isOverflow = false;
            }
        }
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;

        /**
         * In scenarios with offsets, there is no need to respond to text overflow.
         */
        if (overflowRectangle && isOverflow) {
            const { startColumn, startRow, endColumn, endRow } = overflowRectangle;
            const { spreadsheetSkeleton } = renderFontContext;
            const { rowHeightAccumulation, columnWidthAccumulation } = spreadsheetSkeleton;
            if (startColumn === endColumn && startColumn === col) {
                ctx.rectByPrecision(
                    startX + 1 / scale,
                    startY + 1 / scale,
                    cellWidth - 2 / scale,
                    cellHeight - 2 / scale
                );
                ctx.clip();
            } else {
                if (horizontalAlignOverFlow === HorizontalAlign.CENTER) {
                    this._clipRectangleForOverflow(
                        ctx,
                        startRow,
                        endRow,
                        startColumn,
                        endColumn,
                        scale,
                        rowHeightAccumulation,
                        columnWidthAccumulation,
                        padding
                    );
                } else if (horizontalAlignOverFlow === HorizontalAlign.RIGHT) {
                    this._clipRectangleForOverflow(
                        ctx,
                        startRow,
                        row,
                        startColumn,
                        col,
                        scale,
                        rowHeightAccumulation,
                        columnWidthAccumulation,
                        padding
                    );
                } else {
                    this._clipRectangleForOverflow(
                        ctx,
                        row,
                        endRow,
                        col,
                        endColumn,
                        scale,
                        rowHeightAccumulation,
                        columnWidthAccumulation,
                        padding
                    );
                }
            }
        } else {
            ctx.rectByPrecision(startX + 1 / scale, startY + 1 / scale, cellWidth - 2 / scale, cellHeight - 2 / scale);
            // for normal cell, forbid text overflow cell area
            ctx.clip();
        }
        renderFontContext.startX = startX;
        renderFontContext.startY = startY;
        renderFontContext.endX = endX;
        renderFontContext.endY = endY;
    }

    private _renderText(
        ctx: UniverRenderingContext,
        row: number,
        col: number,
        renderFontCtx: IRenderFontContext,
        overflowCache: ObjectMatrix<IRange>
    ) {
        const { fontCache } = renderFontCtx;
        if (!fontCache) return;
        const padding = fontCache.style?.pd ?? DEFAULT_PADDING_DATA;
        const paddingLeft = padding.l ?? DEFAULT_PADDING_DATA.l;
        const paddingRight = padding.r ?? DEFAULT_PADDING_DATA.r;
        const paddingTop = padding.t ?? DEFAULT_PADDING_DATA.t;
        const paddingBottom = padding.b ?? DEFAULT_PADDING_DATA.b;
        const { vertexAngle = 0, wrapStrategy, cellData } = fontCache;
        if (cellData?.v === undefined || cellData?.v === null) return;
        const text = extractPureTextFromCell(cellData);
        let { startX, startY, endX, endY } = renderFontCtx;
        let cellWidth = endX - startX - paddingLeft - paddingRight;
        const cellHeight = endY - startY - paddingTop - paddingBottom;

        const overflowRectangle = overflowCache.getValue(row, col);
        const isOverflow = !(wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0);
        if (isOverflow && overflowRectangle) {
            const endColumn = overflowRectangle.endColumn;
            const startColumn = overflowRectangle.startColumn;
            const startRow = overflowRectangle.startRow;
            const endRow = overflowRectangle.endRow;
            const endCell = renderFontCtx.spreadsheetSkeleton.getCellWithCoordByIndex(endRow, endColumn);
            endX = endCell.endX;
            endY = endCell.endY;

            const startCell = renderFontCtx.spreadsheetSkeleton.getCellWithCoordByIndex(startRow, startColumn);
            startX = startCell.startX;
            startY = startCell.startY;
            cellWidth = endX - startX - paddingLeft - paddingRight;
        }

        // If the horizontal alignment is not specified, we need to determine it based on the cell value type.
        let hAlign = fontCache.horizontalAlign;
        if (fontCache.horizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (cellData.t === CellValueType.NUMBER) {
                // If the cell value is a number, default to right alignment.
                hAlign = HorizontalAlign.RIGHT;
            } else if (cellData.t === CellValueType.BOOLEAN) {
                // If the cell value is a boolean, default to center alignment.
                hAlign = HorizontalAlign.CENTER;
            }
        }

        Text.drawWith(ctx, {
            text,
            fontStyle: fontCache.fontString,
            warp: wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0,
            hAlign,
            vAlign: fontCache.verticalAlign,
            width: cellWidth,
            height: cellHeight,
            left: paddingLeft,
            top: paddingTop,
            color: fontCache.style?.cl?.rgb,
            strokeLine: Boolean(fontCache.style?.st?.s),
            underline: Boolean(fontCache.style?.ul?.s),
        });
    }

    private _renderDocuments(
        ctx: UniverRenderingContext,
        row: number,
        col: number,
        renderFontCtx: IRenderFontContext,
        overflowCache: ObjectMatrix<IRange>
    ) {
        const documents = this.getDocuments() as Documents;

        if (documents == null) {
            throw new Error('documents is null');
        }
        const { fontCache } = renderFontCtx;
        if (!fontCache) return;

        const { documentSkeleton, vertexAngle = 0, wrapStrategy } = fontCache;
        if (!documentSkeleton) return;

        const documentDataModel = documentSkeleton.getViewModel().getDataModel();
        let { startX, startY, endX, endY } = renderFontCtx;
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;

        // WRAP means next line
        if (wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0) {
            documentDataModel.updateDocumentDataPageSize(endX - startX);
            documentSkeleton.calculate();
        } else {
            documentDataModel.updateDocumentDataPageSize(Number.POSITIVE_INFINITY);
        }

        // Use fix https://github.com/dream-num/univer/issues/927, Set the actual width of the content to the page width of the document,
        // so that the divide will be aligned when the skeleton is calculated.
        const overflowRectangle = overflowCache.getValue(row, col);
        const isOverflow = !(wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0);
        if (isOverflow && overflowRectangle) {
            const contentSize = getDocsSkeletonPageSize(documentSkeleton);

            const documentStyle = documentDataModel.getSnapshot().documentStyle;
            if (contentSize && documentStyle) {
                const { width } = contentSize;
                const { marginRight = 0, marginLeft = 0 } = documentStyle;

                documentSkeleton
                    .getViewModel()
                    .getDataModel()
                    .updateDocumentDataPageSize(width + marginLeft + marginRight);
                documentSkeleton.calculate();
            }
            const endColumn = overflowRectangle.endColumn;
            const startColumn = overflowRectangle.startColumn;
            const startRow = overflowRectangle.startRow;
            const endRow = overflowRectangle.endRow;
            const endCell = renderFontCtx.spreadsheetSkeleton.getCellWithCoordByIndex(endRow, endColumn);
            endX = endCell.endX;
            endY = endCell.endY;

            const startCell = renderFontCtx.spreadsheetSkeleton.getCellWithCoordByIndex(startRow, startColumn);
            startX = startCell.startX;
            startY = startCell.startY;
        }

        const viewBoundRightBottom = {
            right: endX - startX,
            bottom: endY - startY,
        };
        documentSkeleton.makeDirty(false);
        documents.resize(cellWidth, cellHeight);
        documents.changeSkeleton(documentSkeleton).render(ctx, {
            viewBound: {
                left: 0,
                top: 0,
                right: viewBoundRightBottom.right,
                bottom: viewBoundRightBottom.bottom,
            } as IBoundRectNoAngle,
        } as Partial<IViewportInfo>);
    }

    private _clipRectangleForOverflow(
        ctx: UniverRenderingContext,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        padding = 0
    ) {
        const startY = rowHeightAccumulation[startRow - 1] || 0;
        const endY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1];

        const startX = columnWidthAccumulation[startColumn - 1] || 0;
        const endX = columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1];

        ctx.rectByPrecision(startX + padding, startY + padding, endX - startX - 2 * padding, endY - startY - 2 * padding);
        ctx.clip();
        // ctx.clearRectForTexture(startX, startY, endX - startX, endY - startY);
    }
}

SpreadsheetExtensionRegistry.add(Font);
