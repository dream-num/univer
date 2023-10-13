import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../services/selection-manager.service';
import {
    ISetColHiddenMutationParams,
    ISetColVisibleMutationParams,
    SetColHiddenMutation,
    SetColHiddenUndoMutationFactory,
    SetColVisibleMutation,
    SetColVisibleUndoMutationFactory,
} from '../mutations/set-col-visible.mutation';

export const SetColVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible',
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

        const redoMutationParams: ISetColVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetColVisibleMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetColHiddenMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetColVisibleMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};

export const SetColHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-hidden',
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

        const redoMutationParams: ISetColHiddenMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetColHiddenUndoMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetColHiddenMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetColVisibleMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetColHiddenMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
