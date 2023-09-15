import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const ShowMenuListCommand: ICommand = {
    id: 'ui-sheet.command.show-menu-list',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) =>
        // TODO: directly change sheet bar visibility
        true,
};
