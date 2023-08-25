import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface InsertRowCommandParams {
    worksheetId: string;
    workbookId: string;
    fromIndex?: number;
    count?: number;
}

/**
 * The command to insert a row into a worksheet.
 */
export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',

    handler: async (accessor: IAccessor, params: InsertRowCommandParams) => {
        // all subsequent mutations should succeed inorder to make the whole process succeed
        return Promise.all([]).then(() => true);
    },
};

export const InsertColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',

    handler: async (accessor, params) => {
        return true;
    },
};