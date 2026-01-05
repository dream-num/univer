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

import type { IRange, IScale, ObjectMatrix } from '@univerjs/core';
import type { UniverRenderingContext } from '../../../context';
import type { IDrawInfo } from '../../extension';
import type { BorderCache, BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { BorderStyleTypes, Range } from '@univerjs/core';
import { BORDER_TYPE as BORDER_LTRB, COLOR_BLACK_RGB, FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics/const';
import { drawDiagonalLineByBorderType, drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import { SpreadsheetExtensionRegistry } from '../../extension';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderExtension';
const BORDER_Z_INDEX = 50;

interface IRenderBorderContext {
    ctx: UniverRenderingContext;
    // border: BorderCacheItem;
    overflowCache: ObjectMatrix<IRange>;
    precisionScale: number;
    spreadsheetSkeleton: SpreadsheetSkeleton;
    diffRanges: IRange[];
    viewRanges: IRange[];
}

export class Border extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = BORDER_Z_INDEX;

    preStyle: BorderStyleTypes;
    preColor: string;

    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[],
        { viewRanges }: IDrawInfo
    ) {
        const { stylesCache, overflowCache, worksheet, rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton;
        if (!worksheet) return;
        if (
            !rowHeightAccumulation ||
            !columnWidthAccumulation ||
            columnTotalWidth === undefined ||
            rowTotalHeight === undefined
        ) {
            return;
        }

        const { border } = stylesCache;
        if (!border) return;

        ctx.save();
        // this would cause the dashed line ([1, 1]) style to be drawn incorrectly.(in zoom 100%)
        // but without this, lines looks thicker than before.
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        const precisionScale = this._getScale(ctx.getScale());
        const renderBorderContext = {
            ctx,
            precisionScale,
            overflowCache,
            diffRanges,
            viewRanges,
            spreadsheetSkeleton,
        } as IRenderBorderContext;

        ctx.beginPath();
        viewRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                const borderConfig = border.getValue(row, col);
                if (borderConfig) {
                    this.renderBorderByCell(renderBorderContext, row, col, borderConfig);
                }
            });
        });

        ctx.closePath();
        ctx.restore();
    }

    renderBorderByCell(renderBorderContext: IRenderBorderContext, row: number, col: number, borderCacheItem: BorderCache) {
        const { ctx, precisionScale, overflowCache, spreadsheetSkeleton, diffRanges } = renderBorderContext;

        const cellInfo = spreadsheetSkeleton.getCellWithCoordByIndex(row, col, false);

        const { startY: cellStartY, endY: cellEndY, startX: cellStartX, endX: cellEndX } = cellInfo;
        const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

        if (!isMerged) {
            const visibleRow = spreadsheetSkeleton.worksheet.getRowVisible(row);
            if (!visibleRow) return true;

            const visibleCol = spreadsheetSkeleton.worksheet.getColVisible(col);
            if (!visibleCol) return true;
        }

        if (!this.isRenderDiffRangesByRow(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
            return true;
        }

        for (const key in borderCacheItem) {
            const { type, style, color } = borderCacheItem[key] as BorderCacheItem;

            if (style === BorderStyleTypes.NONE) {
                continue;
            }

            let startY = cellStartY;
            let endY = cellEndY;
            let startX = cellStartX;
            let endX = cellEndX;

            if (type !== BORDER_LTRB.TOP && type !== BORDER_LTRB.BOTTOM && type !== BORDER_LTRB.LEFT && type !== BORDER_LTRB.RIGHT) {
                if (isMerged) {
                    return true;
                }

                if (isMergedMainCell) {
                    startY = mergeInfo.startY;
                    endY = mergeInfo.endY;
                    startX = mergeInfo.startX;
                    endX = mergeInfo.endX;
                }
            }

            const lineWidth = getLineWidth(style);
            setLineType(ctx, style);
            ctx.setLineWidthByPrecision(lineWidth);
            ctx.strokeStyle = color || COLOR_BLACK_RGB;

            drawDiagonalLineByBorderType(ctx, style, type, {
                startX,
                startY,
                endX,
                endY,
            });

            if (this._getOverflowExclusion(overflowCache, type, row, col)) {
                continue;
            }

            const lineWidthBuffer = (lineWidth - 1) / 2 / precisionScale;

            drawLineByBorderType(ctx, type, lineWidthBuffer, {
                startX,
                startY,
                endX,
                endY,
            });

            if (
                style === BorderStyleTypes.DOUBLE &&
                (
                    type === BORDER_LTRB.LEFT ||
                    type === BORDER_LTRB.RIGHT ||
                    type === BORDER_LTRB.TOP ||
                    type === BORDER_LTRB.BOTTOM
                )
            ) {
                this._renderDoubleBorder({ renderBorderContext, row, col, type, lineWidth, startX, startY, endX, endY });
            }
        }
    }

    private _getOverflowExclusion(
        overflowCache: ObjectMatrix<IRange>,
        type: BORDER_LTRB,
        borderRow: number,
        borderColumn: number
    ) {
        let isDraw = false;
        if (type === BORDER_LTRB.TOP || type === BORDER_LTRB.BOTTOM) {
            return isDraw;
        }

        overflowCache?.forRow((row, rowArray) => {
            if (row !== borderRow) {
                return true;
            }
            rowArray.forEach((column) => {
                const rectangle = overflowCache.getValue(row, column)!;
                const { startColumn, endColumn } = rectangle;
                if (type === BORDER_LTRB.LEFT && borderColumn > startColumn && borderColumn <= endColumn) {
                    isDraw = true;
                    return false;
                }

                if (type === BORDER_LTRB.RIGHT && borderColumn >= startColumn && borderColumn < endColumn) {
                    isDraw = true;
                    return false;
                }
            });
        });
        return isDraw;
    }

    // eslint-disable-next-line
    private _renderDoubleBorder({
        renderBorderContext,
        row,
        col,
        type,
        lineWidth,
        startX,
        startY,
        endX,
        endY,
    }: {
        renderBorderContext: IRenderBorderContext;
        row: number;
        col: number;
        type: BORDER_LTRB;
        lineWidth: number;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
    }) {
        const { ctx, precisionScale, spreadsheetSkeleton } = renderBorderContext;
        const borderCache = spreadsheetSkeleton.stylesCache.border!;
        const lineWidthBuffer = (lineWidth - 1) / 2 / precisionScale;
        const defaultOffset = lineWidth / 2;

        const clearMiddleLine = (rect: {
            startX: number;
            startY: number;
            endX: number;
            endY: number;
        }) => {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.globalCompositeOperation = 'destination-out';
            drawLineByBorderType(ctx, type, lineWidthBuffer, rect);
            ctx.restore();
        };

        const drawOuterLine = (offset: {
            startXOffset: number;
            startYOffset: number;
            endXOffset: number;
            endYOffset: number;
        }) => {
            const { startXOffset, startYOffset, endXOffset, endYOffset } = offset;
            drawLineByBorderType(ctx, type, lineWidthBuffer, {
                startX: startX - startXOffset,
                startY: startY - startYOffset,
                endX: endX + endXOffset,
                endY: endY + endYOffset,
            });
        };

        const drawInnerLine = (offset: {
            startXOffset: number;
            startYOffset: number;
            endXOffset: number;
            endYOffset: number;
        }) => {
            const { startXOffset, startYOffset, endXOffset, endYOffset } = offset;
            drawLineByBorderType(ctx, type, lineWidthBuffer, {
                startX: startX + startXOffset,
                startY: startY + startYOffset,
                endX: endX - endXOffset,
                endY: endY - endYOffset,
            });
        };

        const leftCellBorder = this._getSpecificCellBorder(borderCache, row, col - 1);
        const rightCellBorder = this._getSpecificCellBorder(borderCache, row, col + 1);
        const topCellBorder = this._getSpecificCellBorder(borderCache, row - 1, col);
        const bottomCellBorder = this._getSpecificCellBorder(borderCache, row + 1, col);

        const clearLine = {
            startX,
            startY,
            endX,
            endY,
        };
        const innerLineOffsets = {
            startXOffset: defaultOffset,
            startYOffset: defaultOffset,
            endXOffset: defaultOffset,
            endYOffset: defaultOffset,
        };
        const outerLineOffsets = {
            startXOffset: defaultOffset,
            startYOffset: defaultOffset,
            endXOffset: defaultOffset,
            endYOffset: defaultOffset,
        };

        if (type === BORDER_LTRB.LEFT || type === BORDER_LTRB.RIGHT) {
            if (topCellBorder.bottom && topCellBorder.bottom.style !== BorderStyleTypes.DOUBLE) {
                outerLineOffsets.startYOffset = 0;
                innerLineOffsets.startYOffset = 0;
            } else {
                const leftTopCellBorder = this._getSpecificCellBorder(borderCache, row - 1, col - 1);
                const rightTopCellBorder = this._getSpecificCellBorder(borderCache, row - 1, col + 1);

                if (
                    (
                        type === BORDER_LTRB.LEFT &&
                        (leftCellBorder.top?.style === BorderStyleTypes.DOUBLE || leftTopCellBorder.bottom?.style === BorderStyleTypes.DOUBLE)
                    ) ||
                    (
                        type === BORDER_LTRB.RIGHT &&
                        (rightCellBorder.top?.style === BorderStyleTypes.DOUBLE || rightTopCellBorder.bottom?.style === BorderStyleTypes.DOUBLE)
                    )
                ) {
                    outerLineOffsets.startYOffset = -defaultOffset;
                } else if (
                    (type === BORDER_LTRB.LEFT && leftTopCellBorder.bottom && leftTopCellBorder.bottom.style !== BorderStyleTypes.DOUBLE) ||
                    (type === BORDER_LTRB.RIGHT && rightTopCellBorder.bottom && rightTopCellBorder.bottom.style !== BorderStyleTypes.DOUBLE)
                ) {
                    outerLineOffsets.startYOffset = 0;
                } else {
                    outerLineOffsets.startYOffset = defaultOffset;
                }

                innerLineOffsets.startYOffset = defaultOffset;
            }

            if (bottomCellBorder.top && bottomCellBorder.top.style !== BorderStyleTypes.DOUBLE) {
                outerLineOffsets.endYOffset = 0;
                innerLineOffsets.endYOffset = 0;
            } else {
                const leftBottomCellBorder = this._getSpecificCellBorder(borderCache, row + 1, col - 1);
                const rightBottomCellBorder = this._getSpecificCellBorder(borderCache, row + 1, col + 1);

                if (
                    (
                        type === BORDER_LTRB.LEFT &&
                        (leftCellBorder.bottom?.style === BorderStyleTypes.DOUBLE || leftBottomCellBorder.top?.style === BorderStyleTypes.DOUBLE)
                    ) ||
                    (
                        type === BORDER_LTRB.RIGHT &&
                        (rightCellBorder.bottom?.style === BorderStyleTypes.DOUBLE || rightBottomCellBorder.top?.style === BorderStyleTypes.DOUBLE)
                    )
                ) {
                    outerLineOffsets.endYOffset = -defaultOffset;
                } else if (
                    (type === BORDER_LTRB.LEFT && leftBottomCellBorder.top && leftBottomCellBorder.top.style !== BorderStyleTypes.DOUBLE) ||
                    (type === BORDER_LTRB.RIGHT && rightBottomCellBorder.top && rightBottomCellBorder.top.style !== BorderStyleTypes.DOUBLE)
                ) {
                    outerLineOffsets.endYOffset = 0;
                } else {
                    outerLineOffsets.endYOffset = defaultOffset;
                }

                innerLineOffsets.endYOffset = defaultOffset;
            }

            clearLine.startY = startY - defaultOffset;
            clearLine.endY = endY + defaultOffset;
            clearMiddleLine(clearLine);

            if (
                (type === BORDER_LTRB.LEFT && !leftCellBorder.right) ||
                (type === BORDER_LTRB.RIGHT && !rightCellBorder.left)
            ) {
                drawOuterLine(outerLineOffsets);
            }

            drawInnerLine(innerLineOffsets);
        } else if (type === BORDER_LTRB.TOP || type === BORDER_LTRB.BOTTOM) {
            if (leftCellBorder.right && leftCellBorder.right.style !== BorderStyleTypes.DOUBLE) {
                outerLineOffsets.startXOffset = 0;
                innerLineOffsets.startXOffset = 0;
            } else {
                const topLeftCellBorder = this._getSpecificCellBorder(borderCache, row - 1, col - 1);
                const bottomLeftCellBorder = this._getSpecificCellBorder(borderCache, row + 1, col - 1);

                if (
                    (
                        type === BORDER_LTRB.TOP &&
                        (topCellBorder.left?.style === BorderStyleTypes.DOUBLE || topLeftCellBorder.right?.style === BorderStyleTypes.DOUBLE)
                    ) ||
                    (
                        type === BORDER_LTRB.BOTTOM &&
                        (bottomCellBorder.left?.style === BorderStyleTypes.DOUBLE || bottomLeftCellBorder.right?.style === BorderStyleTypes.DOUBLE)
                    )
                ) {
                    outerLineOffsets.startXOffset = -defaultOffset;
                } else if (
                    (type === BORDER_LTRB.TOP && topLeftCellBorder.right && topLeftCellBorder.right.style !== BorderStyleTypes.DOUBLE) ||
                    (type === BORDER_LTRB.BOTTOM && bottomLeftCellBorder.right && bottomLeftCellBorder.right.style !== BorderStyleTypes.DOUBLE)
                ) {
                    outerLineOffsets.startXOffset = 0;
                } else {
                    outerLineOffsets.startXOffset = defaultOffset;
                }

                innerLineOffsets.startXOffset = defaultOffset;
            }

            if (rightCellBorder.left && rightCellBorder.left.style !== BorderStyleTypes.DOUBLE) {
                outerLineOffsets.endXOffset = 0;
                innerLineOffsets.endXOffset = 0;
            } else {
                const topRightCellBorder = this._getSpecificCellBorder(borderCache, row - 1, col + 1);
                const bottomRightCellBorder = this._getSpecificCellBorder(borderCache, row + 1, col + 1);

                if (
                    (
                        type === BORDER_LTRB.TOP &&
                        (topCellBorder.right?.style === BorderStyleTypes.DOUBLE || topRightCellBorder.left?.style === BorderStyleTypes.DOUBLE)
                    ) ||
                    (
                        type === BORDER_LTRB.BOTTOM &&
                        (bottomCellBorder.right?.style === BorderStyleTypes.DOUBLE || bottomRightCellBorder.left?.style === BorderStyleTypes.DOUBLE)
                    )
                ) {
                    outerLineOffsets.endXOffset = -defaultOffset;
                } else if (
                    (type === BORDER_LTRB.TOP && topRightCellBorder.left && topRightCellBorder.left.style !== BorderStyleTypes.DOUBLE) ||
                    (type === BORDER_LTRB.BOTTOM && bottomRightCellBorder.left && bottomRightCellBorder.left.style !== BorderStyleTypes.DOUBLE)
                ) {
                    outerLineOffsets.endXOffset = 0;
                } else {
                    outerLineOffsets.endXOffset = defaultOffset;
                }

                innerLineOffsets.endXOffset = defaultOffset;
            }

            clearLine.startX = startX - defaultOffset;
            clearLine.endX = endX + defaultOffset;
            clearMiddleLine(clearLine);

            if (
                (type === BORDER_LTRB.TOP && !topCellBorder.bottom) ||
                (type === BORDER_LTRB.BOTTOM && !bottomCellBorder.top)
            ) {
                drawOuterLine(outerLineOffsets);
            }

            drawInnerLine(innerLineOffsets);
        }
    }

    private _getSpecificCellBorder(borderCache: ObjectMatrix<BorderCache>, row: number, col: number): Record<string, BorderCacheItem | null> {
        const cellBorder = borderCache.getValue(row, col);

        let left = null;
        let right = null;
        let top = null;
        let bottom = null;

        if (cellBorder) {
            if (cellBorder[BORDER_LTRB.LEFT] && Object.prototype.hasOwnProperty.call(cellBorder[BORDER_LTRB.LEFT], 'type')) {
                left = cellBorder[BORDER_LTRB.LEFT] as BorderCacheItem;
            }

            if (cellBorder[BORDER_LTRB.RIGHT] && Object.prototype.hasOwnProperty.call(cellBorder[BORDER_LTRB.RIGHT], 'type')) {
                right = cellBorder[BORDER_LTRB.RIGHT] as BorderCacheItem;
            }

            if (cellBorder[BORDER_LTRB.TOP] && Object.prototype.hasOwnProperty.call(cellBorder[BORDER_LTRB.TOP], 'type')) {
                top = cellBorder[BORDER_LTRB.TOP] as BorderCacheItem;
            }

            if (cellBorder[BORDER_LTRB.BOTTOM] && Object.prototype.hasOwnProperty.call(cellBorder[BORDER_LTRB.BOTTOM], 'type')) {
                bottom = cellBorder[BORDER_LTRB.BOTTOM] as BorderCacheItem;
            }
        }

        return {
            left,
            right,
            top,
            bottom,
        };
    }
}

SpreadsheetExtensionRegistry.add(Border);
