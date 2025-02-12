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
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { type ISetGridlinesColorMutationParams, SetGridlinesColorMutation } from '../mutations/set-gridlines-color.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetGridlinesColorCommandParams {
    color: string | undefined;
    unitId?: string;
    subUnitId?: string;
}

export const SetGridlinesColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-gridlines-color',
    handler: (accessor: IAccessor, params?: ISetGridlinesColorCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet } = target;
        const currentlyColor = worksheet.getConfig().gridlinesColor;
        if (currentlyColor === params?.color) return false;

        const { unitId, subUnitId } = target;
        const doParams: ISetGridlinesColorMutationParams = {
            color: params?.color,
            unitId,
            subUnitId,
        };

        const undoMutationParams: ISetGridlinesColorMutationParams = {
            color: currentlyColor,
            unitId,
            subUnitId,
        };

        const result = commandService.syncExecuteCommand(SetGridlinesColorMutation.id, doParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetGridlinesColorMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetGridlinesColorMutation.id, params: doParams }],
            });

            return true;
        }

        return false;
    },
};
