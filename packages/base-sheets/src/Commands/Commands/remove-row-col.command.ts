import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface RemoveRowCommandParams {
    rowIndex: number;
    rowCount: number;
    workbookId: string;
    worksheetId: string;
}

export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    handler: async (accessor: IAccessor, params: RemoveRowCommandParams) => true,
};

export interface RemoveColCommandParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
}

export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col',
    handler: async (accessor: IAccessor, params: RemoveColCommandParams) => true,
};
