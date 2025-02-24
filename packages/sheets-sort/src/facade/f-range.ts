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

import type { IOrderRule } from '@univerjs/sheets-sort';
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { FRange } from '@univerjs/sheets/facade';

export type SortColumnSpec = { column: number; ascending: boolean } | number;

/**
 * @ignore
 */
export interface IFRangeSort {
    /**
     * Sorts the cells in the given range, by column(s) and order specified.
     * @param {SortColumnSpec | SortColumnSpec[]} column The column index with order or an array of column indexes with order. The range first column index is 0.
     * @returns {FRange} The range itself for chaining.
     * @example
     * ```typescript
     * const fWorkbook = univerAPI.getActiveWorkbook();
     * const fWorksheet = fWorkbook.getActiveSheet();
     * const fRange = fWorksheet.getRange('D1:G10');
     *
     * // Sorts the range by the first column in ascending order.
     * fRange.sort(0);
     *
     * // Sorts the range by the first column in descending order.
     * fRange.sort({ column: 0, ascending: false });
     *
     * // Sorts the range by the first column in descending order and the second column in ascending order.
     * fRange.sort([{ column: 0, ascending: false }, 1]);
     * ```
     */
    sort(column: SortColumnSpec | SortColumnSpec[]): FRange;
}

export class FRangeSort extends FRange implements IFRangeSort {
    override sort(column: SortColumnSpec | SortColumnSpec[]): FRange {
        const columnBase = this._range.startColumn;
        const columns = Array.isArray(column) ? column : [column];

        const orderRules: IOrderRule[] = columns.map((c) => {
            if (typeof c === 'number') {
                return { colIndex: c + columnBase, type: SortType.ASC };
            }
            return {
                colIndex: c.column + columnBase,
                type: c.ascending ? SortType.ASC : SortType.DESC,
            };
        });
        this._commandService.syncExecuteCommand(SortRangeCommand.id, {
            orderRules,
            range: this._range,
            hasTitle: false,
            unitId: this._workbook.getUnitId(),
            subUnitId: this._worksheet.getSheetId(),
        });
        return this;
    }
}

FRange.extend(FRangeSort);
declare module '@univerjs/sheets/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FRange extends IFRangeSort {}
}
