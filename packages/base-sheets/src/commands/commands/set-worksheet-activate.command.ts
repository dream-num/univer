import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetWorksheetActivateMutationParams,
    SetWorksheetActivateMutation,
} from '../mutations/set-worksheet-activate.mutation';

export interface ISetWorksheetActivateCommandParams {
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetActivateCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-activate',

    handler: async (accessor: IAccessor, params?: ISetWorksheetActivateCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        let workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
        }

        const redoMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId,
        };
        // const undoMutationParams = SetWorksheetUnActivateMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetActivateMutation.id, redoMutationParams);

        // no need
        // if (result) {
        //     undoRedoService.pushUndoRedo({
        //         URI: workbookId,
        //         undo() {
        //             return commandService.executeCommand(SetWorksheetActivateMutation.id, undoMutationParams);
        //         },
        //         redo() {
        //             return commandService.executeCommand(SetWorksheetActivateMutation.id, redoMutationParams);
        //         },
        //     });
        //     return true;
        // }
        return true;
    },
};
