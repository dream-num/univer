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

import { InsertDrawingMutation, RemoveDrawingMutation } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { InsertImageMutation, RemoveImageMutation } from '@univerjs/image';
import type { IInsertDrawingCommandParam } from './interfaces';


/**
 * The command to remove new sheet image
 */
export const RemoveSheetImageCommand: ICommand = {
    id: 'sheet.command.remove-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IInsertDrawingCommandParam) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        const { drawingParam, imageParam } = params;

        // prepare do mutations

        const { unitId, subUnitId, imageId } = imageParam;

        const removeImageMutationParams = {
            unitId, subUnitId, imageId,
        };

        // execute do mutations and add undo mutations to undo stack if completed
        let result = commandService.syncExecuteCommand(RemoveDrawingMutation.id, drawingParam);
        result = commandService.syncExecuteCommand(RemoveImageMutation.id, removeImageMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [{ id: InsertDrawingMutation.id, params: drawingParam }, { id: InsertImageMutation.id, params: imageParam }],
                redoMutations: [{ id: RemoveDrawingMutation.id, params: drawingParam }, { id: RemoveImageMutation.id, params: removeImageMutationParams }],
            });

            return true;
        }

        return false;
    },
};
