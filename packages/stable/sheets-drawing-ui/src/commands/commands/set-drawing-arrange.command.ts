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

import type { IAccessor, ICommand, Nullable } from '@univerjs/core';
import type { IDrawingJsonUndo1, IDrawingOrderMapParam } from '@univerjs/drawing';
import {
    ArrangeTypeEnum,
    CommandType,
    ICommandService,
    IUndoRedoService,
} from '@univerjs/core';
import { DrawingApplyType, ISheetDrawingService, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';

export interface ISetDrawingArrangeCommandParams extends IDrawingOrderMapParam {
    arrangeType: ArrangeTypeEnum;
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

        const sheetDrawingService = accessor.get(ISheetDrawingService);

        const { unitId, subUnitId, drawingIds, arrangeType } = params;

        const drawingOrderMapParam = { unitId, subUnitId, drawingIds } as IDrawingOrderMapParam;

        let jsonOp: Nullable<IDrawingJsonUndo1>;
        if (arrangeType === ArrangeTypeEnum.forward) {
            jsonOp = sheetDrawingService.getForwardDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.backward) {
            jsonOp = sheetDrawingService.getBackwardDrawingOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.front) {
            jsonOp = sheetDrawingService.getFrontDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        } else if (arrangeType === ArrangeTypeEnum.back) {
            jsonOp = sheetDrawingService.getBackDrawingsOp(drawingOrderMapParam) as IDrawingJsonUndo1;
        }

        if (jsonOp == null) {
            return false;
        }

        const { objects, redo, undo } = jsonOp;

        const result = commandService.syncExecuteCommand(SetDrawingApplyMutation.id, { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.ARRANGE });

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: undo, unitId, subUnitId, objects, type: DrawingApplyType.ARRANGE } },
                ],
                redoMutations: [
                    { id: SetDrawingApplyMutation.id, params: { op: redo, unitId, subUnitId, objects, type: DrawingApplyType.ARRANGE } },
                ],
            });

            return true;
        }

        return false;
    },
};
