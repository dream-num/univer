import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRange,
    IUndoRedoService,
    RANGE_TYPE,
} from '@univerjs/core';
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
import { ISetSpecificRowsVisibleCommandParams, SetSpecificRowsVisibleCommand } from './set-row-visible.command';

export interface ISetSpecificColsVisibleCommandParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetSpecificColsVisibleCommand: ICommand<ISetSpecificColsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible-on-cols',
    handler: async (accessor, params: ISetSpecificColsVisibleCommandParams) => {
        const { workbookId, worksheetId, ranges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const redoMutationParams: ISetColVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };

        const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
        const result = await commandService.executeCommand(SetColVisibleMutation.id, redoMutationParams);

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
        return true;
    },
};

export const SetSelectedColsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-cols-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
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

        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand<ISetSpecificRowsVisibleCommandParams>(SetSpecificRowsVisibleCommand.id, {
            workbookId,
            worksheetId,
            ranges,
        });
    },
};

export const SetColHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
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
