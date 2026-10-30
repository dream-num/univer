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

import type { ICommand } from '@univerjs/core';
import type { ITableFilterJSON } from '../../types/type';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { TableManager } from '../../models/table-manager';
import { SetSheetTableMutation } from '../mutations/set-sheet-table.mutation';

export interface ISetSheetTableSortStateParams {
    unitId: string;
    tableId: string;
    sortInfo: ITableFilterJSON['tableSortInfo'];
}

export const SetSheetTableSortStateCommand: ICommand<ISetSheetTableSortStateParams> = {
    id: 'sheet.command.set-table-sort-state',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }

        const table = accessor.get(TableManager).getTable(params.unitId, params.tableId);
        if (!table) {
            return false;
        }

        const previousSortInfo = table.getTableFilters().toJSON().tableSortInfo;
        const commandService = accessor.get(ICommandService);
        const mutationParams = {
            unitId: params.unitId,
            subUnitId: table.getSubunitId(),
            tableId: params.tableId,
            config: { sortInfo: params.sortInfo },
        };
        const success = commandService.syncExecuteCommand(SetSheetTableMutation.id, mutationParams);
        if (!success) {
            return false;
        }

        accessor.get(IUndoRedoService).pushUndoRedo({
            unitID: params.unitId,
            undoMutations: [{
                id: SetSheetTableMutation.id,
                params: { ...mutationParams, config: { sortInfo: previousSortInfo } },
            }],
            redoMutations: [{ id: SetSheetTableMutation.id, params: mutationParams }],
        });
        return true;
    },
};
