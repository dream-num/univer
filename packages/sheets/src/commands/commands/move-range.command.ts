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

import type { ICellData, ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { NORMAL_SELECTION_PLUGIN_NAME } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import type { IMoveRangeMutationParams } from '../mutations/move-range.mutation';
import { MoveRangeMutation } from '../mutations/move-range.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';

export interface IMoveRangeCommandParams {
    toRange: IRange;
    fromRange: IRange;
}
export const MoveRangeCommandId = 'sheet.command.move-range';
export const MoveRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: MoveRangeCommandId,
    handler: async (accessor: IAccessor, params: IMoveRangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const fromValues = worksheet.getRange(params.fromRange).getValues();

        const newFromCellValues = fromValues.reduce((res, row, rowIndex) => {
            row.forEach((colItem, colIndex) => {
                res.setValue(params.fromRange.startRow + rowIndex, params.fromRange.startColumn + colIndex, null);
            });
            return res;
        }, new ObjectMatrix<ICellData | null>());
        const currentFromCellValues = fromValues.reduce((res, row, rowIndex) => {
            row.forEach((colItem, colIndex) => {
                res.setValue(params.fromRange.startRow + rowIndex, params.fromRange.startColumn + colIndex, colItem);
            });
            return res;
        }, new ObjectMatrix<ICellData | null>());

        const newToCellValues = fromValues.reduce((res, row, rowIndex) => {
            row.forEach((colItem, colIndex) => {
                res.setValue(params.toRange.startRow + rowIndex, params.toRange.startColumn + colIndex, colItem);
            });
            return res;
        }, new ObjectMatrix<ICellData | null>());
        const currentToCellValues = worksheet
            .getRange(params.toRange)
            .getValues()
            .reduce((res, row, rowIndex) => {
                row.forEach((colItem, colIndex) => {
                    res.setValue(params.toRange.startRow + rowIndex, params.toRange.startColumn + colIndex, colItem);
                });
                return res;
            }, new ObjectMatrix<ICellData | null>());

        const doMoveRangeMutation: IMoveRangeMutationParams = {
            from: newFromCellValues.getMatrix(),
            to: newToCellValues.getMatrix(),
            workbookId,
            worksheetId,
        };
        const undoMoveRangeMutation: IMoveRangeMutationParams = {
            from: currentFromCellValues.getMatrix(),
            to: currentToCellValues.getMatrix(),
            workbookId,
            worksheetId,
        };
        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });

        const redos = [
            { id: MoveRangeMutation.id, params: doMoveRangeMutation },
            ...interceptorCommands.redos,
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: workbookId,
                    sheetId: worksheetId,
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    selections: [{ range: params.toRange }],
                },
            },
        ];
        const undos = [
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: workbookId,
                    sheetId: worksheetId,
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    selections: [{ range: params.fromRange }],
                },
            },
            ...interceptorCommands.undos,
            { id: MoveRangeMutation.id, params: undoMoveRangeMutation },
        ];

        const result = await sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }
        return false;
    },
};
