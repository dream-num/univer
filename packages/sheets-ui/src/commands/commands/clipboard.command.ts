/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, ICommand, IMultiCommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import { CopyCommand, CutCommand, IClipboardInterfaceService, PasteCommand, SheetPasteShortKeyCommandName } from '@univerjs/ui';

import { whenSheetFocused } from '../../controllers/shortcuts/utils';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';

const SHEET_CLIPBOARD_PRIORITY = 998;

export const SheetCopyCommand: IMultiCommand = {
    id: CopyCommand.id,
    name: 'sheet.command.copy',
    type: CommandType.COMMAND,
    multi: true,
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
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
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
    handler: async (accessor) => {
        const sheetClipboardService = accessor.get(ISheetClipboardService);
        return sheetClipboardService.cut();
    },
};

export interface ISheetPasteParams {
    value: string;
}

export interface ISheetPasteByShortKeyParams {
    htmlContent?: string;
    textContent?: string;
    files?: File[];
}

export const SheetPasteCommand: IMultiCommand = {
    id: PasteCommand.id,
    type: CommandType.COMMAND,
    multi: true,
    name: 'sheet.command.paste',
    priority: SHEET_CLIPBOARD_PRIORITY,
    preconditions: whenSheetFocused,
    handler: async (accessor: IAccessor, params: ISheetPasteParams) => {
        // const messageService = accessor.get(IMessageService);

        // TODO: @yuhongz: check if there is excel content in the clipboard, if so
        // ask users to use shortcuts instead.

        const clipboardInterfaceService = accessor.get(IClipboardInterfaceService);
        const clipboardItems = await clipboardInterfaceService.read();
        const sheetClipboardService = accessor.get(ISheetClipboardService);

        if (clipboardItems.length !== 0) {
            return sheetClipboardService.paste(clipboardItems[0], params?.value);
        }

        return false;
    },
};

export const SheetPasteShortKeyCommand: ICommand = {
    id: SheetPasteShortKeyCommandName,
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISheetPasteByShortKeyParams) => {
        const clipboardService = accessor.get(ISheetClipboardService);
        const { htmlContent, textContent, files } = params;
        clipboardService.legacyPaste(htmlContent, textContent, files);

        return true;
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

export const SheetOptionalPasteCommand: ICommand = {
    id: 'sheet.command.optional-paste',
    type: CommandType.COMMAND,
    handler: async (accessor, { type }: { type: keyof typeof PREDEFINED_HOOK_NAME }) => {
        const clipboardService = accessor.get(ISheetClipboardService);

        return clipboardService.rePasteWithPasteType(type);
    },
};
