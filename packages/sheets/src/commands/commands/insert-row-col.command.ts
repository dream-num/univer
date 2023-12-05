import type { ICellData, IColumnData, ICommand, IRange, IRowData, IStyleData, Nullable } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    Dimension,
    Direction,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectArray,
    ObjectMatrix,
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
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import {
    InsertColMutation,
    InsertColMutationUndoFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';

export interface IInsertRowCommandParams {
    workbookId: string;
    worksheetId: string;

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

        const workbook = univerInstanceService.getUniverSheetInstance(params.workbookId)!;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId)!;

        const { range, direction, workbookId, worksheetId } = params;
        const { startRow, endRow, startColumn, endColumn } = range;
        const anchorRow = direction === Direction.UP ? startRow : startRow - 1;
        const height = worksheet.getRowHeight(anchorRow);

        // insert row properties & undos
        const insertRowParams: IInsertRowMutationParams = {
            workbookId,
            worksheetId,
            ranges: [range],
            rowInfo: new ObjectArray<IRowData>(
                // row height should inherit from the anchor row
                new Array(endRow - startRow + 1).fill(undefined).map(() => ({
                    h: height,
                    hd: BooleanNumber.FALSE,
                }))
            ),
        };
        const undoRowInsertionParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
            accessor,
            insertRowParams
        );

        // insert range contents & styles & undos
        const cellValue = new ObjectMatrix<ICellData>();
        const worksheetMatrix = worksheet.getCellMatrix();
        const cellStyleByColumn = new Map<number, string | Nullable<IStyleData>>();
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                if (!cellStyleByColumn.has(column)) {
                    cellStyleByColumn.set(column, worksheetMatrix.getValue(anchorRow, column)?.s);
                }
                const s = cellStyleByColumn.get(column);
                cellValue.setValue(row, column, { v: '', s });
            }
        }
        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
            shiftDimension: Dimension.ROWS,
            cellValue: cellValue.getData(),
        };
        const undoInsertRangeMutationParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );
        // intercept the command execution to gether undo redo commands
        const intercepted = accessor.get(SheetInterceptorService).onCommandExecute({ id: InsertRowCommand.id, params });

        const result = sequenceExecute(
            [
                { id: InsertRowMutation.id, params: insertRowParams },
                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                ...intercepted.redos,
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.workbookId,
                undoMutations: [
                    ...intercepted.undos,
                    { id: DeleteRangeMutation.id, params: undoInsertRangeMutationParams },
                    { id: RemoveRowMutation.id, params: undoRowInsertionParams },
                ],
                redoMutations: [
                    { id: InsertRowMutation.id, params: insertRowParams },
                    { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                    ...intercepted.redos,
                ],
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

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const rowCount = range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.UP,
            range: {
                startRow: range.startRow,
                endRow: range.startRow + rowCount - 1,
                startColumn: 0,
                endColumn: worksheet.getColumnCount() - 1,
            },
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

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
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
    workbookId: string;
    worksheetId: string;
    range: IRange;
    direction: Direction.LEFT | Direction.RIGHT;
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

        const { range, direction, worksheetId, workbookId } = params;
        const { startRow, endRow, startColumn, endColumn } = params.range;
        const workbook = univerInstanceService.getUniverSheetInstance(params.workbookId)!;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId)!;
        const anchorCol = direction === Direction.LEFT ? startColumn : startColumn - 1;
        const width = worksheet.getColumnWidth(anchorCol);

        // insert cols & undos
        const insertColParams: IInsertColMutationParams = {
            workbookId,
            worksheetId,
            ranges: [range],
            colInfo: new ObjectArray<IColumnData>(
                new Array(endColumn - startColumn + 1).fill(undefined).map(() => ({
                    w: width,
                    hd: BooleanNumber.FALSE,
                }))
            ),
        };
        const undoColInsertionParams: IRemoveColMutationParams = InsertColMutationUndoFactory(
            accessor,
            insertColParams
        );

        // insert range styles & undos
        const cellValue = new ObjectMatrix<ICellData>();
        const worksheetMatrix = worksheet.getCellMatrix();
        const cellStyleByRow = new Map<number, string | Nullable<IStyleData>>();
        for (let row = startRow; row <= endRow; row++) {
            for (let column = startColumn; column <= endColumn; column++) {
                if (!cellStyleByRow.has(row)) {
                    cellStyleByRow.set(row, worksheetMatrix.getValue(row, anchorCol)?.s);
                }

                const s = cellStyleByRow.get(row);
                cellValue.setValue(row, column, { v: '', s });
            }
        }
        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };
        const undoInsertRangeParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: InsertColCommand.id,
            params,
        });
        const result = sequenceExecute(
            [
                { id: InsertColMutation.id, params: insertColParams },
                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                ...intercepted.redos,
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                unitID: params.workbookId,
                undoMutations: [
                    ...intercepted.undos,
                    { id: DeleteRangeMutation.id, params: undoInsertRangeParams },
                    {
                        id: RemoveColMutation.id,
                        params: undoColInsertionParams,
                    },
                ],
                redoMutations: [
                    { id: InsertColMutation.id, params: insertColParams },
                    { id: InsertRangeMutation.id, params: insertRangeMutationParams },
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

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;

        const insertColParams: IInsertColCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.LEFT,
            range: {
                startColumn: range.startColumn,
                endColumn: range.startColumn + count - 1,
                startRow: 0,
                endRow: worksheet.getLastColumnWithContent(),
            },
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

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const count = range.endColumn - range.startColumn + 1;

        const insertColParams: IInsertColCommandParams = {
            workbookId,
            worksheetId,
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
