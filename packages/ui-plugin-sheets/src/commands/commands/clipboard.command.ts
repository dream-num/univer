import { CopyCommand, CutCommand, PasteCommand } from '@univerjs/base-ui';
import { CommandType, FOCUSING_SHEET, IContextService, IMultiCommand } from '@univerjs/core';

import { ISheetClipboardService } from '../../services/clipboard/clipboard.service';
import { FOCUSING_SHEET_EDITOR } from '../../services/context/context';

export const SheetCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'sheet.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1000,
    preconditions: (contextService: IContextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_SHEET_EDITOR),
    handler: async (accessor, params) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);

        // TODO: permission control here?

        return sheetClipboardService.copy();
    },
};

export const SheetCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'sheet.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1000,
    preconditions: (contextService: IContextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_SHEET_EDITOR),
    handler: async (accessor, params) =>
        // TODO@wzhudev: the same as SheetCopyCommand but we should dispatch a delete command as well
        true,
};

export const SheetPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.paste',
    priority: 1000,
    preconditions: (contextService: IContextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(FOCUSING_SHEET_EDITOR),
    handler: async (accessor, params) => true,
};
