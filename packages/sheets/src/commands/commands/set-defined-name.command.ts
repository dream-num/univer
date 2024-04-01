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

import type { ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import { type ISetDefinedNameMutationParam, SetDefinedNameMutation } from '@univerjs/engine-formula';

export interface ISetDefinedNameCommandParams {
    unitId: string;
    oldDefinedName: ISetDefinedNameMutationParam;
    newDefinedName: ISetDefinedNameMutationParam;
}

/**
 * The command to update defined name
 */
export const SetDefinedNameCommand: ICommand = {
    id: 'sheet.command.set-defined-name',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDefinedNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDefinedNameMutation.id, params.newDefinedName);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: SetDefinedNameMutation.id, params: params.oldDefinedName }],
                redoMutations: [{ id: SetDefinedNameMutation.id, params: params.newDefinedName }],
            });

            return true;
        }

        return false;
    },
};
