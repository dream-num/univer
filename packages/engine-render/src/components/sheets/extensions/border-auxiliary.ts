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

import type { IRange, IScale, ISelectionCellWithCoord, ObjectMatrix } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';

import { clearLineByBorderType, getLineWith } from '../../../basics/draw';
import { getColor } from '../../../basics/tools';
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
        const { border, backgroundPositions } = stylesCache;
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
        // eslint-disable-next-line no-magic-numbers
        ctx.strokeStyle = getColor([212, 212, 212]);

        const width = columnTotalWidth;

        let height = rowTotalHeight;

        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;

        let rowStart = startRow;

        let rowEnd = endRow - 1;

        let columnDrawTopStart = 0;

        if (diffRanges && diffRanges.length > 0) {
            const diffRange = diffRanges[0];

            const { startRow: diffRangeStartRow, endRow: diffRangeEndRow } = diffRange;

            rowStart = diffRangeStartRow;

            rowEnd = diffRangeEndRow - 1;

            columnDrawTopStart = rowHeightAccumulation[rowStart - 1] || 0;

            height = rowHeightAccumulation[rowEnd] || rowHeightAccumulation[rowHeightAccumulationLength - 1];
        }

        for (let r = rowStart; r <= rowEnd; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            ctx.moveTo(0, rowEndPosition);
            ctx.lineTo(width, rowEndPosition);
        }

        for (let c = startColumn; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }
            const columnEndPosition = columnWidthAccumulation[c];
            ctx.moveTo(columnEndPosition, columnDrawTopStart);
            ctx.lineTo(columnEndPosition, height);
        }
        // console.log('xx2', scaleX, scaleY, columnTotalWidth, rowTotalHeight, rowHeightAccumulation, columnWidthAccumulation);
        ctx.stroke();
        ctx.closePath();
        // ctx.restore();
        // return;

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

            for (const key in borderCaches) {
                const { type } = borderCaches[key] as BorderCacheItem;

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

        this._clearBackground(ctx, scale, backgroundPositions, diffRanges);

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

            const startY = rowHeightAccumulation[startRow - 1] || 0;
            const endY = rowHeightAccumulation[endRow] || rowHeightAccumulation[rowHeightAccumulation.length - 1];

            const startX = columnWidthAccumulation[startColumn - 1] || 0;
            const endX =
                columnWidthAccumulation[endColumn] || columnWidthAccumulation[columnWidthAccumulation.length - 1];

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

    private _clearBackground(
        ctx: CanvasRenderingContext2D,
        scale: number,
        backgroundPositions?: ObjectMatrix<ISelectionCellWithCoord>,
        diffRanges?: IRange[]
    ) {
        backgroundPositions?.forValue((row, column, cellInfo) => {
            let { startY, endY, startX, endX } = cellInfo;
            const { isMerged, isMergedMainCell, mergeInfo } = cellInfo;
            if (isMerged) {
                return true;
            }

            if (
                !this.isRenderDiffRangesByRow(mergeInfo.startRow, diffRanges) &&
                !this.isRenderDiffRangesByRow(mergeInfo.endRow, diffRanges)
            ) {
                return true;
            }

            if (isMergedMainCell) {
                startY = mergeInfo.startY;
                endY = mergeInfo.endY;
                startX = mergeInfo.startX;
                endX = mergeInfo.endX;
            }

            ctx.clearRect(startX, startY, endX - startX, endY - startY);
        });
    }
}

// SpreadsheetExtensionRegistry.add(new BorderAuxiliary());
