import { CopyCommand, CutCommand, IClipboardInterfaceService, PasteCommand } from '@univerjs/base-ui';
import { CommandType, FOCUSING_DOC, ILogService, IMultiCommand } from '@univerjs/core';

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
        const logService = accessor.get(ILogService);

        // use cell editor to get ClipboardData first
        // if that doesn't work, use the browser's clipboard API
        // this clipboard API would ask user for permission, so we may need to notify user (and retry perhaps)
        logService.log('[DocPasteCommand]', 'the focusing element is', document.activeElement);

        const result = document.execCommand('paste');

        if (!result) {
            logService.log(
                '[DocPasteCommand]',
                'failed to execute paste command on the activeElement, trying to use clipboard API.'
            );

            const clipboardInterfaceService = accessor.get(IClipboardInterfaceService);
            const clipboardItems = await clipboardInterfaceService.read();
            const sheetClipboardService = accessor.get(IDocClipboardService);

            if (clipboardItems.length !== 0) {
                return sheetClipboardService.paste(clipboardItems[0]);
            }

            return false;
        }

        return false;
    },
};
