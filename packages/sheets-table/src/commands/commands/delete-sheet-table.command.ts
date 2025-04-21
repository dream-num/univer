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
import type { IDeleteSheetTableParams } from '../mutations/delete-sheet-table.mutation';
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';

import { TableManager } from '../../model/table-manager';
import { AddSheetTableMutation } from '../mutations/add-sheet-table.mutation';
import { DeleteSheetTableMutation } from '../mutations/delete-sheet-table.mutation';

export const DeleteSheetTableCommand: ICommand<IDeleteSheetTableParams> = {
    id: 'sheet.command.delete-table',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);
        const sheetTableManager = accessor.get(TableManager);

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const tableInstance = sheetTableManager.getTable(params.unitId, params.tableId);
        const tableConfig = tableInstance?.toJSON();

        if (!tableConfig) {
            throw new Error('[TableManager]: Table not found');
        }

        redos.push({ id: DeleteSheetTableMutation.id, params: { ...params } });
        undos.push({
            id: AddSheetTableMutation.id,
            params: {
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                tableId: params.tableId,
                name: tableConfig.name,
                range: tableConfig.range,
                options: tableConfig.options,
            },
        });

        const res = sequenceExecute(redos, commandService);

        if (res) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
        }

        return true;
    },
};
