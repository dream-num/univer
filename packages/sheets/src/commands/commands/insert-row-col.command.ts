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

import type { ICellData, ICommand, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    Dimension,
    Direction,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Range,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import { getInsertRangeMutations, InsertRangeUndoMutationFactory } from '../utils/handle-range-mutation';
import { followSelectionOperation } from './utils/selection-utils';

export interface IInsertRowCommandParams {
    unitId: string;
    subUnitId: string;

    /**
     * whether it is inserting row after (DOWN) or inserting before (UP)
     *
     * this determines styles of the cells in the inserted rows
     */
    direction: Direction.UP | Direction.DOWN;
    /**
     * The range will the row be inserted.
     */
    range: IRange;
    cellValue?: IObjectMatrixPrimitiveType<ICellData>;
}
export const InsertRowCommandId = 'sheet.command.insert-row';
/**
 * @internal use `InsertRowBeforeCommand` or `InsertRowAfterCommand` as an external user
 *
 * this command and its interface should not be exported from index.ts
 */
export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: InsertRowCommandId,
    handler: async (accessor: IAccessor, params: IInsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getUniverSheetInstance(params.unitId)!;
        const worksheet = workbook.getSheetBySheetId(params.subUnitId)!;

        const { range, direction, unitId, subUnitId, cellValue } = params;
        const { startRow, endRow } = range;
        const anchorRow = direction === Direction.UP ? startRow : startRow - 1;
        const height = worksheet.getRowHeight(anchorRow);

        // insert row properties & undos
        const insertRowParams: IInsertRowMutationParams = {
            unitId,
            subUnitId,
            range,
            rowInfo: new Array(endRow - startRow + 1).fill(undefined).map(() => ({
                h: height,
                hd: BooleanNumber.FALSE,
            })), // row height should inherit from the anchor row
        };
        const undoRowInsertionParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
            accessor,
            insertRowParams
        );

        const result = sequenceExecute(
            [
                { id: InsertRowMutation.id, params: insertRowParams },
                followSelectionOperation(range, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [{ id: RemoveRowMutation.id, params: undoRowInsertionParams }],
                redoMutations: [{ id: InsertRowMutation.id, params: insertRowParams }],
            });

            return true;
        }

        return false;
    },
};

export const InsertRowBeforeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-before',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const rowCount = range.endRow - range.startRow + 1;
        const cellValue: IObjectMatrixPrimitiveType<ICellData> = {};
        Range.foreach(range, (row, col) => {
            const cell = worksheet.getCell(row, col);
            if (!cell || !cell.s) {
                return;
            }
            if (!cellValue[row]) {
                cellValue[row] = {};
            }
            cellValue[row][col] = { s: cell.s };
        });
        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.UP,
            range: {
                startRow: range.startRow,
                endRow: range.startRow + rowCount - 1,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
            },
            cellValue,
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertRowAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const count = range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.DOWN,
            range: {
                startRow: range.endRow + 1,
                endRow: range.endRow + count,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface IInsertColCommandParams {
    unitId: string;
    subUnitId: string;
    range: IRange;
    direction: Direction.LEFT | Direction.RIGHT;
    cellValue?: IObjectMatrixPrimitiveType<ICellData>;
}
export const InsertColCommandId = 'sheet.command.insert-col';
export const InsertColCommand: ICommand<IInsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: InsertColCommandId,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IInsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { range, direction, subUnitId, unitId, cellValue } = params;
        const { startColumn, endColumn } = params.range;
        const workbook = univerInstanceService.getUniverSheetInstance(params.unitId)!;
        const worksheet = workbook.getSheetBySheetId(params.subUnitId)!;
        const anchorCol = direction === Direction.LEFT ? startColumn : startColumn - 1;
        const width = worksheet.getColumnWidth(anchorCol);

        // insert cols & undos
        const insertColParams: IInsertColMutationParams = {
            unitId,
            subUnitId,
            range,
            colInfo: new Array(endColumn - startColumn + 1).fill(undefined).map(() => ({
                w: width,
                hd: BooleanNumber.FALSE,
            })),
        };
        const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
            accessor,
            insertColParams
        );

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            unitId: params.unitId,
            subUnitId: params.subUnitId,
            range: params.range,
            shiftDimension: Dimension.COLUMNS,
            cellValue,
        };
        const undoInsertRangeParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: InsertColCommand.id,
            params,
        });

        const { redo: insertRangeRedo, undo: insertRangeUndo } = getInsertRangeMutations(
            accessor,
            insertRangeMutationParams
        );

        const result = sequenceExecute(
            [
                { id: InsertColMutation.id, params: insertColParams },
                ...insertRangeRedo,
                ...intercepted.redos,
                followSelectionOperation(range, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: [
                    ...intercepted.undos,
                    ...insertRangeUndo,
                    {
                        id: RemoveColMutation.id,
                        params: undoColInsertionParams,
                    },
                ],
                redoMutations: [
                    { id: InsertColMutation.id, params: insertColParams },
                    ...insertRangeRedo,
                    ...intercepted.redos,
                ],
            });
            return true;
        }

        return false;
    },
};

export const InsertColBeforeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-before',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;
        const cellValue: IObjectMatrixPrimitiveType<ICellData> = {};
        Range.foreach(range, (row, col) => {
            const cell = worksheet.getCell(row, col);
            if (!cell || !cell.s) {
                return;
            }
            if (!cellValue[row]) {
                cellValue[row] = {};
            }
            cellValue[row][col] = { s: cell.s };
        });
        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.LEFT,
            range: {
                startColumn: range.startColumn,
                endColumn: range.startColumn + count - 1,
                startRow: 0,
                endRow: worksheet.getLastRowWithContent(),
            },
            cellValue,
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertColAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;

        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.RIGHT,
            range: {
                startColumn: range.endColumn + 1,
                endColumn: range.endColumn + count,
                startRow: 0,
                endRow: worksheet.getLastRowWithContent(),
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};
