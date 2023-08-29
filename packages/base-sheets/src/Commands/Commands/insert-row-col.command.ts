import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface InsertRowCommandParams {
    rowIndex: number;
    rowCount: number;
    workbookId: string;
    worksheetId: string;
}

export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',

    handler: async (accessor: IAccessor, params: InsertRowCommandParams) => true,
};

export interface InsertColCommandParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
}

export const InsertColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',

    handler: async (accessor, params) => true,
};
