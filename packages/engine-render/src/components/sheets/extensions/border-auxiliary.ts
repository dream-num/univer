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

import type { IRange, IScale } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';

import { clearLineByBorderType, getLineWith } from '../../../basics/draw';
import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SpreadsheetExtensionRegistry } from '../../extension';
import type { BorderCacheItem } from '../interfaces';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultBorderAuxiliaryExtension';

const BORDER_AUXILIARY_Z_INDEX = 10;
export class BorderAuxiliary extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = BORDER_AUXILIARY_Z_INDEX;

    override draw(
        ctx: CanvasRenderingContext2D,
        parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges?: IRange[]
    ) {
        const { rowColumnSegment, dataMergeCache, overflowCache, stylesCache, showGridlines } = spreadsheetSkeleton;
        const { border } = stylesCache;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
        if (!spreadsheetSkeleton || showGridlines === BooleanNumber.FALSE) {
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
        ctx.beginPath();
        ctx.lineWidth = getLineWith(1) / scale;
        ctx.strokeStyle = getColor([212, 212, 212]);

        const width = fixLineWidthByScale(columnTotalWidth, scale);

        let height = fixLineWidthByScale(rowTotalHeight, scale);

        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;

        let rowStart = startRow - 1;

        let rowEnd = endRow;

        let columnDrawTopStart = 0;

        if (diffRanges && diffRanges.length > 0) {
            const diffRange = diffRanges[0];

            const { startRow: diffRangeStartRow, endRow: diffRangeEndRow } = diffRange;

            rowStart = diffRangeStartRow;

            rowEnd = diffRangeEndRow;

            columnDrawTopStart = fixLineWidthByScale(rowHeightAccumulation[rowStart], scale);

            height = fixLineWidthByScale(rowHeightAccumulation[rowEnd], scale);
        }

        for (let r = rowStart; r <= rowEnd; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = fixLineWidthByScale(rowHeightAccumulation[r], scale);
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(width, rowEndPosition);
        }

        for (let c = startColumn; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = fixLineWidthByScale(columnWidthAccumulation[c], scale);
            ctx.moveTo(columnEndPosition, columnDrawTopStart);
            ctx.lineTo(columnEndPosition, height);
        }
        // console.log('xx2', scaleX, scaleY, columnTotalWidth, rowTotalHeight, rowHeightAccumulation, columnWidthAccumulation);
        ctx.stroke();
        ctx.closePath();

        const { scaleX = 1, scaleY = 1 } = parentScale;
        // Clearing the dashed line issue caused by overlaid auxiliary lines and strokes
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

            if (!(mergeInfo.startRow >= rowStart && mergeInfo.endRow <= rowEnd)) {
                return true;
            }

            startY = fixLineWidthByScale(startY, scaleY);
            endY = fixLineWidthByScale(endY, scaleY);
            startX = fixLineWidthByScale(startX, scaleX);
            endX = fixLineWidthByScale(endX, scaleX);

            for (const key in borderCaches) {
                const { type, style, color } = borderCaches[key] as BorderCacheItem;

                // if (color.indexOf('255,255,255') === -1 || color.toLocaleLowerCase() !== '#ffffff') {
                //     continue;
                // }

                clearLineByBorderType(ctx, type, { startX, startY, endX, endY }, scaleX, scaleY);
            }
        });
        ctx.closePath();
        // merge cell
        this._clearRectangle(ctx, scale, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache, diffRanges);

        // overflow cell
        this._clearRectangle(
            ctx,
            scale,
            rowHeightAccumulation,
            columnWidthAccumulation,
            overflowCache.toNativeArray(),
            diffRanges
        );
        ctx.restore();
    }

    /**
     * Clear the guide lines within a range in the table, to make room for merged cells and overflow.
     */
    private _clearRectangle(
        ctx: CanvasRenderingContext2D,
        scale: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache?: IRange[],
        diffRanges?: IRange[]
    ) {
        if (dataMergeCache == null) {
            return;
        }
        for (const dataCache of dataMergeCache) {
            const { startRow, endRow, startColumn, endColumn } = dataCache;

            const startY = fixLineWidthByScale(rowHeightAccumulation[startRow - 1] || 0, scale);
            const endY = fixLineWidthByScale(
                rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1],
                scale
            );

            const startX = fixLineWidthByScale(columnWidthAccumulation[startColumn - 1] || 0, scale);
            const endX = fixLineWidthByScale(
                columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1],
                scale
            );

            if (
                !this.isRenderDiffRangesByRow(startRow, diffRanges) &&
                !this.isRenderDiffRangesByRow(endRow, diffRanges)
            ) {
                return true;
            }

            ctx.clearRect(startX, startY, endX - startX, endY - startY);

            // After ClearRect, the lines will become thinner, and the lines will be repaired below.
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(startX, endY);
            ctx.lineTo(startX, startY);
            ctx.stroke();
            ctx.closePath();
        }
    }
}

SpreadsheetExtensionRegistry.add(new BorderAuxiliary());
