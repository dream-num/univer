import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface SetWorksheetRowShowCommandParams {}

export const SetWorksheetRowShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-show',
    handler: async (accessor: IAccessor, params: SetWorksheetRowShowCommandParams) => true,
};
