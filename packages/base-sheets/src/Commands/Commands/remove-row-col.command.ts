import { CommandType, Dimension, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService, Nullable, Rectangle, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { ISelectionManager } from '../../Services/tokens';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../Mutations/add-worksheet-merge.mutation';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../Mutations/delete-range.mutation';
import { InsertRangeMutation } from '../Mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../Mutations/insert-row-col.mutation';
import { IRemoveColMutationFactory, IRemoveRowMutationFactory, RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';

export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    handler: async (accessor: IAccessor) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManager.getCurrentSelections();
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        if (!selections.length) return false;
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        selections.forEach((item) => {
            item.startColumn = 0;
            item.endColumn = worksheet.getMaxColumns();
        });

        const redoMutationParams: IRemoveRowMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams: IInsertRowMutationParams = IRemoveRowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveRowMutation.id, redoMutationParams);

        const deleteRangeValueMutationParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            range: selections,
            shiftDimension: Dimension.ROWS,
        };

        const insertRangeMutationParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(accessor, deleteRangeValueMutationParams);
        if (!insertRangeMutationParams) return false;
        const deleteResult = commandService.executeCommand(DeleteRangeMutation.id, deleteRangeValueMutationParams);

        const mergeData = Tools.deepClone(worksheet.getConfig().mergeData);
        for (let i = 0; i < mergeData.length; i++) {
            const merge = mergeData[i];
            for (let j = 0; j < selections.length; j++) {
                const { startRow, endRow } = selections[j];
                const count = endRow - startRow + 1;
                if (endRow < merge.startRow) {
                    merge.startRow -= count;
                } else if (startRow > merge.endRow) {
                    continue;
                } else if (startRow < merge.startRow && endRow > merge.endRow) {
                    mergeData.splice(i);
                    i--;
                } else {
                    const intersects = Rectangle.getIntersects(selections[j], merge)!;
                    const interLength = intersects.endRow - intersects.startRow + 1;
                    const length = merge.endRow - merge.startRow + 1;
                    if (interLength === length) {
                        mergeData.splice(i);
                        i--;
                    } else {
                        merge.endRow -= intersects.endRow - intersects.startRow + 1;
                    }
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getConfig().mergeData),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergeData,
        };
        const deleteMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(accessor, addMergeMutationParams);
        const mergeResult = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && deleteResult && removeResult && mergeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(InsertRowMutation.id, undoMutationParams) as Promise<boolean>)
                        .then((res) => {
                            if (res) return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(RemoveWorksheetMergeMutation.id, deleteMergeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(AddWorksheetMergeMutation.id, undoRemoveMergeMutationParams);
                            return fase;
                        });
                },
                redo() {
                    return (commandService.executeCommand(RemoveRowMutation.id, redoMutationParams) as Promise<boolean>)
                        .then((res) => {
                            if (res) return commandService.executeCommand(DeleteRangeMutation.id, deleteRangeValueMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);
                            return false;
                        });
                },
            });
            return true;
        }
        return false;
    },
};

export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col',
    handler: async (accessor: IAccessor) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManager.getCurrentSelections();
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        if (!selections.length) return false;
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        selections.forEach((item) => {
            item.startRow = 0;
            item.endRow = worksheet.getMaxRows();
        });

        const redoMutationParams: IRemoveColMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams: IInsertColMutationParams = IRemoveColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveColMutation.id, redoMutationParams);

        const deleteRangeValueMutationParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            range: selections,
            shiftDimension: Dimension.COLUMNS,
        };
        const insertRangeMutationParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(accessor, deleteRangeValueMutationParams);
        if (!insertRangeMutationParams) return false;
        const deleteResult = commandService.executeCommand(DeleteRangeMutation.id, deleteRangeValueMutationParams);

        const mergeData = Tools.deepClone(worksheet.getConfig().mergeData);
        for (let i = 0; i < mergeData.length; i++) {
            let merge = mergeData[i];
            for (let j = 0; j < selections.length; j++) {
                const { startColumn, endColumn } = selections[j];
                const count = endColumn - startColumn + 1;
                if (endColumn < merge.startColumn) {
                    merge.startColumn -= count;
                } else if (startColumn > merge.endColumn) {
                    continue;
                } else if ((startColumn < merge.startColumn && endColumn > merge.endColumn) || (startColumn === merge.startColumn && endColumn === merge.endColumn)) {
                    mergeData.splice(i);
                    i--;
                } else {
                    const intersects = Rectangle.getIntersects(selections[j], merge)!;
                    const interLength = intersects.endColumn - intersects.startColumn + 1;
                    const length = endColumn - startColumn + 1;
                    if (interLength === length) {
                        mergeData.splice(i);
                        i--;
                    } else {
                        merge.endColumn -= intersects.endColumn - intersects.startColumn + 1;
                    }
                }
            }
        }

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getConfig().mergeData),
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergeData,
        };
        const deleteMergeMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(accessor, addMergeMutationParams);
        const mergeResult = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && deleteResult && removeResult && mergeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(InsertColMutation.id, undoMutationParams) as Promise<boolean>)
                        .then((res) => {
                            if (res) return commandService.executeCommand(InsertRangeMutation.id, insertRangeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(RemoveWorksheetMergeMutation.id, deleteMergeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(AddWorksheetMergeMutation.id, undoRemoveMergeMutationParams);
                            return fase;
                        });
                },
                redo() {
                    return (commandService.executeCommand(RemoveColMutation.id, redoMutationParams) as Promise<boolean>)
                        .then((res) => {
                            if (res) return commandService.executeCommand(DeleteRangeMutation.id, deleteRangeValueMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);
                            return false;
                        })
                        .then((res) => {
                            if (res) return commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);
                            return false;
                        });
                },
            });

            return true;
        }
        return false;
    },
};
