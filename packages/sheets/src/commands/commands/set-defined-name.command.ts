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
import type { ISetDefinedNameMutationParam } from '@univerjs/engine-formula';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { RemoveDefinedNameMutation, SetDefinedNameMutation, SetDefinedNameMutationFactory } from '@univerjs/engine-formula';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';

/**
 * The command to update defined name
 *
 * 1. The old defined name can be obtained through IDefinedNamesService, and does not need to be passed in from the outside, making the command input more concise

   2. Unlike InsertDefinedNameCommand, the old defined name needs to be deleted here at the same time. Because the command interception in UpdateDefinedNameController will add SetDefinedNameMutation or RemoveDefinedNameMutation, it results in that in DefinedNameController, only mutations can be listened to to update Function Description (commands cannot be listened to), so it is necessary to ensure that each mutation triggered by the command has completed all work.
 */
export const SetDefinedNameCommand: ICommand = {
    id: 'sheet.command.set-defined-name',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: ISetDefinedNameMutationParam) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (!params) return false;

        const newDefinedNameMutationParams: ISetDefinedNameMutationParam = {
            ...params,
        };
        const oldDefinedNameMutationParams: ISetDefinedNameMutationParam = SetDefinedNameMutationFactory(accessor, params);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: SetDefinedNameCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: RemoveDefinedNameMutation.id, params: oldDefinedNameMutationParams },
            { id: SetDefinedNameMutation.id, params: newDefinedNameMutationParams },
            ...interceptorCommands.redos,
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: RemoveDefinedNameMutation.id, params: newDefinedNameMutationParams },
            { id: SetDefinedNameMutation.id, params: oldDefinedNameMutationParams },
            ...interceptorCommands.undos,
        ];

        const result = sequenceExecute(redos, commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos.filter(Boolean),
                redoMutations: redos.filter(Boolean),
            });

            return true;
        }

        return false;
    },
};
