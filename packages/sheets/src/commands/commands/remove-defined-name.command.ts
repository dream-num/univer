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
    sequenceExecute,
} from '@univerjs/core';
import { type ISetDefinedNameMutationParam, RemoveDefinedNameMutation, SetDefinedNameMutation } from '@univerjs/engine-formula';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';

/**
 * The command to remove new defined name
 */
export const RemoveDefinedNameCommand: ICommand = {
    id: 'sheet.command.remove-defined-name',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDefinedNameMutationParam) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (!params) return false;

        const removeSheetMutationParams: ISetDefinedNameMutationParam = {
            ...params,
        };

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: RemoveDefinedNameCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: RemoveDefinedNameMutation.id, params: removeSheetMutationParams },
            ...interceptorCommands.redos,
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: SetDefinedNameMutation.id, params: removeSheetMutationParams },
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
