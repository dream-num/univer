import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { SetWorksheetNameCommandParams } from './set-worksheet-name.command';

export interface SetWorksheetRowShowCommandParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

export const SetWorksheetNameCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-name',
    handler: async (accessor: IAccessor, params: SetWorksheetNameCommandParams) => true,
};
