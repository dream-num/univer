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

export interface ISetColVisibleOnColsParams {
    col: number;
}

export const SetColVisibleOnCols: ICommand<ISetColVisibleOnColsParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible-on-cols',
    handler: async (accessor: IAccessor, params) => true,
};

export const SetColVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService.getSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const redoMutationParams: ISetColVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges, // TODO@wzhudev: only cols those are already hidden should be set to visible
        };

        const commandService = accessor.get(ICommandService);
        const result = await commandService.executeCommand(SetColVisibleMutation.id, redoMutationParams);

        if (result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
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
        const ranges = selectionManagerService.getSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }

        const currentUniverService = accessor.get(ICurrentUniverService);
        const workbook = currentUniverService.getCurrentUniverSheetInstance();
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const redoMutationParams: ISetColHiddenMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };

        const commandService = accessor.get(ICommandService);
        const result = await commandService.executeCommand(SetColHiddenMutation.id, redoMutationParams);
        if (result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            const undoMutationParams = SetColHiddenUndoMutationFactory(accessor, redoMutationParams);
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
