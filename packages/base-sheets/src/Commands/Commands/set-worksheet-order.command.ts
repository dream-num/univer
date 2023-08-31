import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetOrderMutationParams, SetWorksheetOrderMutation, SetWorksheetOrderMutationFactory } from '../Mutations/set-worksheet-order.mutation';

export interface SetWorksheetOrderCommandParams {
    workbookId: string;
    worksheetId: string;
    order: number;
}

export const SetWorksheetOrderCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-order',
    handler: async (accessor: IAccessor, params: SetWorksheetOrderCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: ISetWorksheetOrderMutationParams = {
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            order: params.order,
        };
        const undoMutationParams: ISetWorksheetOrderMutationParams = SetWorksheetOrderMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetOrderMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetOrderMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetOrderMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
