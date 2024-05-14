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
    IDrawingManagerService,
    IUndoRedoService,
} from '@univerjs/core';
import { ArrangeType } from '@univerjs/image-ui';
import { SetDrawingArrangeMutation } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';


export interface ISetImageArrangeMutationParams {
    unitId: string;
    subUnitId: string;
    drawingIds: string[];
}


export interface ISetDrawingArrangeCommandParams extends ISetImageArrangeMutationParams {
    arrangeType: ArrangeType;
}


/**
 * The command to insert new defined name
 */
export const SetDrawingArrangeCommand: ICommand = {
    id: 'sheet.command.set-drawing-arrange',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: ISetDrawingArrangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        if (!params) return false;

        // const { drawingParam, imageParam } = params;


        const drawingManagerService = accessor.get(IDrawingManagerService);

        const { unitId, subUnitId, drawingIds, arrangeType } = params;

        const oldDrawingOrder = [...drawingManagerService.getDrawingOrder(unitId, subUnitId)];

        if (arrangeType === ArrangeType.forward) {
            drawingManagerService.forwardDrawings(unitId, subUnitId, drawingIds);
        } else if (arrangeType === ArrangeType.backward) {
            drawingManagerService.backwardDrawing(unitId, subUnitId, drawingIds);
        } else if (arrangeType === ArrangeType.front) {
            drawingManagerService.frontDrawing(unitId, subUnitId, drawingIds);
        } else if (arrangeType === ArrangeType.back) {
            drawingManagerService.backDrawing(unitId, subUnitId, drawingIds);
        }

        const newDrawingOrder = [...drawingManagerService.getDrawingOrder(unitId, subUnitId)];

        const result = commandService.syncExecuteCommand(SetDrawingArrangeMutation.id, { unitId, subUnitId, drawingIds: newDrawingOrder });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingArrangeMutation.id, params: { unitId, subUnitId, drawingIds: oldDrawingOrder } },
                ],
                redoMutations: [
                    { id: SetDrawingArrangeMutation.id, params: { unitId, subUnitId, drawingIds: newDrawingOrder } },
                ],
            });

            return true;
        }

        return false;
    },
};
