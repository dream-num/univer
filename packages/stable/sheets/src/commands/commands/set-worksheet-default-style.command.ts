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

import type { ISetWorksheetDefaultStyleMutationParams } from '../mutations/set-worksheet-default-style.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import { SetWorksheetDefaultStyleMutation, SetWorksheetDefaultStyleMutationFactory } from '../mutations/set-worksheet-default-style.mutation';

export const SetWorksheetDefaultStyleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-default-style',
    handler: (accessor: IAccessor, params: ISetWorksheetDefaultStyleMutationParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { unitId } = params;

        const undoMutationParams = SetWorksheetDefaultStyleMutationFactory(accessor, params);

        const result = commandService.syncExecuteCommand(SetWorksheetDefaultStyleMutation.id, params);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetDefaultStyleMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetDefaultStyleMutation.id, params }],
            });

            return true;
        }

        return false;
    },
};
