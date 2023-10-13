import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetRowHiddenMutationParams,
    ISetRowVisibleMutationParams,
    SetRowHiddenMutation,
    SetRowHiddenUndoMutationFactory,
    SetRowVisibleMutation,
    SetRowVisibleUndoMutationFactory,
} from '../mutations/set-row-visible.mutation';

export const SetRowVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetRowVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetRowVisibleUndoMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetRowVisibleMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetRowHiddenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRowVisibleMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

export const SetRowHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetRowHiddenMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetRowHiddenUndoMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetRowHiddenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetRowVisibleMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRowHiddenMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};
