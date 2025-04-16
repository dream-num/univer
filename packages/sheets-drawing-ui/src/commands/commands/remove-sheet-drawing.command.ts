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
import type { IDeleteDrawingCommandParams } from './interfaces';
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
 * The command to remove new sheet image
 */
export const RemoveSheetDrawingCommand: ICommand = {
    id: 'sheet.command.remove-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDeleteDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

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

        const intercepted = sheetInterceptorService.onCommandExecute({ id: RemoveSheetDrawingCommand.id, params });

        // execute do mutations and add undo mutations to undo stack if completed
        const removeMutation = { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.REMOVE } };
        const undoRemoveMutation = { id: SetDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.INSERT } };

        const result = sequenceExecute([...(intercepted.preRedos ?? []), removeMutation, ...intercepted.redos], commandService);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    undoRemoveMutation,
                    ...intercepted.undos,
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    removeMutation,
                    ...intercepted.redos,
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
