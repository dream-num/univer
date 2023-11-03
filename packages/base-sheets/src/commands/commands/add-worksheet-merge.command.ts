import {
    CommandType,
    Dimension,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';

export interface IAddMergeCommandParams {
    value?: Dimension.ROWS | Dimension.COLUMNS;
    selections: IRange[];
    workbookId: string;
    worksheetId: string;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IAddMergeCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const workbookId = params.workbookId;
        const worksheetId = params.worksheetId;
        const selections = params.selections;

        const ranges = getAddMergeMutationRangeByType(selections, params.value);

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const removeResult = commandService.syncExecuteCommand(
            RemoveWorksheetMergeMutation.id,
            removeMergeMutationParams
        );

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoMutationParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            accessor,
            addMergeMutationParams
        );
        const result = commandService.syncExecuteCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            RemoveWorksheetMergeMutation.id,
                            undoMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(
                                AddWorksheetMergeMutation.id,
                                undoRemoveMergeMutationParams
                            );
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            RemoveWorksheetMergeMutation.id,
                            removeMergeMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.syncExecuteCommand(
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

export const AddWorksheetMergeAllCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-all',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};
export const AddWorksheetMergeVerticalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-vertical',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();

        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.COLUMNS,
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};

export const AddWorksheetMergeHorizontalCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge-horizontal',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) return false;

        const workSheet = workbook.getActiveSheet();
        if (!workSheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = workSheet.getSheetId();
        return commandService.executeCommand(AddWorksheetMergeCommand.id, {
            value: Dimension.ROWS,
            selections,
            workbookId,
            worksheetId,
        } as IAddMergeCommandParams);
    },
};

/**
 * calculates the selection based on the merged cell type
 * @param {IRange[]} selection
 * @param {Dimension} [type]
 * @return {*}
 */
export const getAddMergeMutationRangeByType = (selection: IRange[], type?: Dimension) => {
    let ranges = selection;
    if (type !== undefined) {
        const rectangles: IRange[] = [];
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];
            if (type === Dimension.ROWS) {
                for (let r = startRow; r <= endRow; r++) {
                    const data = {
                        startRow: r,
                        endRow: r,
                        startColumn,
                        endColumn,
                    };
                    rectangles.push(data);
                }
            } else if (type === Dimension.COLUMNS) {
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
    return ranges;
};
