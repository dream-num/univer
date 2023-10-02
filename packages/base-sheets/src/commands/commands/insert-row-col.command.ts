import {
    CommandType,
    Dimension,
    Direction,
    ICellData,
    ICommand,
    ICommandInfo,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IUndoRedoService,
    Nullable,
    ObjectMatrix,
    sequenceExecute,
    Tools,
    Worksheet,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import {
    InsertColMutation,
    InsertColMutationFactory,
    InsertRowMutation,
    InsertRowMutationUndoFactory,
} from '../mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import {
    RemoveWorksheetMergeMutation,
    RemoveWorksheetMergeMutationFactory,
} from '../mutations/remove-worksheet-merge.mutation';

export interface IInsertRowCommandParams {
    workbookId: string;
    worksheetId: string;
    direction: Direction.UP | Direction.DOWN;
    range: IRange;
}

/**
 * @internal use `InsertRowBeforeCommand` or `InsertRowAfterCommand` as an external user
 *
 * this command and its interface should not be exported from index.ts
 */
export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',
    handler: async (accessor: IAccessor, params: IInsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)!.getWorkBook()!;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId)!;

        // insert rows & undos
        const redoInsertMutationParams: IInsertRowMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
        };
        const undoMutationParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
            accessor,
            redoInsertMutationParams
        );

        // insert range values & undos
        const { startRow, endRow, startColumn, endColumn } = params.range;
        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, { v: '', m: '' }); // FIXME@wzhudev: should copy styles
            }
        }
        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            range: [params.range],
            shiftDimension: Dimension.ROWS,
            cellValue: cellValue.getData(),
        };
        const undoInsertRangeMutationParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        // update merged cells & undos
        const mergeData = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const count = endRow - startRow + 1;
            if (startRow > merge.endRow) {
                continue;
            } else if (endRow < merge.startRow) {
                merge.startRow += count;
                merge.endRow += count;
            } else {
                merge.endRow += count;
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: mergeData,
        };
        const undoAddMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeMutationParams
        );

        const result = await sequenceExecute(
            [
                { id: InsertRowMutation.id, params: redoInsertMutationParams },
                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
            ],
            commandService
        );

        if (result.result) {
            undoRedoService.pushUndoRedo({
                URI: params.workbookId,
                undo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: DeleteRangeMutation.id, params: undoInsertRangeMutationParams },
                                { id: RemoveRowMutation.id, params: undoMutationParams },
                                { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                                { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeMutationParams },
                            ],
                            commandService
                        )
                    ).result,
                redo: async () =>
                    (
                        await sequenceExecute(
                            [
                                { id: InsertRowMutation.id, params: redoInsertMutationParams },
                                { id: InsertRangeMutation.id, params: insertRangeMutationParams },
                                { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                                { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                            ],
                            commandService
                        )
                    ).result,
            });
            return true;
        }

        return false;
    },
};

export interface IInsertRowBeforeOrAfterCommandParams {
    value: number;
}

