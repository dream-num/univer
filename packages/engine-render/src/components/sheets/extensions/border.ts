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
        ctx.save();

        // this would cause the dashed line ([1, 1]) style to be drawn incorrectly.(in zoom 100%)
        // but without this, lines looks thicker than before.
        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        const precisionScale = this._getScale(ctx.getScale());
        const { border } = stylesCache;
        if (!border) return;
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
                const borderConfig = border!.getValue(row, col);
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
            const visibleCol = spreadsheetSkeleton.worksheet.getColVisible(col);
            if (!visibleRow || !visibleCol) return true;
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

            drawDiagonalLineByBorderType(ctx, type, {
                startX,
                startY,
                endX,
                endY,
            });

            if (this._getOverflowExclusion(overflowCache, type, row, col)) {
                continue;
            }

            drawLineByBorderType(ctx, type, (lineWidth - 1) / 2 / precisionScale, {
                startX,
                startY,
                endX,
                endY,
            });
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
}

SpreadsheetExtensionRegistry.add(Border);
