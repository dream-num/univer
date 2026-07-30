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
import type { ISheetDrawing } from '../../services/sheet-drawing.service';
import {
    CommandType,

    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import { isSheetDrawingPlacementTarget, materializeSheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';

export interface IInsertSheetDrawingCommandParams {
    unitId: string;
    drawings: ISheetDrawing[];
}

export const InsertSheetDrawingCommand: ICommand = {
    id: 'sheet.command.insert-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IInsertSheetDrawingCommandParams) => {
        if (!params) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const sheetSkeletonService = accessor.get(SheetSkeletonService);

        const drawings = params.drawings.map((drawing) => {
            if (!isSheetDrawingPlacementTarget(drawing) || drawing.anchorType === SheetDrawingAnchorType.None) {
                return drawing;
            }

            const skeleton = sheetSkeletonService.ensureSkeleton(drawing.unitId, drawing.subUnitId);
            return skeleton ? materializeSheetDrawingPlacement(drawing, skeleton) : drawing;
        });
        const jsonOp = sheetDrawingService.getBatchAddOp(drawings) as IDrawingJsonUndo1;
        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        const intercepted = sheetInterceptorService.onCommandExecute({ id: InsertSheetDrawingCommand.id, params });
        const redoMutations = [
            ...(intercepted.preRedos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    op: redo,
                    objects,
                    type: DrawingApplyType.INSERT,
                },
            },
            ...intercepted.redos,
        ];
        const undoMutations = [
            ...(intercepted.preUndos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    op: undo,
                    objects,
                    type: DrawingApplyType.REMOVE,
                },
            },
            ...intercepted.undos,
        ];

        const result = sequenceExecute(redoMutations, commandService);

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
            });

            return true;
        }

        return false;
    },
};
