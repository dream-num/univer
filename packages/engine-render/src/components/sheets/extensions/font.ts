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
import { inCurrentAndAboveViewRanges, inRowViewRanges, inViewRanges, mergeRangeIfIntersects } from '../../../basics/tools';
import type { UniverRenderingContext } from '../../../context';
import type { Documents } from '../../docs/document';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { IFontCacheItem } from '../interfaces';
import type { SheetComponent } from '../sheet-component';
import { getDocsSkeletonPageSize, type SpreadsheetSkeleton } from '../sheet-skeleton';
import { FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics';
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

    override draw(
        ctx: UniverRenderingContext,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        moreBoundsInfo: { viewRanges: IRange[]; checkOutOfViewBound?: boolean; viewPortKey: string }
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

                // 提前退出渲染的条件
                // viewMainTop 要考虑来自左右两边单元格的溢出
                // viewLeft 要考虑来自上方合并单元格
                // viewMain 要考虑左右溢出和上方合并的单元格的内容
                // 因此, 在 viewBounds 中的下方的单元格 ---> 提前退出
                // 而 viewMainLeftTop 不受 viewBounds 之外的影响, 因此视野外的单元格提前退出
                // 此外, 不是溢出, 又不在视野内可以提前退出 (视野需要考虑合并单元格带来的影响)

                // eslint-disable-next-line complexity
                fontObjectArray.forValue((rowIndex, columnIndex, docsConfig) => {
                    if (checkOutOfViewBound) {
                        // 下方单元格 提前退出
                        if (!inCurrentAndAboveViewRanges(viewRanges!, rowIndex)) {
                            return true;
                        }
                    } else {
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

                    // 合并后单元格与当前 viewRange 有交叉, 则合并到当前 viewRange 中
                    // 合并后 font extension 在当前 viewBounds 中也走一次绘制
                    // 但是此刻还不能认为不在 viewRanges 内就退出
                    // 横向还可能存在 overflow, 因此此刻只能排除不在当前 row 的单元格
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
                    if (!this.isRowInDiffRanges(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
                        return true;
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

                    const cellData = worksheet.getCell(rowIndex, columnIndex) as ICellData & ISheetFontRenderExtension || {};
                    if (cellData.fontRenderExtension?.isSkip) {
                        return true;
                    }

                    // 单元格是否溢出 没有设置溢出 overflowRectangle 为 undefined
                    const overflowRectangle = overflowCache.getValue(rowIndex, columnIndex);
                    const { horizontalAlign, vertexAngle = 0, centerAngle = 0 } = docsConfig;

                    // 既不是溢出, 又不在当前 range 内, 那么提前退出(已考虑合并单元格带来的 range 扩展)
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
