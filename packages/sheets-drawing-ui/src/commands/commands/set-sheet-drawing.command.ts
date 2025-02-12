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
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';

import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { ISetDrawingCommandParams } from './interfaces';

/**
 * The command to update defined name
 */
export const SetSheetDrawingCommand: ICommand = {
    id: 'sheet.command.set-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        if (!params) return false;

        const { drawings } = params;

        // const newSheetDrawingParams = drawings.map((param) => param.newDrawing);
        // const oldSheetDrawingParams = drawings.map((param) => param.oldDrawing);

        const jsonOp = sheetDrawingService.getBatchUpdateOp(drawings as ISheetDrawing[]) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
                ],
                redoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
                ],
            });

            return true;
        }

        return false;
    },
};
