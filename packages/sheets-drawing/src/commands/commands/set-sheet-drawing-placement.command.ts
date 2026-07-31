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

import type { ICommand } from '@univerjs/core';
import type { ISheetDrawingPlacementInput } from '../../services/sheet-drawing-placement';
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { SheetSkeletonService } from '@univerjs/sheets';
import { applySheetDrawingPlacement } from '../../services/sheet-drawing-placement';
import { ISheetDrawingService, SheetDrawingAnchorType } from '../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

export interface ISetSheetDrawingPlacementCommandParams {
    unitId: string;
    subUnitId: string;
    drawings: Array<{
        drawingId: string;
        placement: ISheetDrawingPlacementInput;
    }>;
}

export const SetSheetDrawingPlacementCommand: ICommand<ISetSheetDrawingPlacementCommandParams> = {
    id: 'sheet.command.set-drawing-placement',
    type: CommandType.COMMAND,
    handler: (accessor, params) => {
        if (!params?.drawings.length) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const drawingService = accessor.get(ISheetDrawingService);
        const skeleton = params.drawings.every(({ placement }) => placement.kind === SheetDrawingAnchorType.None)
            ? undefined
            : accessor.get(SheetSkeletonService).ensureSkeleton(params.unitId, params.subUnitId);
        const updatedDrawings = [];
        for (const { drawingId, placement } of params.drawings) {
            const drawing = drawingService.getDrawingByParam({
                unitId: params.unitId,
                subUnitId: params.subUnitId,
                drawingId,
            });
            if (!drawing) {
                return false;
            }
            updatedDrawings.push(applySheetDrawingPlacement(drawing, placement, skeleton));
        }
        const drawingOp = drawingService.getBatchUpdateOp(updatedDrawings);
        const { unitId, subUnitId, undo, redo, objects } = drawingOp;
        const redoMutations = [
            {
                id: SetDrawingApplyMutation.id,
                params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE },
            },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];
        const undoMutations = [
            {
                id: SetDrawingApplyMutation.id,
                params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE },
            },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
        ];
        const result = sequenceExecute(redoMutations, commandService);
        if (!result.result) {
            return false;
        }

        undoRedoService.pushUndoRedo({
            unitID: unitId,
            undoMutations,
            redoMutations,
        });
        return true;
    },
};
