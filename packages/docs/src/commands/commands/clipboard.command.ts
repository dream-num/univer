import type { IMultiCommand } from '@univerjs/core';
import { CommandType, FOCUSING_DOC, FOCUSING_EDITOR } from '@univerjs/core';
import { CopyCommand, CutCommand, PasteCommand } from '@univerjs/ui';

export const DocCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'doc.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(FOCUSING_EDITOR),
    handler: async () => true,
};

export const DocCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'doc.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(FOCUSING_EDITOR),
    handler: async () => true,
};

export const DocPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    name: 'doc.command.paste',
    type: CommandType.COMMAND,
    multi: true,
    priority: 999,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(FOCUSING_EDITOR),
    handler: async () => true,
};
