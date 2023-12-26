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
import { drawDiagonalLineByBorderType, drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import { fixLineWidthByScale } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderExtension';

const BORDER_Z_INDEX = 50;

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

        const scale = this._getScale(parentScale);

        let preStyle: BorderStyleTypes;
        let preColor: string;

        ctx.translate(FIX_ONE_PIXEL_BLUR_OFFSET / scale, FIX_ONE_PIXEL_BLUR_OFFSET / scale);

        border?.forValue((rowIndex, columnIndex, borderCaches) => {
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

            startY = fixLineWidthByScale(startY, scale);
            endY = fixLineWidthByScale(endY, scale);
            startX = fixLineWidthByScale(startX, scale);
            endX = fixLineWidthByScale(endX, scale);

            if (!this.isRenderDiffRangesByRow(mergeInfo.startRow, mergeInfo.endRow, diffRanges)) {
                return true;
            }

            // if (
            //     !this.isRenderDiffRangesByColumn(mergeInfo.startColumn - 1, diffRanges) &&
            //     !this.isRenderDiffRangesByColumn(mergeInfo.endColumn + 1, diffRanges)
            // ) {
            //     return true;
            // }

            for (const key in borderCaches) {
                const { type, style, color } = borderCaches[key] as BorderCacheItem;

                if (style !== preStyle) {
                    setLineType(ctx, style);
                    ctx.lineWidth = getLineWidth(style) / scale;
                    preStyle = style;
                }

                if (color !== preColor) {
                    ctx.strokeStyle = color || COLOR_BLACK_RGB;
                    preColor = color;
                }

                drawDiagonalLineByBorderType(ctx, type, {
                    startX,
                    startY,
                    endX,
                    endY,
                });

                if (this._getOverflowExclusion(overflowCache, type, rowIndex, columnIndex)) {
                    continue;
                }

                drawLineByBorderType(ctx, type, {
                    startX,
                    startY,
                    endX,
                    endY,
                });
            }
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

        overflowCache?.forRow((row, rowArray) => {
            if (row !== borderRow) {
                return true;
            }
            rowArray.forEach((column) => {
                const rectangle = overflowCache.getValue(row, column);
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
