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
import type { ISetFrozenMutationParams } from '../mutations/set-frozen.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { SetFrozenMutation, SetFrozenMutationFactory } from '../mutations/set-frozen.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetFrozenCommandParams {
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
    unitId?: string;
    subUnitId?: string;
}

export const SetFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen',
    handler: (accessor: IAccessor, params: ISetFrozenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
        if (!target) return false;

        const { unitId, subUnitId, worksheet } = target;
        const { startColumn, startRow, xSplit, ySplit } = params;

        if (
            startRow >= worksheet.getRowCount() ||
            startColumn >= worksheet.getColumnCount() ||
            xSplit >= worksheet.getColumnCount() ||
            ySplit >= worksheet.getRowCount()
        ) {
            return false;
        }
        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            ...params,
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

export interface ICancelFrozenCommandParams {
    unitId?: string;
    subUnitId?: string;
}

export const CancelFrozenCommand: ICommand<ICancelFrozenCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.cancel-frozen',
    handler: (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const target = getSheetCommandTarget(univerInstanceService, { unitId: params?.unitId, subUnitId: params?.subUnitId });
        if (!target) return false;

        const { unitId, subUnitId } = target;

        const redoMutationParams: ISetFrozenMutationParams = {
            unitId,
            subUnitId,
            startRow: -1,
            startColumn: -1,
            xSplit: 0,
            ySplit: 0,
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
        return true;
    },
};
