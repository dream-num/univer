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
import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';

interface IAddMergeCommandParams {
    value: Dimension.ROWS | Dimension.COLUMNS;
}

export const AddWorksheetMergeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.add-worksheet-merge',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IAddMergeCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const selections = selectionManagerService.getSelectionRanges();
        if (!selections?.length) {
            return false;
        }

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        const worksheet = workbook?.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            return false;
        }

        let ranges = selections;

        if (params && params.value != null) {
            const rectangles: IRange[] = [];
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
        const undoRemoveMergeMutationParams: IAddWorksheetMergeMutationParams = RemoveMergeUndoMutationFactory(
            accessor,
            removeMergeMutationParams
        );
        const removeResult = commandService.executeCommand(RemoveWorksheetMergeMutation.id, removeMergeMutationParams);

        const addMergeMutationParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoMutationParams: IRemoveWorksheetMergeMutationParams = AddMergeUndoMutationFactory(
            accessor,
            addMergeMutationParams
        );
        const result = commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
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
                            return commandService.executeCommand(AddWorksheetMergeMutation.id, addMergeMutationParams);
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
