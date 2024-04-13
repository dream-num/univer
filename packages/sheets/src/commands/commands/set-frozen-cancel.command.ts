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

import type { ISetFrozenMutationParams } from '../mutations/set-frozen.mutation';
import { SetFrozenMutation, SetFrozenMutationFactory } from '../mutations/set-frozen.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export const SetFrozenCancelCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen-cancel',
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            startRow: -1,
            startColumn: -1,
            ySplit: 0,
            xSplit: 0,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return false;
    },
};
