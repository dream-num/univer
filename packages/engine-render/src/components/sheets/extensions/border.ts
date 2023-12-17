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

import type { BorderStyleTypes, IRange, IScale, ObjectMatrix } from '@univerjs/core';

import { BORDER_TYPE, COLOR_BLACK_RGB, FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics/const';
import { drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import { fixLineWidthByScale } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderExtension';

const BORDER_Z_INDEX = 30;

export class Border extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = BORDER_Z_INDEX;

    override draw(
        ctx: CanvasRenderingContext2D,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges?: IRange[]
    ) {
        const { dataMergeCache, stylesCache, overflowCache } = spreadsheetSkeleton;
        const { border } = stylesCache;
        if (!spreadsheetSkeleton) {
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
        const { scaleX = 1, scaleY = 1 } = parentScale;

        const scale = this._getScale(parentScale);

        let preStyle: BorderStyleTypes;
        let preColor: string;

        ctx.translate(FIX_ONE_PIXEL_BLUR_OFFSET / scale, FIX_ONE_PIXEL_BLUR_OFFSET / scale);

        border?.forEach((rowIndex, borderColumns) => {
            borderColumns?.forEach((columnIndex: number, borderCaches) => {
                if (!borderCaches) {
                    return true;
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

                if (isMergedMainCell) {
                    startY = mergeInfo.startY;
                    endY = mergeInfo.endY;
                    startX = mergeInfo.startX;
                    endX = mergeInfo.endX;
                }

                if (
                    !this.isRenderDiffRangesByRow(mergeInfo.startRow - 1, diffRanges) &&
                    !this.isRenderDiffRangesByRow(mergeInfo.endRow + 1, diffRanges)
                ) {
                    return true;
                }

                if (
                    !this.isRenderDiffRangesByColumn(mergeInfo.startColumn - 1, diffRanges) &&
                    !this.isRenderDiffRangesByColumn(mergeInfo.endColumn + 1, diffRanges)
                ) {
                    return true;
                }

                for (const key in borderCaches) {
                    const { type, style, color } = borderCaches[key] as BorderCacheItem;

                    if (this._getOverflowExclusion(overflowCache, type, rowIndex, columnIndex)) {
                        continue;
                    }

                    if (style !== preStyle) {
                        setLineType(ctx, style);
                        ctx.lineWidth = getLineWidth(style) / scale;
                        preStyle = style;
                    }

                    if (color !== preColor) {
                        ctx.strokeStyle = color || COLOR_BLACK_RGB;
                        preColor = color;
                    }

                    // make sure border would not overlap
                    switch (type) {
                        case BORDER_TYPE.LEFT: {
                            const lastCell = border.getValue(rowIndex, columnIndex - 1);
                            if (lastCell && lastCell[BORDER_TYPE.RIGHT]) {
                                // skip draw border
                                continue;
                            }
                            break;
                        }
                        case BORDER_TYPE.RIGHT:
                            // draw
                            break;
                        case BORDER_TYPE.TOP: {
                            const lastCell = border.getValue(rowIndex - 1, columnIndex);
                            if (lastCell && lastCell[BORDER_TYPE.BOTTOM]) {
                                // skip draw border
                                continue;
                            }
                            break;
                        }
                        case BORDER_TYPE.BOTTOM:
                            // draw
                            break;
                    }

                    drawLineByBorderType(ctx, type, {
                        startX: fixLineWidthByScale(startX, scale),
                        startY: fixLineWidthByScale(startY, scale),
                        endX: fixLineWidthByScale(endX, scale),
                        endY: fixLineWidthByScale(endY, scale),
                    });
                }
            });
        });

        ctx.closePath();
        ctx.restore();
    }

    private _getOverflowExclusion(
        overflowCache: ObjectMatrix<IRange>,
        type: BORDER_TYPE,
        borderRow: number,
        borderColumn: number
    ) {
        let isDraw = false;
        if (type === BORDER_TYPE.TOP || type === BORDER_TYPE.BOTTOM) {
            return isDraw;
        }

        overflowCache?.forEach((row, rowArray) => {
            if (row !== borderRow) {
                return true;
            }
            rowArray.forEach((column, rectangle) => {
                const { startColumn, endColumn } = rectangle;
                if (type === BORDER_TYPE.LEFT && borderColumn > startColumn && borderColumn <= endColumn) {
                    isDraw = true;
                    return false;
                }

                if (type === BORDER_TYPE.RIGHT && borderColumn >= startColumn && borderColumn < endColumn) {
                    isDraw = true;
                    return false;
                }
            });
        });
        return isDraw;
    }
}

SpreadsheetExtensionRegistry.add(new Border());
