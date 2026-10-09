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

import type { IMutation, Workbook } from '@univerjs/core';
import type { ITableCalculatedColumnConfig, ITableRange } from '../../types/type';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import { TableManager } from '../../models/table-manager';

export interface IMoveSheetTableMutationParams {
    unitId: string;
    tableId: string;
    subUnitId: string;
    range: ITableRange;
    calculatedColumns?: ITableCalculatedColumnConfig[];
}

export const MoveSheetTableMutation: IMutation<IMoveSheetTableMutationParams> = {
    id: 'sheet.mutation.move-table',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const { unitId, tableId, subUnitId, range, calculatedColumns } = params;
        const manager = accessor.get(TableManager);
        const table = manager.getTableById(unitId, tableId);
        const workbook = accessor.get(IUniverInstanceService).getUnit<Workbook>(unitId);
        const worksheet = workbook?.getSheetBySheetId(subUnitId);
        if (!table || !worksheet) {
            return false;
        }

        // Cell and formula mutations run first, so the new anchor contains the cut-adjusted formula.
        const columns = calculatedColumns ?? table.getTableInfo().columns.map((column, columnIndex) => {
            const row = range.startRow + (table.isShowHeader() ? 1 : 0);
            const endRow = range.endRow - (table.isShowFooter() ? 1 : 0);
            const formula = column.formula && row <= endRow
                ? worksheet.getCellRaw(row, range.startColumn + columnIndex)?.f
                : undefined;
            return {
                columnId: column.id,
                formula: formula || column.formula,
                formulaIsArray: column.formulaIsArray,
            };
        }).filter((column) => column.formula);

        for (const config of columns) {
            const column = table.getColumn(config.columnId);
            if (column) {
                column.formula = config.formula;
                column.formulaIsArray = config.formulaIsArray;
            }
        }

        manager.moveTable(unitId, tableId, subUnitId, range);
        return true;
    },
};
