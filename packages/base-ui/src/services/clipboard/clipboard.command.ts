import { CommandType, IMultiCommand } from '@univerjs/core';

const CopyCommandName = 'univer.command.copy';
export const CopyCommand: IMultiCommand = {
    id: CopyCommandName,
    name: CopyCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: async () => true,
};

const CutCommandName = 'univer.command.cut';
export const CutCommand: IMultiCommand = {
    id: CutCommandName,
    name: CutCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: async () => true,
};

const PasteCommandName = 'univer.command.paste';
export const PasteCommand: IMultiCommand = {
    id: PasteCommandName,
    name: PasteCommandName,
    multi: true,
    priority: 0,
    type: CommandType.COMMAND,
    preconditions: () => false,
    handler: async () => true,
};
