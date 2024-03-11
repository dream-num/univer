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

import { type IRange, type IScale, Range } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { SheetExtension, SpreadsheetExtensionRegistry } from '@univerjs/engine-render';

const Z_INDEX = 55;

export const DATA_VALIDATION_U_KEY = 'sheet-data-validation';

export class DataValidationExtension extends SheetExtension {
    protected override Z_INDEX = Z_INDEX;

    override uKey: string = DATA_VALIDATION_U_KEY;

    override draw(ctx: UniverRenderingContext, parentScale: IScale, skeleton: SpreadsheetSkeleton, diffBounds?: IRange[] | undefined): void {
        const { rowHeightAccumulation, columnWidthAccumulation, worksheet, dataMergeCache, rowColumnSegment } = skeleton;
        if (!worksheet) {
            return;
        }
        const subUnitId = worksheet.getSheetId();

        Range.foreach(rowColumnSegment, (row, col) => {
            const cellData = worksheet.getCell(row, col);
            if (cellData && cellData.dataValidation?.customRender) {
                const cellInfo = this.getCellIndex(row, col, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
                if (cellInfo.isMerged && !cellInfo.isMergedMainCell) {
                    return;
                }

                // current cell is hidden
                if (!worksheet.getColVisible(col) || !worksheet.getRowVisible(row)) {
                    return;
                }

                ctx.save();
                cellData.dataValidation.customRender.drawWith(ctx, {
                    cellInfo,
                    value: cellData.v,
                    style: skeleton.getsStyles().getStyleByCell(cellData),
                    rule: cellData.dataValidation.rule,
                    unitId: '',
                    subUnitId,
                    row,
                    col,
                });
                ctx.restore();
            }
        });
    }
}

SpreadsheetExtensionRegistry.add(DataValidationExtension);
