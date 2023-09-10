import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISetWorksheetNameMutationParams, SetWorksheetNameMutation, SetWorksheetNameMutationFactory } from '../Mutations/set-worksheet-name.mutation';

export interface SetWorksheetNameCommandParams {
    name: string;
    worksheetId?: string;
    workbookId?: string;
}

/**
 * The command to set the sheet name.
 */
export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',

    handler: async (accessor: IAccessor, params: SetWorksheetNameCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();

        const redoMutationParams: ISetWorksheetNameMutationParams = {
            worksheetId,
            name: params.name,
            workbookId,
        };
        const undoMutationParams: ISetWorksheetNameMutationParams = SetWorksheetNameMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetNameMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetNameMutation.id, redoMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
