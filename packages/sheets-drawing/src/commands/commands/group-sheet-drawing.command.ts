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
import type { IDrawingGroupUpdateParam, IDrawingJsonUndo1 } from '@univerjs/drawing';
import { CommandType, ICommandService, IUndoRedoService } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import { transformToAxisAlignPosition } from '../../basics/transform-position';
import { ISheetDrawingService } from '../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';
import { groupToUngroup } from './drawing-group-params';

export const GroupSheetDrawingCommand: ICommand = {
    id: 'sheet.command.group-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IDrawingGroupUpdateParam[]) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);
        const sheetSkeletonService = accessor.get(SheetSkeletonService);

        if (!params) return false;

        // A new top-level group's bounds come from its children, so its cell
        // markers are derived here rather than trusted from the caller.
        const groupParams: IDrawingGroupUpdateParam[] = [];
        for (const group of params) {
            const { parent } = group;
            if (parent.groupId || !parent.transform) {
                groupParams.push(group);
                continue;
            }
            const skeleton = sheetSkeletonService.ensureSkeleton(parent.unitId, parent.subUnitId);
            if (!skeleton) return false;
            const anchoredParent: ISheetDrawing = {
                ...parent,
                axisAlignSheetTransform: transformToAxisAlignPosition(parent.transform, skeleton),
            };
            groupParams.push({ ...group, parent: anchoredParent });
        }

        const unitIds: string[] = [];
        groupParams.forEach(({ parent, children }) => {
            unitIds.push(parent.unitId);
            children.forEach((child) => {
                unitIds.push(child.unitId);
            });
        });

        const jsonOp = sheetDrawingService.getGroupDrawingOp(groupParams) as IDrawingJsonUndo1;

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
