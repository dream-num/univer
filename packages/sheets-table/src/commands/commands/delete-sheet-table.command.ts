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
import { CommandType, ICommandService, ILogService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import { TableManager } from '../../models/table-manager';
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
        const logService = accessor.get(ILogService);

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        const tableInstance = sheetTableManager.getTable(params.unitId, params.tableId);
        const tableConfig = tableInstance?.toJSON();

        if (!tableConfig) {
            logService.error('[TableManager]: Table not found');
            return false;
        }

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const interceptorCommands = sheetInterceptorService.onCommandExecute({
            id: DeleteSheetTableCommand.id,
            params: {
                ...params,
                tableName: tableConfig.name,
            },
        });

        redos.push(...(interceptorCommands.preRedos ?? []));
        redos.push({ id: DeleteSheetTableMutation.id, params: { ...params } });
        redos.push(...interceptorCommands.redos);
        undos.push(...(interceptorCommands.preUndos ?? []));
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
        undos.push(...interceptorCommands.undos);

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
