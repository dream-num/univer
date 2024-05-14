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

import type { ICommand, IDrawingParam } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IDrawingManagerService,
    IUndoRedoService,
} from '@univerjs/core';

import type { ISheetDrawing } from '@univerjs/sheets';
import { InsertDrawingMutation, ISheetDrawingService, RemoveDrawingMutation } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { IDeleteDrawingCommandParams } from './interfaces';


/**
 * The command to remove new sheet image
 */
export const RemoveSheetImageCommand: ICommand = {
    id: 'sheet.command.remove-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDeleteDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const sheetDrawingService = accessor.get(ISheetDrawingService);

        if (!params) return false;

        const { unitId, drawings } = params;

        const sheetDrawingParams: ISheetDrawing[] = [];

        const unitIds: string[] = [];

        drawings.forEach((param) => {
            const { unitId, subUnitId, drawingId } = param;

            unitIds.push(unitId);

            const oldSheetDrawing = sheetDrawingService.getDrawingByParam({ unitId, subUnitId, drawingId });
            if (oldSheetDrawing) {
                sheetDrawingParams.push(oldSheetDrawing);
            }
        });


        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(RemoveDrawingMutation.id, sheetDrawingParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: InsertDrawingMutation.id, params: sheetDrawingParams },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    { id: RemoveDrawingMutation.id, params: sheetDrawingParams },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
