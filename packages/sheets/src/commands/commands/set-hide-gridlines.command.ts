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
import { BooleanNumber, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetHideGridlinesMutationParams } from '../mutations/set-hide-gridlines.mutatiom';
import {
    SetHideGridlinesMutation,
    SetHideGridlinesUndoMutationFactory,
} from '../mutations/set-hide-gridlines.mutatiom';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetHideGridlinesCommandParams {
    hideGridlines?: BooleanNumber;
    unitId?: string;
    subUnitId?: string;
}

export const SetHideGridlinesCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-hide-gridlines',

    handler: async (accessor: IAccessor, params?: ISetHideGridlinesCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        let hideGridlines = BooleanNumber.FALSE;

        if (params) {
            hideGridlines = params.hideGridlines ?? BooleanNumber.FALSE;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(unitId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(subUnitId);
        if (!worksheet) return false;

        const setHideGridlinesMutationParams: ISetHideGridlinesMutationParams = {
            hideGridlines,
            unitId,
            subUnitId,
        };

        const undoMutationParams = SetHideGridlinesUndoMutationFactory(accessor, setHideGridlinesMutationParams);
        const result = commandService.syncExecuteCommand(SetHideGridlinesMutation.id, setHideGridlinesMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetHideGridlinesMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetHideGridlinesMutation.id, params: setHideGridlinesMutationParams }],
            });
            return true;
        }

        return false;
    },
};
