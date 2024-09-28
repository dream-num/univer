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

import { HorizontalAlign, Range, WrapStrategy } from '@univerjs/core';
import { clampRange } from '@univerjs/engine-render';
import type { ICellDataForSheetInterceptor, IRange, IScale, Nullable, ObjectMatrix } from '@univerjs/core';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics';
import { VERTICAL_ROTATE_ANGLE } from '../../../basics/text-rotation';
import { inViewRanges } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { getDocsSkeletonPageSize, type SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';
import type { UniverRenderingContext } from '../../../context';
import type { Documents } from '../../docs/document';
import type { IDrawInfo } from '../../extension';
import type { IFontCacheItem } from '../interfaces';
import type { SheetComponent } from '../sheet-component';

const UNIQUE_KEY = 'DefaultFontExtension';
const EXTENSION_Z_INDEX = 45;
const EXPAND_SIZE_FOR_RENDER_OVERFLOW = 20;
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
}

export class Font extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = EXTENSION_Z_INDEX;

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
        // fontMatrix.forValue((row: number, col: number, fontsConfig: IFontCacheItem) => {
        //     this.renderFontByCellMatrix(renderFontContext, row, col, fontsConfig);
        // });
        viewRanges.forEach((range) => {
            range.startColumn -= EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range.endColumn += EXPAND_SIZE_FOR_RENDER_OVERFLOW;
            range = clampRange(range);
            Range.foreach(range, (row, col) => {
                this.renderFontEachCell(renderFontContext, row, col, fontMatrix);
            });
        });

        ctx.restore();
    }

    clipTextOverflow(renderFontContext: IRenderFontContext, row: number, col: number, fontMatrix: ObjectMatrix<IFontCacheItem>) {
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
    }

    renderFontEachCell(renderFontContext: IRenderFontContext, row: number, col: number, fontMatrix: ObjectMatrix<IFontCacheItem>) {
        const { ctx, viewRanges, diffRanges, spreadsheetSkeleton } = renderFontContext;

        //#region merged cell
        const calcHeader = false;
        const cellInfo = spreadsheetSkeleton.getMergedCellInfo(row, col, calcHeader);
        let { startY, endY, startX, endX } = cellInfo;
        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

        // merged, but not primary cell
        if (isMerged && !isMergedMainCell) {
            // return true;
            const mergeMainCellRow = mergeInfo.startRow;
            const mergeMainCellCol = mergeInfo.startColumn;
            row = mergeMainCellRow;
            col = mergeMainCellCol;

            startY = mergeInfo.startY;
            endY = mergeInfo.endY;
            startX = mergeInfo.startX;
            endX = mergeInfo.endX;
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
        renderFontContext.overflowRectangle = overflowRange;
        renderFontContext.cellData = cellData;
        renderFontContext.startX = startX;
        renderFontContext.startY = startY;
        renderFontContext.endX = endX;
        renderFontContext.endY = endY;
        this.clipTextOverflow(renderFontContext, row, col, fontMatrix);
        //#endregion

        ctx.translate(startX + FIX_ONE_PIXEL_BLUR_OFFSET, startY + FIX_ONE_PIXEL_BLUR_OFFSET);
        this._renderDocuments(ctx, fontsConfig, startX, startY, endX, endY, row, col, spreadsheetSkeleton.overflowCache);

        ctx.closePath();
        ctx.restore();
    };

    private _renderDocuments(
        ctx: UniverRenderingContext,
        // docsConfig.documentSkeleton.getSkeletonData().pages[0].sections[0].columns[0].lines[0].divides[0].glyphGroup[0].fontStyle
        docsConfig: IFontCacheItem,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        row: number,
        column: number,
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
        const overflowRectangle = overflowCache.getValue(row, column);

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
