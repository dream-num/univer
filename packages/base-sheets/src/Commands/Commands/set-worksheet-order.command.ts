import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetOrderMutationParams, SetWorksheetOrderMutation, SetWorksheetOrderUndoMutationFactory } from '../Mutations/set-worksheet-order.mutation';

export interface ISetWorksheetOrderCommandParams {
    order: number;
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetOrderCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-order',

    handler: async (accessor: IAccessor, params: ISetWorksheetOrderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const setWorksheetOrderMutationParams: ISetWorksheetOrderMutationParams = {
            order: params.order,
            workbookId,
            worksheetId,
        };

        const undoMutationParams = SetWorksheetOrderUndoMutationFactory(accessor, setWorksheetOrderMutationParams);
        const result = commandService.executeCommand(SetWorksheetOrderMutation.id, setWorksheetOrderMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetOrderMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetOrderMutation.id, setWorksheetOrderMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
