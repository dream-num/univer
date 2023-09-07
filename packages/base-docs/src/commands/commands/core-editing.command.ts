import { CommandType, ICommand } from '@univerjs/core';

import { InputController } from '../../Controller/InputController';

export const DeleteLeftCommand: ICommand = {
    id: 'doc.command.delete-left',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const inputController = accessor.get(InputController);
        inputController.deleteLeft();
        return true;
    },
};

export const BreakLineCommand: ICommand = {
    id: 'doc.command.break-line',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const inputController = accessor.get(InputController);
        inputController.breakLine();
        return true;
    },
};
