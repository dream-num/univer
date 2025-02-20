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

import type { IAccessor, ICellData, ICommand, IMutationInfo, IObjectMatrixPrimitiveType, IRange } from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';

import {
    BooleanNumber,
    CommandType,
    Direction,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { copyRangeStyles, followSelectionOperation } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

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
 * this command and its interface should not be exported from index.ts
 *
 * @internal
 */
export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: InsertRowCommandId,
    handler: async (accessor: IAccessor, params: IInsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { range, direction, unitId, subUnitId, cellValue } = params;
        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: InsertRowCommand.id,
            params,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(InsertRowByRangeCommand.id, {
            range,
            direction,
            unitId,
            subUnitId,
            cellValue,
        });
    },
};

export const InsertRowByRangeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-by-range',
    handler: (accessor: IAccessor, params: IInsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const { range, direction, unitId, subUnitId, cellValue } = params;
        const { startRow, endRow } = range;
        range.rangeType = RANGE_TYPE.ROW;

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

        const redos: IMutationInfo[] = [{ id: InsertRowMutation.id, params: insertRowParams }];
        const undos: IMutationInfo[] = [{ id: RemoveRowMutation.id, params: undoRowInsertionParams }];

        // set range values
        if (cellValue) {
            redos.push({
                id: SetRangeValuesMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cellValue,
                },
            });
        }

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: InsertRowCommand.id,
            params,
        });

        redos.unshift(...(intercepted.preRedos ?? []));
        redos.push(...(intercepted.redos ?? []));
        redos.push(followSelectionOperation(range, workbook, worksheet));
        undos.unshift(...(intercepted.preUndos ?? []));
        undos.push(...(intercepted.undos ?? []));

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos,
                redoMutations: redos,
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
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;
        const { startRow, endRow } = range;
        const startColumn = 0;
        const endColumn = worksheet.getColumnCount() - 1;
        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.UP,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
            },
            // copy styles from the row above
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, true, startRow - 1),
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertRowAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = range.endRow - range.startRow + 1;

        const startRow = range.endRow + 1;
        const endRow = range.endRow + count;
        const startColumn = 0;
        const endColumn = worksheet.getColumnCount() - 1;

        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.DOWN,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
                rangeType: RANGE_TYPE.ROW,
            },
            // copy styles from the row below
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, true, range.endRow),
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface IInsertMultiRowsCommandParams {
    value: number;
}

export const InsertMultiRowsAboveCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-multi-rows-above',
    handler: async (accessor: IAccessor, params: IInsertMultiRowsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = params.value || 0;

        const startRow = range.startRow;
        const endRow = range.startRow + count - 1;
        const startColumn = 0;
        const endColumn = worksheet.getColumnCount() - 1;
        const copiedStyle = copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, true, startRow - 1);
        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.UP,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
                rangeType: RANGE_TYPE.ROW,
            },
            // copy styles from the row above
            cellValue: copiedStyle,
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertMultiRowsAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-multi-rows-after',
    handler: async (accessor: IAccessor, params: IInsertMultiRowsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0];
        } else {
            // if there are multi selections, we can't decide which row to insert
            // in fact, UI would hides / disables the insert row button
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = params.value || 0;

        const startRow = range.endRow + 1;
        const endRow = range.endRow + count;
        const startColumn = 0;
        const endColumn = worksheet.getColumnCount() - 1;

        const insertRowParams: IInsertRowCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.DOWN,
            range: {
                startRow,
                endRow,
                startColumn,
                endColumn,
                rangeType: RANGE_TYPE.ROW,
            },
            // copy styles from the row below
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, true, range.endRow),
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

    handler: async (accessor: IAccessor, params: IInsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { range, direction, subUnitId, unitId, cellValue } = params;
        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: InsertColCommand.id,
            params,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(InsertColByRangeCommand.id, {
            range,
            direction,
            unitId,
            subUnitId,
            cellValue,
        });
    },
};

export const InsertColByRangeCommand: ICommand<IInsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-by-range',

    handler: (accessor: IAccessor, params: IInsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const { range, direction, subUnitId, unitId, cellValue } = params;
        const { startColumn, endColumn } = params.range;
        range.rangeType = RANGE_TYPE.COLUMN;

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

        const redos: IMutationInfo[] = [{ id: InsertColMutation.id, params: insertColParams }];
        const undos: IMutationInfo[] = [{ id: RemoveColMutation.id, params: undoColInsertionParams }];

        // set range values
        if (cellValue) {
            redos.push({
                id: SetRangeValuesMutation.id,
                params: {
                    unitId,
                    subUnitId,
                    cellValue,
                },
            });
        }

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: InsertColCommand.id,
            params,
        });

        redos.unshift(...(intercepted.preRedos ?? []));
        redos.push(...(intercepted.redos ?? []));
        redos.push(followSelectionOperation(range, workbook, worksheet));
        undos.unshift(...(intercepted.preUndos ?? []));
        undos.push(...(intercepted.undos ?? []));

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.unitId,
                undoMutations: undos.filter(Boolean),
                redoMutations: redos.filter(Boolean),
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
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;

        const { startColumn, endColumn } = range;
        const startRow = 0;
        const endRow = worksheet.getRowCount() - 1;

        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.LEFT,
            range: {
                startColumn,
                endColumn,
                startRow,
                endRow,
                rangeType: RANGE_TYPE.COLUMN,
            },

            // copy styles from the column before
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, false, startColumn - 1),
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertColAfterCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-after',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = range.endColumn - range.startColumn + 1;

        const startColumn = range.endColumn + 1;
        const endColumn = range.endColumn + count;
        const startRow = 0;
        const endRow = worksheet.getRowCount() - 1;

        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.RIGHT,
            range: {
                startColumn,
                endColumn,
                startRow,
                endRow,
            },
            // copy styles from the column after
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, false, range.endColumn),
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};

export interface IInsertMultiColsCommandParams {
    value: number;
}

export const InsertMultiColsLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-multi-cols-before',
    handler: async (accessor: IAccessor, params: IInsertMultiRowsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = params.value || 0;
        const startColumn = range.startColumn;
        const endColumn = range.startColumn + count - 1;
        const startRow = 0;
        const endRow = worksheet.getRowCount() - 1;

        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.LEFT,
            range: {
                startColumn,
                endColumn,
                startRow,
                endRow,
                rangeType: RANGE_TYPE.COLUMN,
            },

            // copy styles from the column before
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, false, startColumn - 1),
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertMultiColsRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-multi-cols-right',
    handler: async (accessor: IAccessor, params: IInsertMultiRowsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const selections = selectionManagerService.getCurrentSelections();
        let range: IRange;

        if (selections?.length === 1) {
            range = selections[0].range;
        } else {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const count = params.value || 0;

        const startColumn = range.endColumn + 1;
        const endColumn = range.endColumn + count;
        const startRow = 0;
        const endRow = worksheet.getRowCount() - 1;

        const insertColParams: IInsertColCommandParams = {
            unitId,
            subUnitId,
            direction: Direction.RIGHT,
            range: {
                startColumn,
                endColumn,
                startRow,
                endRow,
            },
            // copy styles from the column after
            cellValue: copyRangeStyles(worksheet, startRow, endRow, startColumn, endColumn, false, range.endColumn),
        };

        return accessor.get(ICommandService).executeCommand(InsertColCommand.id, insertColParams);
    },
};
