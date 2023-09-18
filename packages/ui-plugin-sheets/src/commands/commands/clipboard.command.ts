import { CopyCommand, CutCommand, IClipboardInterfaceService } from '@univerjs/base-ui';
import { CommandType, IMultiCommand } from '@univerjs/core';

export const SheetCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.copy',
    priority: 1000,
    preconditions: () => true,
    handler: async (accessor, params) => {
        const clipboardInterface = accessor.get(IClipboardInterfaceService);
        clipboardInterface.writeText('123');
        return true;
    },
};

export const SheetCutCommand: IMultiCommand = {
    id: CutCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.cut',
    priority: 1000,
    preconditions: () => true,
    handler: async (accessor, params) => true,
};

export const SheetPasteCommand: IMultiCommand = {
    id: CopyCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.paste',
    priority: 1000,
    preconditions: () => true,
    handler: async (accessor, params) => true,
};
