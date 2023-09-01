import { BooleanNumber, CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetHideGridlinesMutationParams, SetHideGridlinesMutation, SetHideGridlinesUndoMutationFactory } from '../Mutations/set-hide-gridlines.mutatiom';

export interface ISetHideGridlinesCommandParams {
    hideGridlines?: BooleanNumber;
    workbookId?: string;
    worksheetId?: string;
}

export const SetHideGridlinesCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-hide-gridlines',

    handler: async (accessor: IAccessor, params: ISetHideGridlinesCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const hideGridlines = params.hideGridlines ?? 0;

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setHideGridlinesMutationParams: ISetHideGridlinesMutationParams = {
            hideGridlines,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetHideGridlinesUndoMutationFactory(accessor, setHideGridlinesMutationParams);
        const result = commandService.executeCommand(SetHideGridlinesMutation.id, setHideGridlinesMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetHideGridlinesMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetHideGridlinesMutation.id, setHideGridlinesMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
