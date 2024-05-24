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

import type { IRange, IScale, ObjectMatrix } from '@univerjs/core';
import { BorderStyleTypes } from '@univerjs/core';

import { BORDER_TYPE, COLOR_BLACK_RGB, FIX_ONE_PIXEL_BLUR_OFFSET } from '../../../basics/const';
import { drawDiagonalLineByBorderType, drawLineByBorderType, getLineWidth, setLineType } from '../../../basics/draw';
import type { UniverRenderingContext } from '../../../context';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderExtension';

const BORDER_Z_INDEX = 50;

export class Border extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = BORDER_Z_INDEX;

    // eslint-disable-next-line max-lines-per-function
    override draw(
        ctx: UniverRenderingContext,
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

        let preStyle: BorderStyleTypes;
        let preColor: string;

        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        const precisionScale = this._getScale(ctx.getScale());

        // eslint-disable-next-line max-lines-per-function
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

            const { startY: cellStartY, endY: cellEndY, startX: cellStartX, endX: cellEndX } = cellInfo;
            const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;

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

                if (style === BorderStyleTypes.NONE) {
                    continue;
                }

                let startY = cellStartY;
                let endY = cellEndY;
                let startX = cellStartX;
                let endX = cellEndX;

                if (type !== BORDER_TYPE.TOP && type !== BORDER_TYPE.BOTTOM && type !== BORDER_TYPE.LEFT && type !== BORDER_TYPE.RIGHT) {
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

                if (style !== preStyle) {
                    setLineType(ctx, style);
                    ctx.setLineWidthByPrecision(lineWidth);
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

                drawLineByBorderType(ctx, type, (lineWidth - 1) / 2 / precisionScale, {
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

SpreadsheetExtensionRegistry.add(Border);
