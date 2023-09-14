import { CommandType, Dimension, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../Services/selection-manager.service';
import { AddWorksheetMergeMutation, AddWorksheetMergeMutationFactory } from '../Mutations/add-worksheet-merge.mutation';
import { RemoveWorksheetMergeMutation, RemoveWorksheetMergeMutationFactory } from '../Mutations/remove-worksheet-merge.mutation';

interface addMergeCommandParams {
    value: Dimension.ROWS | Dimension.COLUMNS;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: addMergeCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selections = selectionManagerService.getRangeDataList();
        if (!selections?.length) return false;
        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        let ranges = selections;

        if (params && params.value != null) {
            const rectangles: IRangeData[] = [];
            for (let i = 0; i < ranges.length; i++) {
                const { startRow, endRow, startColumn, endColumn } = ranges[i];
                if (params.value === Dimension.ROWS) {
                    for (let r = startRow; r <= endRow; r++) {
                        const data = {
                            startRow: r,
                            endRow: r,
                            startColumn,
                            endColumn,
                        };
                        rectangles.push(data);
                    }
                } else if (params.value === Dimension.COLUMNS) {
                    for (let c = startColumn; c <= endColumn; c++) {
                        const data = {
                            startRow,
                            endRow,
                            startColumn: c,
                            endColumn: c,
                        };
                        rectangles.push(data);
                    }
                }
            }
            ranges = rectangles;
        }

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveWorksheetMergeMutationFactory(accessor, removeMergeMutationParams);
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoMutationParams: IRemoveWorksheetMergeMutationParams = AddWorksheetMergeMutationFactory(accessor, addMergeMutationParams);
        const result = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(RemoveWorksheetMergeMutation.id, undoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(AddWorksheetMergeMutation.id, undoRemoveMergeMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams) as Promise<boolean>).then((res) => {
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

export const AddWorksheetMergeAllCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-all',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id);
    },
};
export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id, { value: Dimension.COLUMNS });
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);

        return commandService.executeCommand(AddWorksheetMergeCommand.id, { value: Dimension.ROWS });
    },
};
