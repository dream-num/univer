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
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';

import type { IInsertDrawingCommandParams } from './interfaces';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

/**
 * The command to insert new defined name
 */
export const InsertSheetDrawingCommand: ICommand = {
    id: 'sheet.command.insert-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IInsertDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (!params) return false;

        // const { drawingParam, imageParam } = params;

        const drawings = params.drawings;

        // const sheetDrawingParams = drawings.map((param) => param.sheetDrawingParam);
        const unitIds: string[] = drawings.map((param) => param.unitId);

        // execute do mutations and add undo mutations to undo stack if completed
        const jsonOp = sheetDrawingService.getBatchAddOp(drawings) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        const intercepted = sheetInterceptorService.onCommandExecute({ id: InsertSheetDrawingCommand.id, params });

        const insertMutation = { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.INSERT } };
        const undoInsertMutation = { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.REMOVE } };

        const result = sequenceExecute([...(intercepted.preRedos ?? []), insertMutation, ...intercepted.redos], commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    undoInsertMutation,
                    ...(intercepted.undos),
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    insertMutation,
                    ...intercepted.redos,
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
