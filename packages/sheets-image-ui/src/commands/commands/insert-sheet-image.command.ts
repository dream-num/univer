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

import { InsertImageMutation, RemoveImageMutation } from '@univerjs/drawing';

import { InsertDrawingMutation, RemoveDrawingMutation } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { IInsertDrawingCommandParams } from './interfaces';


/**
 * The command to insert new defined name
 */
export const InsertSheetImageCommand: ICommand = {
    id: 'sheet.command.insert-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IInsertDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        // const { drawingParam, imageParam } = params;

        const drawings = params.drawings;

        const sheetDrawingParams = drawings.map((param) => param.sheetDrawingParam);
        const imageDrawingParams = drawings.map((param) => param.drawingParam);
        const unitIds: string[] = drawings.map((param) => param.sheetDrawingParam.unitId);

        // prepare do mutations
        const removeImageMutationParams = drawings.map((param) => {
            const { unitId, subUnitId, drawingId } = param.drawingParam;
            return { unitId, subUnitId, drawingId };
        });

        // execute do mutations and add undo mutations to undo stack if completed
        const result1 = commandService.syncExecuteCommand(InsertDrawingMutation.id, sheetDrawingParams);
        const result2 = commandService.syncExecuteCommand(InsertImageMutation.id, imageDrawingParams);

        const unitId = params.unitId;

        if (result1 && result2) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: RemoveDrawingMutation.id, params: sheetDrawingParams },
                    { id: RemoveImageMutation.id, params: removeImageMutationParams },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    { id: InsertDrawingMutation.id, params: sheetDrawingParams },
                    { id: InsertImageMutation.id, params: imageDrawingParams },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
