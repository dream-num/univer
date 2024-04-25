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
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';
import type { ISheetDrawingServiceUpdateParam } from '../../services/sheet-drawing.service';
import { SetDrawingMutation } from '../mutations/set-drawing.mutation';

export interface ISetDrawingCommandParams {
    unitId: string;
    oldDrawing: ISheetDrawingServiceUpdateParam;
    newDrawing: ISheetDrawingServiceUpdateParam;
}

/**
 * The command to update defined name
 */
export const SetDrawingCommand: ICommand = {
    id: 'sheet.command.set-defined-name',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDrawingMutation.id, params.newDrawing);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: SetDrawingMutation.id, params: params.oldDrawing }],
                redoMutations: [{ id: SetDrawingMutation.id, params: params.newDrawing }],
            });

            return true;
        }

        return false;
    },
};
