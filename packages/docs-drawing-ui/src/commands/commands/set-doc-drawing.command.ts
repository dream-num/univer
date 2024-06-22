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
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { DocDrawingApplyType, IDocDrawingService, SetDocDrawingApplyMutation } from '@univerjs/docs-drawing';
import { ClearDocDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import type { ISetDrawingCommandParams } from './interfaces';

/**
 * The command to update defined name
 */
// REFACTOR: @JOCS 需要移除？
export const SetDocDrawingCommand: ICommand = {
    id: 'doc.command.set-doc-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDrawingCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const docDrawingService = accessor.get(IDocDrawingService);

        if (!params) return false;

        const { drawings } = params;

        // const newSheetDrawingParams = drawings.map((param) => param.newDrawing);
        // const oldSheetDrawingParams = drawings.map((param) => param.oldDrawing);

        const jsonOp = docDrawingService.getBatchUpdateOp(drawings as IDocDrawing[]) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(SetDocDrawingApplyMutation.id, { unitId, subUnitId, op: redo, objects, type: DocDrawingApplyType.UPDATE });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDocDrawingApplyMutation.id, params: { unitId, subUnitId, op: undo, objects, type: DocDrawingApplyType.UPDATE } },
                    { id: ClearDocDrawingTransformerOperation.id, params: [unitId] },
                ],
                redoMutations: [
                    { id: SetDocDrawingApplyMutation.id, params: { unitId, subUnitId, op: redo, objects, type: DocDrawingApplyType.UPDATE } },
                    { id: ClearDocDrawingTransformerOperation.id, params: [unitId] },
                ],
            });

            return true;
        }

        return false;
    },
};
