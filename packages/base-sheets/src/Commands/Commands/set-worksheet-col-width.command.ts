import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface SetWorksheetColWidthCommandParams {}

export const SetWorksheetColWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-col-width',
    handler: async (accessor: IAccessor, params: SetWorksheetColWidthCommandParams) => true,
};
