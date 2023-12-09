import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetWorksheetActiveOperationParams } from '../operations/set-worksheet-active.operation';
import { SetWorksheetActiveOperation } from '../operations/set-worksheet-active.operation';

export interface ISetWorksheetActivateCommandParams {
    workbookId?: string;
    worksheetId?: string;
}

export const SetWorksheetActivateCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-activate',

    handler: async (accessor: IAccessor, params?: ISetWorksheetActivateCommandParams) => {
        const commandService = accessor.get(ICommandService);
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

        const redoMutationParams: ISetWorksheetActiveOperationParams = {
            workbookId,
            worksheetId,
        };

        return commandService.syncExecuteCommand(SetWorksheetActiveOperation.id, redoMutationParams);
    },
};
