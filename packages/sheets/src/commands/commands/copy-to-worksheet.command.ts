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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetConfigMutationParams } from '../mutations/set-worksheet-config.mutation';
import {
    SetWorksheetConfigMutation,
    SetWorksheetConfigUndoMutationFactory,
} from '../mutations/set-worksheet-config.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ICopySheetToCommandParams {
    unitId?: string;
    subUnitId?: string;
    copyToUnitId?: string;
    copyToSheetId?: string;
}

export const CopySheetToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-sheet-to',
    handler: async (accessor: IAccessor, params: ICopySheetToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const fromTarget = getSheetCommandTarget(univerInstanceService, { unitId: params.unitId, subUnitId: params.subUnitId });
        const toTarget = getSheetCommandTarget(univerInstanceService, { unitId: params.copyToUnitId, subUnitId: params.copyToSheetId });
        if (!fromTarget || !toTarget) return false;

        const { subUnitId, unitId, worksheet } = fromTarget;
        const { unitId: copyToUnitId, subUnitId: copyToSheetId } = toTarget;
        if (unitId === copyToUnitId && subUnitId === copyToSheetId) return false;

        const config = Tools.deepClone(worksheet.getConfig());

        const setWorksheetConfigMutationParams: ISetWorksheetConfigMutationParams = {
            unitId,
            subUnitId,
            config,
        };

        const undoMutationParams: ISetWorksheetConfigMutationParams = SetWorksheetConfigUndoMutationFactory(
            accessor,
            setWorksheetConfigMutationParams
        );

        const result = commandService.syncExecuteCommand(
            SetWorksheetConfigMutation.id,
            setWorksheetConfigMutationParams
        );

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetWorksheetConfigMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetWorksheetConfigMutation.id, params: setWorksheetConfigMutationParams }],
            });
            return true;
        }
        return false;
    },
};
