import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetActivateMutationParams } from '../mutations/set-worksheet-activate.mutation';
import { SetWorksheetActivateMutation } from '../mutations/set-worksheet-activate.mutation';

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

        return commandService.syncExecuteCommand(SetWorksheetActivateMutation.id, redoMutationParams);
    },
};
