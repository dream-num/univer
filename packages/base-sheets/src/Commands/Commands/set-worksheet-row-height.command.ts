import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface SetWorksheetRowHeightCommandParams {}

export const SetWorksheetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-height',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHeightCommandParams) => true,
};
