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
import type { ISetWorksheetColumnCountMutationParams } from '../mutations/set-worksheet-column-count.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { SetWorksheetColumnCountMutation, SetWorksheetColumnCountUndoMutationFactory } from '../mutations/set-worksheet-column-count.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export const SetWorksheetColumnCountCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-column-count',

    handler: (accessor: IAccessor, params: ISetWorksheetColumnCountMutationParams) => {
        const { unitId, subUnitId, columnCount } = params;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const redoMutationParams: ISetWorksheetColumnCountMutationParams = {
            unitId,
            subUnitId,
            columnCount,
        };

        const undoMutationParams = SetWorksheetColumnCountUndoMutationFactory(accessor, redoMutationParams);

        const result = commandService.syncExecuteCommand(SetWorksheetColumnCountMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetColumnCountMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetColumnCountMutation.id, params: redoMutationParams }],
            });
            return true;
        }

        return false;
    },
};
