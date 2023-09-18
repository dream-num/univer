import { CommandType, IMultiCommand } from '@univerjs/core';

export const CopyCommand: IMultiCommand = {
    id: 'univer.copy-command',
    name: 'univer.copy-command',
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const CutCommand: IMultiCommand = {
    id: 'univer.cut-command',
    name: 'univer.cut-command',
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const PasteCommand: IMultiCommand = {
    id: 'univer.paste-command',
    name: 'univer.paste-command',
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    handler: async () => true,
};
