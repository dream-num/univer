import { CopyCommand, CutCommand, PasteCommand } from '@univerjs/base-ui';
import { CommandType, FOCUSING_DOC, IMultiCommand } from '@univerjs/core';

import { IDocClipboardService } from '../../services/clipboard/clipboard.service';

export const DocCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'doc.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async (accessor, params) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        return docClipboardService.copy();
    },
};

export const DocCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'doc.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async (accessor, params) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        return docClipboardService.cut();
    },
};

export const DocPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    name: 'doc.command.paste',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1100,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    handler: async (accessor, params) => {
        const docClipboardService = accessor.get(IDocClipboardService);
        return docClipboardService.paste();
    },
};
