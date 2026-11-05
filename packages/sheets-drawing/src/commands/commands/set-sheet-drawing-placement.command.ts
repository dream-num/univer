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
import { CommandType, ICommandService, IUndoRedoService, sequenceExecute } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetInterceptorService, SheetSkeletonService } from '@univerjs/sheets';
import type { ISheetDrawingPlacementInput } from '../../services/sheet-drawing-placement';
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

        if (!accessor.get(IDrawingManagerService).canExecuteCommand({ id: SetSheetDrawingPlacementCommand.id, params })) {
            return false;
        }

        const commandService = accessor.get(ICommandService);
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
        const intercepted = accessor.get(SheetInterceptorService).onCommandExecute({
            id: SetSheetDrawingPlacementCommand.id,
            params,
        });
        const { unitId, subUnitId, undo, redo, objects } = drawingService.getBatchUpdateOp(updatedDrawings);
        const redoMutations = [
            ...(intercepted.preRedos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: { unitId, subUnitId, op: redo, objects, type: DrawingApplyType.UPDATE },
            },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
            ...intercepted.redos,
        ];
        const undoMutations = [
            ...(intercepted.preUndos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: { unitId, subUnitId, op: undo, objects, type: DrawingApplyType.UPDATE },
            },
            { id: ClearSheetDrawingTransformerOperation.id, params: [unitId] },
            ...intercepted.undos,
        ];
        if (!sequenceExecute(redoMutations, commandService).result) {
            return false;
        }
        accessor.get(IUndoRedoService).pushUndoRedo({ unitID: unitId, redoMutations, undoMutations });
        return true;
    },
};
