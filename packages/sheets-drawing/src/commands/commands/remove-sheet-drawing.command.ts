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

import type { DrawingTypeEnum, IAccessor, ICommand } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import { ISheetDrawingService } from '../../services/sheet-drawing.service';
import { DrawingApplyType, SetDrawingApplyMutation } from '../mutations/set-drawing-apply.mutation';
import { ClearSheetDrawingTransformerOperation } from '../operations/clear-drawing-transformer.operation';

export interface IRemoveSheetDrawingCommandParam {
    unitId: string;
    subUnitId: string;
    drawingId: string;
    drawingType: DrawingTypeEnum;
}

export interface IRemoveSheetDrawingCommandParams {
    unitId: string;
    drawings: IRemoveSheetDrawingCommandParam[];
}

export const RemoveSheetDrawingCommand: ICommand = {
    id: 'sheet.command.remove-sheet-image',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params?: IRemoveSheetDrawingCommandParams) => {
        if (!params) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const sheetDrawingService = accessor.get(ISheetDrawingService);

        const { drawings } = params;
        const jsonOp = sheetDrawingService.getBatchRemoveOp(drawings) as IDrawingJsonUndo1;
        const { unitId, subUnitId, undo, redo, objects } = jsonOp;

        if (Array.isArray(objects) && objects.length === 0) {
            return false;
        }

        const intercepted = sheetInterceptorService.onCommandExecute({ id: RemoveSheetDrawingCommand.id, params });
        const redoMutations = [
            ...(intercepted.preRedos ?? []),
            {
                id: SetDrawingApplyMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    op: redo,
                    objects,
                    type: DrawingApplyType.REMOVE,
                },
            },
            {
                id: ClearSheetDrawingTransformerOperation.id,
                params: [unitId],
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
                    type: DrawingApplyType.INSERT,
                },
            },
            {
                id: ClearSheetDrawingTransformerOperation.id,
                params: [unitId],
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
