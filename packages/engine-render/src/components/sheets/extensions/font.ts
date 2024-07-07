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

import type { ICellData, IRange, IScale, ObjectMatrix } from '@univerjs/core';
import { HorizontalAlign, WrapStrategy } from '@univerjs/core';

import { VERTICAL_ROTATE_ANGLE } from '../../../basics/text-rotation';
import { inRowViewRanges, inViewRanges, mergeRangeIfIntersects } from '../../../basics/tools';
import type { UniverRenderingContext } from '../../../context';
import type { Documents } from '../../docs/document';
import type { IDrawInfo } from '../../extension';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { IFontCacheItem } from '../interfaces';
import type { SheetComponent } from '../sheet-component';
import { getDocsSkeletonPageSize, type SpreadsheetSkeleton } from '../sheet-skeleton';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics';
import type { Spreadsheet } from '../spreadsheet';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultFontExtension';

const EXTENSION_Z_INDEX = 45;
export interface ISheetFontRenderExtension {
    fontRenderExtension?: {
        leftOffset?: number;
        rightOffset?: number;
        topOffset?: number;
        downOffset?: number;
        isSkip?: boolean;
    };
};
export class Font extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = EXTENSION_Z_INDEX;

    getDocuments() {
        const parent = this.parent as SheetComponent;
        return parent?.getDocuments();
    }

    private _getSheetComponent() {
        return this.parent as Spreadsheet;
    }

    override draw(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        moreBoundsInfo: IDrawInfo
    ) {
        const { viewRanges = [], checkOutOfViewBound } = moreBoundsInfo;
        const { stylesCache, dataMergeCache, overflowCache, worksheet } = spreadsheetSkeleton;
        const { font: fontList } = stylesCache;
        if (!spreadsheetSkeleton || !worksheet) {
            return;
        }

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
        ctx.save();
        const scale = this._getScale(parentScale);
        fontList &&
            Object.keys(fontList).forEach((fontFormat: string) => {
                const fontObjectArray = fontList[fontFormat];

                // Since the overflow can spill out to both the left and right sides,
                // we need to consider the content outside the viewBounds.
                // At the same time, there are also merged cells, so we need to merge the current
                // viewrange and a single merged area when calculating.

                // Early exit from font condition
                // If it's not an overflow and not within the field of view, we can exit early
                // (the field of view needs to consider the impact of merged cells).

                // eslint-disable-next-line complexity
                fontObjectArray.forValue((rowIndex, columnIndex, docsConfig) => {
                    if (!checkOutOfViewBound) {
                        if (!inViewRanges(viewRanges!, rowIndex, columnIndex)) {
                            return true;
                        }
                    }
                    const cellInfo = this.getCellIndex(
                        rowIndex,
                        columnIndex,
                        rowHeightAccumulation,
                        columnWidthAccumulation,
                        dataMergeCache
                    );
                    let { startY, endY, startX, endX } = cellInfo;
                    const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

                    if (isMerged) {
                        return true;
                    }

                    // If the merged cell area intersects with the current viewRange,
                    // then merge it into the current viewRange.
                    // After the merge, the font extension within the current viewBounds
                    // also needs to be drawn once.
                    // But at this moment, we cannot assume that it is not within the viewRanges and exit, because there may still be horizontal overflow.
                    // At this moment, we can only exclude the cells that are not within the current row.
                    const mergeTo = diffRanges && diffRanges.length > 0 ? diffRanges : viewRanges;
                    const combineWithMergeRanges = mergeRangeIfIntersects(mergeTo, [mergeInfo]);
                    if (!inRowViewRanges(combineWithMergeRanges, rowIndex)) {
                        return true;
                    }

                    if (isMergedMainCell) {
                        startY = mergeInfo.startY;
                        endY = mergeInfo.endY;
                        startX = mergeInfo.startX;
                        endX = mergeInfo.endX;
                    }
                    /**
                     * Incremental content rendering for texture mapping
                     * startRow endRow 和 diffRanges 在 row 上不相交, 那么返回不渲染
                     * PS 如果这个单元格并不在 merge 区域内, mergeInfo start 和 end 就是单元格本身
                     */
                    if (diffRanges) {
                        if (!this.isRowInRanges(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
                            return true;
                        }
                    }

                    /**
                     * Overflow can cause text truncation, so columns are not rendered incrementally.
                     */
                    // if (
                    //     !this.isRenderDiffRangesByColumn(mergeInfo.startColumn, diffRanges) &&
                    //     !this.isRenderDiffRangesByColumn(mergeInfo.endColumn, diffRanges)
                    // ) {
                    //     return true;
                    // }

                    // If the cell is overflowing, but the overflowRectangle has not been set,
                    // then overflowRectangle is set to undefined.
                    const overflowRectangle = overflowCache.getValue(rowIndex, columnIndex);
                    const { horizontalAlign, vertexAngle = 0, centerAngle = 0 } = docsConfig;

                    // If it's neither an overflow nor within the current range,
                    // then we can exit early (taking into account the range extension
                    // caused by the merged cells).
                    if (!overflowRectangle && !inViewRanges(combineWithMergeRanges, rowIndex, columnIndex)) {
                        return true;
                    }

                    /**
                     * https://github.com/dream-num/univer-pro/issues/334
                     * When horizontal alignment is not set, the default alignment for rotation angles varies to accommodate overflow scenarios.
                     */
                    let horizontalAlignOverFlow = horizontalAlign;
                    if (horizontalAlign === HorizontalAlign.UNSPECIFIED) {
                        if (centerAngle === VERTICAL_ROTATE_ANGLE && vertexAngle === VERTICAL_ROTATE_ANGLE) {
                            horizontalAlignOverFlow = HorizontalAlign.CENTER;
                        } else if ((vertexAngle > 0 && vertexAngle !== VERTICAL_ROTATE_ANGLE) || vertexAngle === -VERTICAL_ROTATE_ANGLE) {
                            horizontalAlignOverFlow = HorizontalAlign.RIGHT;
                        }
                    }

                    const cellData = worksheet.getCell(rowIndex, columnIndex) as ICellData & ISheetFontRenderExtension || {};
                    if (cellData.fontRenderExtension?.isSkip) {
                        return true;
                    }

                    ctx.save();
                    ctx.beginPath();

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
                        if (startColumn === endColumn && startColumn === columnIndex) {
                            ctx.rectByPrecision(
                                startX + 1 / scale,
                                startY + 1 / scale,
                                cellWidth - 2 / scale,
                                cellHeight - 2 / scale
                            );
                            ctx.clip();
                            // ctx.clearRectForTexture(
                            //     startX + 1 / scale,
                            //     startY + 1 / scale,
                            //     cellWidth - 2 / scale,
                            //     cellHeight - 2 / scale
                            // );
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
                                    rowIndex,
                                    startColumn,
                                    columnIndex,
                                    scale,
                                    rowHeightAccumulation,
                                    columnWidthAccumulation
                                );
                            } else {
                                this._clipRectangleForOverflow(
                                    ctx,
                                    rowIndex,
                                    endRow,
                                    columnIndex,
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
                        // ctx.clearRectForTexture(
                        //     startX + 1 / scale,
                        //     startY + 1 / scale,
                        //     cellWidth - 2 / scale,
                        //     cellHeight - 2 / scale
                        // );
                    }
                    ctx.translate(startX + FIX_ONE_PIXEL_BLUR_OFFSET, startY + FIX_ONE_PIXEL_BLUR_OFFSET);
                    this._renderDocuments(ctx, docsConfig, startX, startY, endX, endY, rowIndex, columnIndex, overflowCache);
                    ctx.closePath();
                    ctx.restore();
                });
            });
        ctx.restore();
    }

    private _renderDocuments(
        ctx: UniverRenderingContext,
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
        const sheetComponent = this._getSheetComponent();

        if (documents == null) {
            throw new Error('documents is null');
        }

        const { documentSkeleton, vertexAngle = 0, wrapStrategy } = docsConfig;
        const cellWidth = endX - startX;
        const cellHeight = endY - startY;

        if (wrapStrategy === WrapStrategy.WRAP && vertexAngle === 0) {
            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(cellWidth);
            documentSkeleton.calculate();
        } else {
            documentSkeleton.getViewModel().getDataModel().updateDocumentDataPageSize(Number.POSITIVE_INFINITY);
        }

        // Use fix https://github.com/dream-num/univer/issues/927, Set the actual width of the content to the page width of the document,
        // so that the divide will be aligned when the skeleton is calculated.
        const overflowRectangle = overflowCache.getValue(row, column);
        if (!(wrapStrategy === WrapStrategy.WRAP && !overflowRectangle && vertexAngle === 0)) {
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

        sheetComponent.notifyCellRender({
            docSkeleton: documentSkeleton,
            cellX: startX,
            cellY: startY,
        });
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
