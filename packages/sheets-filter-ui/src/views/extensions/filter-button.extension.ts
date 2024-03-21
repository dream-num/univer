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

import type { IRange, IScale, Nullable } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { DEFAULT_FONTFACE_PLANE, RollingAverage, SheetExtension } from '@univerjs/engine-render';
import type { FilterModel } from '@univerjs/sheets-filter';

export class FilterButtonExtension extends SheetExtension {
    override uKey: string = 'sheets-filter-button-extension';

    override get zIndex(): number {
        return 60;
    }

    constructor(private readonly _getFilterModel: () => Nullable<FilterModel>) {
        super();
    }

    override draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: SpreadsheetSkeleton, diffBounds?: IRange[] | undefined): void {
        const filterModel = this._getFilterModel();
        if (!filterModel) {
            return;
        }

        const { rowColumnSegment, rowHeightAccumulation, columnWidthAccumulation } = skeleton;
        const { startRow, endColumn, endRow, startColumn } = rowColumnSegment;
        const range = filterModel.getRange();
        const { startRow: headerStartRow, startColumn: headerStartColumn, endColumn: headerEndColumn } = range;

        // out of filter header's range, not necessarily to draw
        if (startRow > headerStartRow || endRow < headerStartRow) {
            return;
        }

        ctx.save();
        ctx.font = `16px ${DEFAULT_FONTFACE_PLANE}`;

        // TODO: should consider if the row is in the hidden rows
        const preRowPosition = rowHeightAccumulation[headerStartRow];
        let preColumnPosition = 0;
        for (let i = Math.max(startColumn, headerStartColumn); i <= Math.min(headerEndColumn, endColumn); i++) {
            const columnEndPosition = columnWidthAccumulation[i];
            const middleCellPosX = preColumnPosition + (columnEndPosition - preColumnPosition) / 2;
            const middleCellPosY = preRowPosition - 20 / 2;
            ctx.fillText('🐹', middleCellPosX + 20, middleCellPosY + 1);
            preColumnPosition = columnEndPosition;
        }

        ctx.restore();
    }
}
