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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetTabColorMutationParams } from '../mutations/set-tab-color.mutation';
import { SetTabColorMutation, SetTabColorUndoMutationFactory } from '../mutations/set-tab-color.mutation';

export interface ISetTabColorCommandParams {
    value: string;
}

export const SetTabColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-tab-color',

    handler: async (accessor: IAccessor, params: ISetTabColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const unitId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const subUnitId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return false;

        const setTabColorMutationParams: ISetTabColorMutationParams = {
            color: params.value,
            unitId,
            subUnitId,
        };

        const undoMutationParams = SetTabColorUndoMutationFactory(accessor, setTabColorMutationParams);
        const result = commandService.syncExecuteCommand(SetTabColorMutation.id, setTabColorMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetTabColorMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetTabColorMutation.id, params: setTabColorMutationParams }],
            });
            return true;
        }

        return false;
    },
};
