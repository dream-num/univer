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
import { numberToABC } from '@univerjs/core';

import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, MIDDLE_CELL_POS_MAGIC_NUMBER } from '../../../basics/const';
import { getColor } from '../../../basics/tools';
import type { UniverRenderingContext } from '../../../context';
import { SheetColumnHeaderExtensionRegistry } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';
import { SheetExtension } from './sheet-extension';

const UNIQUE_KEY = 'DefaultColumnHeaderLayoutExtension';

export class ColumnHeaderLayout extends SheetExtension {
    override uKey = UNIQUE_KEY;

    override Z_INDEX = 10;

    override draw(ctx: UniverRenderingContext, parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
        const { rowColumnSegment, columnHeaderHeight = 0 } = spreadsheetSkeleton;
        const { startColumn, endColumn } = rowColumnSegment;

        if (!spreadsheetSkeleton || columnHeaderHeight === 0) {
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

        // painting background
        ctx.fillStyle = getColor([248, 249, 250])!;
        ctx.fillRectByPrecision(0, 0, columnTotalWidth, columnHeaderHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = getColor([0, 0, 0])!;
        ctx.beginPath();
        ctx.setLineWidthByPrecision(1);

        ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET);

        ctx.strokeStyle = getColor([217, 217, 217])!;
        ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`;
        let preColumnPosition = 0;
        const columnWidthAccumulationLength = columnWidthAccumulation.length;
        for (let c = startColumn - 1; c <= endColumn; c++) {
            if (c < 0 || c > columnWidthAccumulationLength - 1) {
                continue;
            }

            const columnEndPosition = columnWidthAccumulation[c];
            if (preColumnPosition === columnEndPosition) {
                // Skip hidden columns
                continue;
            }

            // painting line border
            ctx.moveToByPrecision(columnEndPosition, 0);
            ctx.lineToByPrecision(columnEndPosition, columnHeaderHeight);

            // painting column header text
            const middleCellPos = preColumnPosition + (columnEndPosition - preColumnPosition) / 2;
            ctx.fillText(numberToABC(c), middleCellPos, columnHeaderHeight / 2 + MIDDLE_CELL_POS_MAGIC_NUMBER); // Magic number 1, because the vertical alignment appears to be off by 1 pixel
            preColumnPosition = columnEndPosition;
        }

        // painting line bottom border
        const columnHeaderHeightFix = columnHeaderHeight - 0.5 / scale;
        ctx.moveToByPrecision(0, columnHeaderHeightFix);
        ctx.lineToByPrecision(columnTotalWidth, columnHeaderHeightFix);
        ctx.stroke();
    }
}

SheetColumnHeaderExtensionRegistry.add(new ColumnHeaderLayout());
