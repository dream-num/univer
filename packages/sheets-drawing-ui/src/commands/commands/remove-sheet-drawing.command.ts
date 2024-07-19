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

import type { IAccessor, ICommand } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { IDeleteDrawingCommandParams } from './interfaces';

/**
 * The command to remove new sheet image
 */
export const RemoveSheetDrawingCommand: ICommand = {
    id: 'sheet.command.remove-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDeleteDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const sheetDrawingService = accessor.get(ISheetDrawingService);

        if (!params) return false;

        const { drawings } = params;

        const unitIds: string[] = [];

        drawings.forEach((param) => {
            const { unitId } = param;
            unitIds.push(unitId);
        });

        const jsonOp = sheetDrawingService.getBatchRemoveOp(drawings) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.INSERT } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
