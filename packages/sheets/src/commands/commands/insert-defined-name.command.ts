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

import type { IAccessor, ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import { type ISetDefinedNameMutationParam, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';

/**
 * The command to insert new defined name
 */
export const InsertDefinedNameCommand: ICommand = {
    id: 'sheet.command.insert-defined-name',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDefinedNameMutationParam) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        // prepare do mutations
        const insertSheetMutationParams: ISetDefinedNameMutationParam = {
            ...params,
        };

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDefinedNameMutation.id, insertSheetMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: RemoveDefinedNameMutation.id, params: insertSheetMutationParams }],
                redoMutations: [{ id: SetDefinedNameMutation.id, params: insertSheetMutationParams }],
            });

            return true;
        }

        return false;
    },
};
