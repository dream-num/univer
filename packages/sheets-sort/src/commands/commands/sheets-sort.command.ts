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

// This file provides a ton of mutations to manipulate `FilterModel`.
// These models would be held on `SheetsFilterService`.

import type { IAccessor, ICellData, ICommand, IRange, Nullable, Worksheet } from '@univerjs/core';
import type { IReorderRangeCommandParams, ISheetCommandSharedParams } from '@univerjs/sheets';
import type { IOrderRule, SortType } from '../../services/interface';
import { CommandType, ICommandService, IUniverInstanceService, Rectangle, sequenceExecute } from '@univerjs/core';
import { getSheetCommandTarget, ReorderRangeCommand } from '@univerjs/sheets';
import { SheetsSortService } from '../../services/sheets-sort.service';

export interface ISortRangeCommandParams extends ISheetCommandSharedParams {
    range: IRange;
    orderRules: IOrderRule[];
    hasTitle: boolean;
}

export interface IRowComparator {
    index: number;
    value: Array<Nullable<ICellData>>;
}

export enum ORDER {
    KEEP = 1,
    EXCHANGE = -1,
    EQUAL = 0,
}

export type CellValue = number | string | null;

export type ICellValueCompareFn = (type: SortType, a: Nullable<ICellData>, b: Nullable<ICellData>) => Nullable<number>;

export const SortRangeCommand: ICommand = {
    id: 'sheet.command.sort-range',
    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params: ISortRangeCommandParams) => {
        const { range, orderRules, hasTitle, unitId, subUnitId } = params;
        const sortService = accessor.get(SheetsSortService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { worksheet } = getSheetCommandTarget(univerInstanceService, params) || {};
        if (!worksheet) {
            return false;
        }

        const mergeDataInRange = worksheet.getMergeData().filter((mergeData) => {
            return Rectangle.contains(range, mergeData);
        });
        const mergeMainRowIndexes = mergeDataInRange.map((mergeData) => {
            return mergeData.startRow;
        });

        const { startRow: rangeStartRow, endRow } = range;
        const startRow = hasTitle ? rangeStartRow + 1 : rangeStartRow;
        const toReorder: IRowComparator[] = [];

        const oldOrder: number[] = [];
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            if (worksheet.getRowFiltered(rowIndex)) {
                continue;
            }

            if (worksheet.getRowRawVisible(rowIndex) === false) {
                continue;
            }

            if (mergeDataInRange.length && !mergeMainRowIndexes.includes(rowIndex)) {
                continue;
            }

            toReorder.push({
                index: rowIndex,
                value: getRowCellData(worksheet, rowIndex, orderRules),
            });
            oldOrder.push(rowIndex);
        }
        const compareFns: ICellValueCompareFn[] = sortService.getAllCompareFns();

        toReorder.sort(reorderFnGenerator(orderRules, combineCompareFnsAsOne(compareFns)));

        const order: { [key: number]: number } = {};

        toReorder.forEach(({ index, value }, oldIndex) => {
            order[oldOrder[oldIndex]] = index;
        });

        const reorderRangeCommand = {
            id: ReorderRangeCommand.id,
            params: {
                unitId,
                subUnitId,
                range,
                order,
            } as unknown as IReorderRangeCommandParams,
        };

        const commandService = accessor.get(ICommandService);
        const res = sequenceExecute([reorderRangeCommand], commandService);
        return res.result;
    },

};

function getRowCellData(
    worksheet: Worksheet,
    rowIndex: number,
    orderRules: IOrderRule[]
): Nullable<ICellData>[] {
    const result: Nullable<ICellData>[] = [];
    orderRules.forEach(({ colIndex }) => {
        result.push(worksheet.getCellRaw(rowIndex, colIndex));
    });
    return result;
}

function combineCompareFnsAsOne(compareFns: ICellValueCompareFn[]) {
    return (type: SortType, a: Nullable<ICellData>, b: Nullable<ICellData>) => {
        for (let i = 0; i < compareFns.length; i++) {
            const res = compareFns[i](type, a, b);
            // null means can't compare in this fn.
            if (res != null) {
                return res;
            }
        }
        // All fns can't compare these two value, means equal.
        return 0;
    };
}

function reorderFnGenerator(orderRules: IOrderRule[], valueCompare: ICellValueCompareFn) {
    return function (a: IRowComparator, b: IRowComparator): number {
        let ret: Nullable<number> = null;

        for (let index = 0; index < orderRules.length; index++) {
            const aCellData = a.value[index];
            const bCellData = b.value[index];
            ret = valueCompare(orderRules[index].type, aCellData, bCellData);

            if (ret !== 0 && ret !== null && ret !== undefined) {
                return ret as number;
            }
        }

        return 0;
    };
}
