import { CommandType, ICommand } from '@univerjs/core';

export const CopyCommand: ICommand = {
    id: 'univer.copy-command',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const CutCommand: ICommand = {
    id: 'univer.cut-command',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const PasteCommand: ICommand = {
    id: 'univer.paste-command',
    type: CommandType.COMMAND,
    handler: async () => true,
};
