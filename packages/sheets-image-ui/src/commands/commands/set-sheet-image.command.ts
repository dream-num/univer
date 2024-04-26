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

import { SetDrawingMutation } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { SetImageMutation } from '@univerjs/image';
import type { IInsertDrawingCommandParam } from './interfaces';


export interface ISetDrawingCommandParams {
    unitId: string;
    oldDrawing: IInsertDrawingCommandParam;
    newDrawing: IInsertDrawingCommandParam;
}

/**
 * The command to update defined name
 */
export const SetSheetImageCommand: ICommand = {
    id: 'sheet.command.set-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        const { unitId, oldDrawing, newDrawing } = params;


        // execute do mutations and add undo mutations to undo stack if completed
        let result = commandService.syncExecuteCommand(SetDrawingMutation.id, newDrawing.drawingParam);
        result = commandService.syncExecuteCommand(SetImageMutation.id, newDrawing.imageParam);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: SetDrawingMutation.id, params: oldDrawing.drawingParam }, { id: SetImageMutation.id, params: oldDrawing.imageParam }],
                redoMutations: [{ id: SetDrawingMutation.id, params: newDrawing.drawingParam }, { id: SetDrawingMutation.id, params: newDrawing.imageParam }],
            });

            return true;
        }

        return false;
    },
};
