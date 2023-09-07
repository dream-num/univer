import { CommandType, ICommand } from '@univerjs/core';

export const InsertCommand: ICommand = {
    id: 'doc.command.insert',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        // TODO
        const a = 0;
        return true;
    },
};
