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

import type { IOrderRule } from '@univerjs/sheets-sort';
import { type IRange, RANGE_TYPE } from '@univerjs/core';

import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { FWorksheet } from '@univerjs/sheets/facade';

export interface IFWorksheetSort {
    /**
     * Sort the worksheet by the specified column.
     * @param {number} colIndex The column index to sort by. which starts from 1.
     * @param {boolean} [asc=true] The sort order. `true` for ascending, `false` for descending.
     * @returns The worksheet itself for chaining.
     * @example
     * ```typescript
     * const activeSpreadsheet = univerAPI.getActiveWorkbook();
     * const activeSheet = activeSpreadsheet.getActiveSheet();
     * activeSheet.sort(1); // Sorts the worksheet by the first column in ascending order.
     * activeSheet.sort(1, false); // Sorts the worksheet by the first column in descending order.
     * ```
     */
    sort(colIndex: number, asc?: boolean): FWorksheet;
}

export class FWorksheetSort extends FWorksheet implements IFWorksheetSort {
    override sort(colIndex: number, asc = true): FWorksheet {
        const orderRules: IOrderRule[] = [{
            // real column index should be colIndex - 1.
            colIndex,
            type: asc ? SortType.ASC : SortType.DESC,
        }];

        const range: IRange = {
            startRow: 0,
            startColumn: 0,
            endRow: this._worksheet.getRowCount() - 1,
            endColumn: this._worksheet.getColumnCount() - 1,
            rangeType: RANGE_TYPE.ALL,
        };
        this._commandService.syncExecuteCommand(SortRangeCommand.id, {
            orderRules,
            range,
            hasTitle: false,
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });
        return this;
    }
}

FWorksheet.extend(FWorksheetSort);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FWorksheet extends IFWorksheetSort {}
}
