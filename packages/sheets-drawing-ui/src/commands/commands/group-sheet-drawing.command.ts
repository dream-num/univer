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

import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import type { IDrawingGroupUpdateParam, IDrawingJsonUndo1 } from '@univerjs/drawing';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import { groupToUngroup } from './utils';

/**
 * The command to insert new defined name
 */
export const GroupSheetDrawingCommand: ICommand = {
    id: 'sheet.command.group-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDrawingGroupUpdateParam[]) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        if (!params) return false;

        const unitIds: string[] = [];
        params.forEach(({ parent, children }) => {
            unitIds.push(parent.unitId);
            children.forEach((child) => {
                unitIds.push(child.unitId);
            });
        });

        // execute do mutations and add undo mutations to undo stack if completed
        const jsonOp = sheetDrawingService.getGroupDrawingOp(params) as IDrawingJsonUndo1;

        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.GROUP });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects: groupToUngroup(objects as IDrawingGroupUpdateParam[]), type: DrawingApplyType.UNGROUP } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
                redoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.GROUP } },
                    { id: ClearSheetDrawingTransformerOperation.id, params: unitIds },
                ],
            });

            return true;
        }

        return false;
    },
};
