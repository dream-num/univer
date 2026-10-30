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

import type { ICommand, IMutationInfo } from '@univerjs/core';
import type { ISetSheetTableParams } from '../mutations/set-table-filter.mutation';
import { CommandType, generateRandomId, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { cloneTableRecordFilter } from '../../models/filter-util/record-filter';
import { TableManager } from '../../models/table-manager';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { SetSheetTableFilterMutation } from '../mutations/set-table-filter.mutation';

export const SetSheetTableFilterCommand: ICommand<ISetSheetTableParams> = {
    id: 'sheet.command.set-table-filter',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const tableManager = accessor.get(TableManager);
        const tableId = params.tableId || generateRandomId();
        const tableFilters = tableManager.getTable(params.unitId, tableId)?.getTableFilters();
        const previousFilter = tableFilters?.getColumnFilter(params.column);
        const previousFilterOutRows = [...(tableFilters?.getFilterOutRows() ?? [])];
        const tableFilter = params.tableFilter?.filterType === TableColumnFilterTypeEnum.record
            ? cloneTableRecordFilter(params.tableFilter)
            : params.tableFilter;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        redos.push({ id: SetSheetTableFilterMutation.id, params: { ...params, tableId, tableFilter } });
        undos.push({
            id: SetSheetTableFilterMutation.id,
            params: { ...params, tableId, tableFilter: previousFilter, filterOutRows: previousFilterOutRows },
        });

        const res = sequenceExecute(redos, commandService);

        if (res.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos,
                redoMutations: redos,
            });

            return true;
        }

        return false;
    },
};
