import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface SetWorksheetRowHideCommandParams {}

export const SetWorksheetRowHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-hide',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHideCommandParams) => true,
};
