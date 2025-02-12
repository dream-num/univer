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
import { BooleanNumber, CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';

import type { ISetWorksheetRightToLeftMutationParams } from '../mutations/set-worksheet-right-to-left.mutation';
import {
    SetWorksheetRightToLeftMutation,
    SetWorksheetRightToLeftUndoMutationFactory,
} from '../mutations/set-worksheet-right-to-left.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetWorksheetRightToLeftCommandParams {
    rightToLeft?: BooleanNumber;
    unitId?: string;
    subUnitId?: string;
}

export const SetWorksheetRightToLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-right-to-left',

    handler: async (accessor: IAccessor, params?: ISetWorksheetRightToLeftCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        let rightToLeft = BooleanNumber.FALSE;

        if (params) {
            rightToLeft = params.rightToLeft ?? BooleanNumber.FALSE;
        }

        const setWorksheetRightToLeftMutationParams: ISetWorksheetRightToLeftMutationParams = {
            rightToLeft,
            unitId,
            subUnitId,
        };

        const undoMutationParams = SetWorksheetRightToLeftUndoMutationFactory(
            accessor,
            setWorksheetRightToLeftMutationParams
        );
        const result = commandService.syncExecuteCommand(
            SetWorksheetRightToLeftMutation.id,
            setWorksheetRightToLeftMutationParams
        );

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetRightToLeftMutation.id, params: undoMutationParams }],
                redoMutations: [
                    { id: SetWorksheetRightToLeftMutation.id, params: setWorksheetRightToLeftMutationParams },
                ],
            });
            return true;
        }

        return false;
    },
};
