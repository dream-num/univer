import type { ICommand, IRange } from '@univerjs/core';
import { CommandType, Dimension, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '@univerjs/sheets';
import {
    AddMergeUndoMutationFactory,
    AddWorksheetMergeMutation,
    getAddMergeMutationRangeByType,
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
    SelectionManagerService,
} from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

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
                undoMutations: [
                    { id: RemoveWorksheetMergeMutation.id, params: undoMutationParams },
                    { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
                ],
                redoMutations: [
                    { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
                    { id: AddWorksheetMergeMutation.id, params: addMergeMutationParams },
                ],
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
