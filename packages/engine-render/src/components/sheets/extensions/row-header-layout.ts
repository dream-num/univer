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

import type { IScale } from '@univerjs/core';

import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { getLineWith } from '../../../basics/draw';
import { fixLineWidthByScale, getColor } from '../../../basics/tools';
import { SheetRowHeaderExtensionRegistry } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultRowHeaderLayoutExtension';

export class RowHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override zIndex = 10;

    override draw(ctx: CanvasRenderingContext2D, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, rowHeaderWidth = 0, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startRow, endRow, startColumn, endColumn } = rowColumnSegment;
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

        const scale = this._getScale(parentScale);
        ctx.fillStyle = getColor([248, 249, 250])!;
        ctx.fillRect(0, 0, rowHeaderWidth, rowTotalHeight);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColor([0, 0, 0])!;
        ctx.beginPath();
        ctx.lineWidth = getLineWith(1) / scale;

        ctx.translate(FIX_ONE_PIXEL_BLUR_OFFSET / scale, FIX_ONE_PIXEL_BLUR_OFFSET / scale);

        ctx.strokeStyle = getColor([217, 217, 217])!;
        ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`;
        let preRowPosition = 0;
        const rowHeightAccumulationLength = rowHeightAccumulation.length;
        for (let r = startRow - 1; r <= endRow; r++) {
            if (r < 0 || r > rowHeightAccumulationLength - 1) {
                continue;
            }
            const rowEndPosition = rowHeightAccumulation[r];
            if (preRowPosition === rowEndPosition) {
                // Skip hidden rows
                continue;
            }
            ctx.moveTo(0, fixLineWidthByScale(rowEndPosition, scale));
            ctx.lineTo(rowHeaderWidth, fixLineWidthByScale(rowEndPosition, scale));

            const middleCellPos = preRowPosition + (rowEndPosition - preRowPosition) / 2;
            ctx.fillText(`${r + 1}`, rowHeaderWidth / 2, middleCellPos + MIDDLE_CELL_POS_MAGIC_NUMBER); // Magic number 1, because the vertical alignment appears to be off by 1 pixel.
            preRowPosition = rowEndPosition;
        }
        // console.log('xx2', rowColumnIndexRange, bounds, this._rowTotalHeight, this._rowHeightAccumulation);

        // painting line bottom border
        const rowHeaderWidthFix = rowHeaderWidth - 1 / scale;

        ctx.moveTo(fixLineWidthByScale(rowHeaderWidthFix, scale), 0);
        ctx.lineTo(fixLineWidthByScale(rowHeaderWidthFix, scale), rowTotalHeight);
        ctx.stroke();
    }
}

SheetRowHeaderExtensionRegistry.add(new RowHeaderLayout());
