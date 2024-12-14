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
import { SortRangeCommand, SortType } from '@univerjs/sheets-sort';
import { FRange } from '@univerjs/sheets/facade';

export type SortColumnSpec = { column: number; ascending: boolean } | number;

export interface IFRangeSort {
    sort(column: SortColumnSpec | SortColumnSpec[]): Promise<FRange>;
}

export class FRangeSort extends FRange implements IFRangeSort {
    override async sort(column: SortColumnSpec | SortColumnSpec[]): Promise<FRange> {
        const columns = Array.isArray(column) ? column : [column];
        const orderRules: IOrderRule[] = columns.map((c) => {
            if (typeof c === 'number') {
                return { colIndex: c, type: SortType.ASC };
            }
            return {
                colIndex: c.column,
                type: c.ascending ? SortType.ASC : SortType.DESC,
            };
        });
        await this._commandService.executeCommand(SortRangeCommand.id, {
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
