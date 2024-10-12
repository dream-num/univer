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

import type { IAccessor, ICommand } from '@univerjs/core';
import type { ISetColCustomMutationParams } from '../mutations/set-col-custom.mutation';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { SetColCustomMutation, SetColCustomMutationFactory } from '../mutations/set-col-custom.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export const SetColCustomCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-custom',
    handler: (accessor: IAccessor, params: ISetColCustomMutationParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;

        const redoMutationParams: ISetColCustomMutationParams = {
            subUnitId,
            unitId,
            custom: params.custom,
        };

        const undoMutationParams = SetColCustomMutationFactory(redoMutationParams, worksheet);

        const result = commandService.syncExecuteCommand(SetColCustomMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetColCustomMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetColCustomMutation.id, params: redoMutationParams }],
            });

            return true;
        }

        return false;
    },
};
