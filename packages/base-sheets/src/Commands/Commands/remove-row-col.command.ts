import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { ISelectionManager } from '../../Services/tokens';
import { InsertColMutation, InsertRowMutation } from '../Mutations/insert-row-col.mutation';
import { IRemoveColMutationFactory, IRemoveRowMutationFactory, RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

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

        const redoMutationParams: IRemoveRowMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams: IInsertRowMutationParams = IRemoveRowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveRowMutation.id, redoMutationParams);

        const removeRangeValueMutationParams: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            rangeData: selections,
        };

        const undoRemoveRangeValueMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, removeRangeValueMutationParams);
        const removeResult = commandService.executeCommand(SetRangeValuesMutation.id, removeRangeValueMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(InsertRowMutation.id, undoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetRangeValuesMutation.id, undoRemoveRangeValueMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveRowMutation.id, redoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetRangeValuesMutation.id, removeRangeValueMutationParams);
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

        const redoMutationParams: IRemoveColMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams: IInsertColMutationParams = IRemoveColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveColMutation.id, redoMutationParams);

        const removeRangeValueMutationParams: ISetRangeValuesMutationParams = {
            workbookId,
            worksheetId,
            rangeData: selections,
        };

        const undoRemoveRangeValueMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, removeRangeValueMutationParams);
        const removeResult = commandService.executeCommand(SetRangeValuesMutation.id, removeRangeValueMutationParams);

        if (result && removeResult) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return (commandService.executeCommand(InsertColMutation.id, undoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetRangeValuesMutation.id, undoRemoveRangeValueMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveColMutation.id, redoMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(SetRangeValuesMutation.id, removeRangeValueMutationParams);
                        return false;
                    });
                },
            });

            return true;
        }
        return false;
    },
};
