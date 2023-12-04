import type { ICommand, IMultiCommand } from '@univerjs/core';
import { CommandType, ICommandService, ILogService } from '@univerjs/core';
import { CopyCommand, CutCommand, IClipboardInterfaceService, PasteCommand } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { whenEditorNotActivated } from '../../controllers/shortcuts/utils';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';

export const SheetCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'sheet.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1000,
    preconditions: whenEditorNotActivated,
    handler: async (accessor) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.copy();
    },
};

export const SheetCutCommand: IMultiCommand = {
    id: CutCommand.id,
    name: 'sheet.command.cut',
    type: CommandType.COMMAND,
    multi: true,
    priority: 1000,
    preconditions: whenEditorNotActivated,
    handler: async (accessor) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.cut();
    },
};

export interface ISheetPasteParams {
    value: string;
}

export const SheetPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.paste',
    priority: 1000,
    preconditions: whenEditorNotActivated,
    handler: async (accessor: IAccessor, params: ISheetPasteParams) => {
        const logService = accessor.get(ILogService);

        // use cell editor to get ClipboardData first
        // if that doesn't work, use the browser's clipboard API
        // this clipboard API would ask user for permission, so we may need to notify user (and retry perhaps)
        logService.log('[SheetPasteCommand]', 'the focusing element is', document.activeElement);

        const result = document.execCommand('paste');

        if (!result) {
            logService.log(
                '[SheetPasteCommand]',
                'failed to execute paste command on the activeElement, trying to use clipboard API.'
            );

            const clipboardInterfaceService = accessor.get(IClipboardInterfaceService);
            const clipboardItems = await clipboardInterfaceService.read();
            const sheetClipboardService = accessor.get(ISheetClipboardService);

            // logService.log('[SheetPasteCommand]: clipboard data is', clipboardItems);
            if (clipboardItems.length !== 0) {
                return sheetClipboardService.paste(clipboardItems[0], params?.value);
            }

            return false;
        }

        return false;
    },
};

export const SheetPasteValueCommand: ICommand = {
    id: 'sheet.command.paste-value',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, { value: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_VALUE });
    },
};

export const SheetPasteFormatCommand: ICommand = {
    id: 'sheet.command.paste-format',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_FORMAT,
        });
    },
};

export const SheetPasteColWidthCommand: ICommand = {
    id: 'sheet.command.paste-col-width',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_COL_WIDTH,
        });
    },
};

export const SheetPasteBesidesBorderCommand: ICommand = {
    id: 'sheet.command.paste-besides-border',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: PREDEFINED_HOOK_NAME.SPECIAL_PASTE_BESIDES_BORDER,
        });
    },
};
