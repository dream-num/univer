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
    ISetRowHiddenMutationParams,
    ISetRowVisibleMutationParams,
    SetRowHiddenMutation,
    SetRowHiddenUndoMutationFactory,
    SetRowVisibleMutation,
    SetRowVisibleUndoMutationFactory,
} from '../mutations/set-row-visible.mutation';

export interface ISetSpecificRowsVisibleCommandParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetSpecificRowsVisibleCommand: ICommand<ISetSpecificRowsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-specific-row-visible',
    handler: async (accessor: IAccessor, params: ISetSpecificRowsVisibleCommandParams) => {
        const { workbookId, worksheetId, ranges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const redoMutationParams: ISetRowVisibleMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };

        const undoMutationParams = SetRowVisibleUndoMutationFactory(accessor, redoMutationParams);
        const result = await commandService.executeCommand(SetRowVisibleMutation.id, redoMutationParams);

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

export const SetSelectedRowsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-rows-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);
        if (!ranges?.length) {
            return false;
        }

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

export const SetRowHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-row-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.ROW);
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
        const result = await commandService.executeCommand(SetRowHiddenMutation.id, redoMutationParams);
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
