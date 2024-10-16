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

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import type { ICellDataForSheetInterceptor, IRange, IScale, ISelectionCellWithMergeInfo, Nullable, ObjectMatrix } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { Documents } from '../../docs/document';
import type { IDrawInfo } from '../../extension';
import type { IFontCacheItem } from '../interfaces';
import type { SheetComponent } from '../sheet-component';
import { HorizontalAlign, Range, WrapStrategy } from '@univerjs/core';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics';
import { VERTICAL_ROTATE_ANGLE } from '../../../basics/text-rotation';
import { clampRange, inViewRanges } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { EXPAND_SIZE_FOR_RENDER_OVERFLOW, FONT_EXTENSION_Z_INDEX } from '../constants';
import { getDocsSkeletonPageSize, type SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultFontExtension';

interface IRenderFontContext {
    ctx: UniverRenderingContext;
    scale: number;
    rowHeightAccumulation: number[];
    columnTotalWidth: number;
    columnWidthAccumulation: number[];
    rowTotalHeight: number;
    viewRanges: IRange[];
    checkOutOfViewBound: boolean;
    diffRanges: IRange[];
    spreadsheetSkeleton: SpreadsheetSkeleton;
    overflowRectangle: Nullable<IRange>;
    cellData: ICellDataForSheetInterceptor;
    startY: number;
    endY: number;
    startX: number;
    endX: number;
    cellInfo: ISelectionCellWithMergeInfo;
}

export class Font extends SheetExtension {
    override uKey = UNIQUE_KEY;
    override Z_INDEX = FONT_EXTENSION_Z_INDEX;

    getDocuments() {
        const parent = this.parent as SheetComponent;
        return parent?.getDocuments();
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
            rowHeightAccumulation,
            columnTotalWidth,
            columnWidthAccumulation,
            rowTotalHeight,
            viewRanges,
            checkOutOfViewBound: checkOutOfViewBound || true,
            diffRanges,
            spreadsheetSkeleton,
        } as IRenderFontContext;
        ctx.save();

        // old way, it lags, because it has too many loops, fontMatrix holds all sheet font data.
        // fontMatrix.forValue((row: number, col: number, fontsConfig: IFontCacheItem) => {
        //     this.renderFontByCellMatrix(renderFontContext, row, col, fontsConfig);
        // });

        const uniqueMergeRanges: IRange[] = [];
        const mergeRangeIDSet = new Set();

        // Currently, viewRanges has only one range.
        viewRanges.forEach((range) => {
            range.startColumn -= EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range.endColumn += EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range = clampRange(range);

            // collect unique merge ranges intersect with view range.
            // The ranges in mergeRanges must be unique. Otherwise, the font will rereder, text redrawing causes jagged edges or artifacts.
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
                // put all merged cells to another pass to render. -1 means not merged.
                if (index !== -1) {
                    return;
                }
                const cellInfo = spreadsheetSkeleton.getCellByIndexWithNoHeader(row, col);
                if (!cellInfo) return;

                renderFontContext.cellInfo = cellInfo;
                this.renderFontEachCell(renderFontContext, row, col, fontMatrix);
            });
        });

        uniqueMergeRanges.forEach((range) => {
            const cellInfo = spreadsheetSkeleton.getCellByIndexWithNoHeader(range.startRow, range.startColumn);
            renderFontContext.cellInfo = cellInfo;
            this.renderFontEachCell(renderFontContext, range.startRow, range.startColumn, fontMatrix);
        });

        ctx.restore();
    }

    renderFontEachCell(renderFontCtx: IRenderFontContext, row: number, col: number, fontMatrix: ObjectMatrix<IFontCacheItem>) {
        const { ctx, viewRanges, diffRanges, spreadsheetSkeleton, cellInfo } = renderFontCtx;

        //#region merged cell
        let { startY, endY, startX, endX } = cellInfo;
        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

        // merged, but not primary cell, then skip. DO NOT RENDER AGAIN, or that would cause font blurry.
        if (isMerged && !isMergedMainCell) {
            return true;
        }

        // merged and primary cell
        if (isMergedMainCell) {
            startY = mergeInfo.startY;
            endY = mergeInfo.endY;
            startX = mergeInfo.startX;
            endX = mergeInfo.endX;
        }
        //#endregion

        const fontsConfig = fontMatrix.getValue(row, col);
        if (!fontsConfig) return true;

        //#region overflow
        // If the cell is overflowing, but the overflowRectangle has not been set,
        // then overflowRectangle is set to undefined.
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

        const cellData = spreadsheetSkeleton.worksheet.getCell(row, col) as ICellDataForSheetInterceptor || {};
        if (cellData.fontRenderExtension?.isSkip) {
            return true;
        }

        ctx.save();
        ctx.beginPath();

        //#region text overflow
        renderFontCtx.overflowRectangle = overflowRange;
        renderFontCtx.cellData = cellData;
        renderFontCtx.startX = startX;
        renderFontCtx.startY = startY;
        renderFontCtx.endX = endX;
        renderFontCtx.endY = endY;
        this._setFontRenderBounds(renderFontCtx, row, col, fontMatrix);
        //#endregion

        ctx.translate(startX + FIX_ONE_PIXEL_BLUR_OFFSET, startY + FIX_ONE_PIXEL_BLUR_OFFSET);
        this._renderDocuments(ctx, fontsConfig, renderFontCtx.startX, renderFontCtx.startY, renderFontCtx.endX, renderFontCtx.endY, row, col, spreadsheetSkeleton.overflowCache);

        ctx.closePath();
        ctx.restore();
    };

    /**
     * Change font render bounds, for overflow and filter icon & custom render.
     * @param renderFontContext
     * @param row
     * @param col
     * @param fontMatrix
     */
    private _setFontRenderBounds(renderFontContext: IRenderFontContext, row: number, col: number, fontMatrix: ObjectMatrix<IFontCacheItem>) {
        const { ctx, scale, overflowRectangle, rowHeightAccumulation, columnWidthAccumulation, cellData } = renderFontContext;
        let { startX, endX, startY, endY } = renderFontContext;

        // https://github.com/dream-num/univer-pro/issues/334
        // When horizontal alignment is not set, the default alignment for rotation angles varies to accommodate overflow scenarios.
        const fontsConfig = fontMatrix.getValue(row, col)!;
        const { horizontalAlign, vertexAngle = 0, centerAngle = 0 } = fontsConfig;
        let horizontalAlignOverFlow = horizontalAlign;
        if (horizontalAlign === HorizontalAlign.UNSPECIFIED) {
            if (centerAngle === VERTICAL_ROTATE_ANGLE && vertexAngle === VERTICAL_ROTATE_ANGLE) {
                horizontalAlignOverFlow = HorizontalAlign.CENTER;
            } else if ((vertexAngle > 0 && vertexAngle !== VERTICAL_ROTATE_ANGLE) || vertexAngle === -VERTICAL_ROTATE_ANGLE) {
                horizontalAlignOverFlow = HorizontalAlign.RIGHT;
            }
        }

        const rightOffset = cellData.fontRenderExtension?.rightOffset ?? 0;
        const leftOffset = cellData.fontRenderExtension?.leftOffset ?? 0;
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
                        columnWidthAccumulation
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
                        columnWidthAccumulation
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
                        columnWidthAccumulation
                    );
                }
            }
        } else {
            ctx.rectByPrecision(startX + 1 / scale, startY + 1 / scale, cellWidth - 2 / scale, cellHeight - 2 / scale);
            // for normal cell, forbid text overflow cellarea
            ctx.clip();
        }
        renderFontContext.startX = startX;
        renderFontContext.startY = startY;
        renderFontContext.endX = endX;
        renderFontContext.endY = endY;
    }

    private _renderDocuments(
        ctx: UniverRenderingContext,
        // docsConfig.documentSkeleton.getSkeletonData().pages[0].sections[0].columns[0].lines[0].divides[0].glyphGroup[0].fontStyle
        docsConfig: IFontCacheItem,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        row: number,
        col: number,
        overflowCache: ObjectMatrix<IRange>
    ) {
        const documents = this.getDocuments() as Documents;

        if (documents == null) {
            throw new Error('documents is null');
        }

        const { documentSkeleton, vertexAngle = 0, wrapStrategy } = docsConfig;
        const cellHeight = endY - startY;
        const cellWidth = endX - startX;

        // WRAP means next line
        if (wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0) {
            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(cellWidth);
            documentSkeleton.calculate();
        } else {
            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(Number.POSITIVE_INFINITY);
        }

        // Use fix https://github.com/dream-num/univer/issues/927, Set the actual width of the content to the page width of the document,
        // so that the divide will be aligned when the skeleton is calculated.
        const overflowRectangle = overflowCache.getValue(row, col);

        const isOverflow = !(wrapStrategy === WrapStrategy.WRAP && !overflowRectangle && vertexAngle === 0);
        if (isOverflow) {
            const contentSize = getDocsSkeletonPageSize(documentSkeleton);

            const documentStyle = documentSkeleton.getViewModel().getDataModel().getSnapshot().documentStyle;
            if (contentSize && documentStyle) {
                const { width } = contentSize;
                const { marginRight = 0, marginLeft = 0 } = documentStyle;

                documentSkeleton
                    .getViewModel()
                    .getDataModel()
                    .updateDocumentDataPageSize(width + marginLeft + marginRight);
                documentSkeleton.calculate();
            }
        }

        documentSkeleton.makeDirty(false);
        documents.resize(cellWidth, cellHeight);
        documents.changeSkeleton(documentSkeleton).render(ctx);
    }

    private _clipRectangleForOverflow(
        ctx: UniverRenderingContext,
        startRow: number,
        endRow: number,
        startColumn: number,
        endColumn: number,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[]
    ) {
        const startY = rowHeightAccumulation[startRow - 1] || 0;
        const endY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1];

        const startX = columnWidthAccumulation[startColumn - 1] || 0;
        const endX = columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1];

        ctx.rectByPrecision(startX, startY, endX - startX, endY - startY);
        ctx.clip();
        // ctx.clearRectForTexture(startX, startY, endX - startX, endY - startY);
    }
}

SpreadsheetExtensionRegistry.add(Font);