export const InsertRowBeforeCommand: ICommand<IInsertRowBeforeOrAfterCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-before',
    handler: async (accessor: IAccessor, params?: IInsertRowBeforeOrAfterCommandParams) => {
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

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const rowCount = params?.value || range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.UP,
            range: {
                startRow: range.startRow,
                endRow: range.startRow + rowCount - 1,
                startColumn: 0,
                endColumn: 0,
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertRowAfterCommand: ICommand<IInsertRowBeforeOrAfterCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-after',
    handler: async (accessor: IAccessor, params: IInsertRowBeforeOrAfterCommandParams) => {
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

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance()?.getWorkBook();
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const rowCount = params?.value || range.endRow - range.startRow + 1;

        const insertRowParams: IInsertRowCommandParams = {
            workbookId,
            worksheetId,
            direction: Direction.DOWN,
            range: {
                startRow: range.endRow + 1,
                endRow: range.endRow + rowCount,
                startColumn: 0,
                endColumn: 0,
            },
        };

        return accessor.get(ICommandService).executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface InsertColCommandParams {
    value: number;
}

export interface InsertColCommandBaseParams {
    workbookId: string;
    worksheetId: string;
    range: IRange;
}

export const InsertColCommand: ICommand<InsertColCommandBaseParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: InsertColCommandBaseParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: IInsertColMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [params.range],
        };
        const undoMutationParams: IRemoveColMutationParams = InsertColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(InsertColMutation.id, redoMutationParams);

        const { startRow, endRow, startColumn, endColumn } = params.range;
        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, { v: '', m: '' });
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            range: [params.range],
            shiftDimension: Dimension.COLUMNS,
            cellValue: cellValue.getData(),
        };

        const deleteRangeMutationParams: Nullable<IDeleteRangeMutationParams> = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );
        if (!deleteRangeMutationParams) return false;
        const deleteResult = commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);

        const mergeData = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            const count = endColumn - startColumn + 1;
            if (startColumn > merge.endColumn) {
                continue;
            } else if (endColumn < merge.startColumn) {
                merge.startColumn += count;
                merge.endColumn += count;
            } else {
                merge.endColumn += count;
            }
        }

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: mergeData,
        };
        const deleteMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(
            accessor,
            addMergeMutationParams
        );
        const mergeResult = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && deleteResult && removeResult && mergeResult) {
            undoRedoService.pushUndoRedo({
                URI: params.workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            DeleteRangeMutation.id,
                            deleteRangeMutationParams
                        ) as Promise<boolean>
                    )
                        .then((res) => {
                            if (res) return commandService.executeCommand(RemoveColMutation.id, undoMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res)
                                return commandService.executeCommand(
                                    RemoveWorksheetMergeMutation.id,
                                    deleteMergeMutationParams
                                );
                            return false;
                        })
                        .then((res) => {
                            if (res)
                                return commandService.executeCommand(
                                    AddWorksheetMergeMutation.id,
                                    undoRemoveMergeMutationParams
                                );
                            return false;
                        });
                },
                redo() {
                    return (commandService.executeCommand(InsertColMutation.id, redoMutationParams) as Promise<boolean>)
                        .then((res) => {
                            if (res)
                                return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res)
                                return commandService.executeCommand(
                                    RemoveWorksheetMergeMutation.id,
                                    removeMergeMutationParams
                                );
                            return false;
                        })
                        .then((res) => {
                            if (res)
                                return commandService.executeCommand(
                                    AddWorksheetMergeMutation.id,
                                    addMergeMutationParams
                                );
                            return false;
                        });
                },
            });

            return true;
        }
        return false;
    },
};

export const InsertColBeforeCommand: ICommand<InsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-before',
    handler: async (accessor: IAccessor, params?: InsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()
            .getWorkBook()
            .getActiveSheet()
            .getSheetId();
        let range: IRange;
        const selections = selectionManagerService.getRangeDatas();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endColumn - range.startColumn + 1;
        if (params) {
            count = params.value ?? 1;
        }

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            range: {
                startColumn: range.startColumn,
                endColumn: range.startColumn + count - 1,
                startRow: 0,
                endRow: worksheet.getLastColumn(),
            },
        };

        return commandService.executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertColAfterCommand: ICommand<InsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-after',
    handler: async (accessor: IAccessor, params?: InsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()
            .getWorkBook()
            .getActiveSheet()
            .getSheetId();
        let range: IRange;
        const selections = selectionManagerService.getRangeDatas();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endColumn - range.startColumn + 1;
        if (params) {
            count = params.value ?? 1;
        }

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            range: {
                startColumn: range.endColumn + 1,
                endColumn: range.endColumn + count,
                startRow: 0,
                endRow: worksheet.getLastColumn(),
            },
        };

        return commandService.executeCommand(InsertColCommand.id, insertColParams);
    },
};

/**
 * When inserting a row, the inserted row should copy cell styles from the anchor row.
 */
export function InsertRowMutationFactory(
    anchorRow: number,
    rowCount: number,
    workbookId: string,
    worksheet: Worksheet
): ICommandInfo[] {
    const worksheetId = worksheet.getSheetId();
    const redoMutations: ICommandInfo[] = [];

    // TODO: insert before or insert after

    redoMutations.push({
        id: InsertRowMutation.id,
        params: {
            workbookId,
            worksheetId,
            ranges: [
                {
                    startRow: anchorRow,
                    endRow: anchorRow + rowCount - 1,
                    startColumn: 0,
                    endColumn: worksheet.getColumnCount() - 1,
                },
            ],
        },
    });

    // copy cell styles to previous rows

    return redoMutations;
}

export function InsertColumnMutationFactory(
    anchorColumn: number,
    columnCount: number,
    worksheetId: string,
    worksheet: Worksheet
): ICommandInfo[] {
    return [];
}
