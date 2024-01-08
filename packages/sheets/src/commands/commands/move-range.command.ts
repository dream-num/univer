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

import type { ICellData, ICommand, IRange, Nullable } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectMatrix,
    Range,
    Rectangle,
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
    handler: (accessor: IAccessor, params: IMoveRangeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const cellMatrix = worksheet.getCellMatrix();

        const fromCellValue = new ObjectMatrix<Nullable<ICellData>>();
        const newFromCellValue = new ObjectMatrix<Nullable<ICellData>>();
        const cellToRange = (row: number, col: number) => ({
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        });

        Range.foreach(params.fromRange, (row, col) => {
            fromCellValue.setValue(row, col, cellMatrix.getValue(row, col));
            newFromCellValue.setValue(row, col, null);
        });
        const toCellValue = new ObjectMatrix<Nullable<ICellData>>();

        Range.foreach(params.toRange, (row, col) => {
            toCellValue.setValue(row, col, cellMatrix.getValue(row, col));
        });

        const newToCellValue = new ObjectMatrix<Nullable<ICellData>>();

        Range.foreach(params.fromRange, (row, col) => {
            const cellRange = cellToRange(row, col);
            const relativeRange = Rectangle.getRelativeRange(cellRange, params.fromRange);
            const range = Rectangle.getPositionRange(relativeRange, params.toRange);
            newToCellValue.setValue(range.startRow, range.startColumn, cellMatrix.getValue(row, col));
        });

        const doMoveRangeMutation: IMoveRangeMutationParams = {
            from: {
                value: newFromCellValue.getMatrix(),
                subUnitId,
            },
            to: {
                value: newToCellValue.getMatrix(),
                subUnitId,
            },
            unitId,
        };
        const undoMoveRangeMutation: IMoveRangeMutationParams = {
            from: {
                value: fromCellValue.getMatrix(),
                subUnitId,
            },
            to: {
                value: toCellValue.getMatrix(),
                subUnitId,
            },
            unitId,
        };
        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveRangeCommand.id, params });

        const redos = [
            { id: MoveRangeMutation.id, params: doMoveRangeMutation },
            ...interceptorCommands.redos,
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    selections: [{ range: params.toRange }],
                },
            },
        ];
        const undos = [
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId,
                    sheetId: subUnitId,
                    pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                    selections: [{ range: params.fromRange }],
                },
            },
            ...interceptorCommands.undos,
            { id: MoveRangeMutation.id, params: undoMoveRangeMutation },
        ];

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }
        return false;
    },
};
