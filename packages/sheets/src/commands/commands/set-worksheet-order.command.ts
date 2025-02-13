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
import type { ISetWorksheetOrderMutationParams } from '../mutations/set-worksheet-order.mutation';

import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import {
    SetWorksheetOrderMutation,
    SetWorksheetOrderUndoMutationFactory,
} from '../mutations/set-worksheet-order.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetWorksheetOrderCommandParams {
    order: number;
    unitId?: string;
    subUnitId?: string;
}

export const SetWorksheetOrderCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-order',

    handler: (accessor: IAccessor, params: ISetWorksheetOrderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { workbook, unitId, subUnitId } = target;
        const fromOrder = workbook.getConfig().sheetOrder.indexOf(subUnitId);
        const setWorksheetOrderMutationParams: ISetWorksheetOrderMutationParams = {
            fromOrder,
            toOrder: params.order,
            unitId,
            subUnitId,
        };

        const undoMutationParams = SetWorksheetOrderUndoMutationFactory(accessor, setWorksheetOrderMutationParams);
        const result = commandService.syncExecuteCommand(SetWorksheetOrderMutation.id, setWorksheetOrderMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetOrderMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetOrderMutation.id, params: setWorksheetOrderMutationParams }],
            });
            return true;
        }

        return false;
    },
};
