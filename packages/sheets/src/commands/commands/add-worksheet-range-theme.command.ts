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

import type { IWorksheetRangeThemeStyleMutationParams } from '../../basics/interfaces/mutation-interface';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import { SetWorksheetRangeThemeStyleMutation, SetWorksheetRangeThemeStyleMutationFactory } from '../mutations/add-worksheet-range-theme.mutation';
import { DeleteWorksheetRangeThemeStyleMutation } from '../mutations/delete-worksheet-range-theme.mutation';

export const SetWorksheetRangeThemeStyleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-range-theme-style',
    handler: (accessor: IAccessor, params: IWorksheetRangeThemeStyleMutationParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { unitId } = params;

        const undoMutationParams = SetWorksheetRangeThemeStyleMutationFactory(accessor, params);

        const result = commandService.syncExecuteCommand(SetWorksheetRangeThemeStyleMutation.id, params);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: DeleteWorksheetRangeThemeStyleMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetRangeThemeStyleMutation.id, params }],
            });

            return true;
        }

        return false;
    },
};
