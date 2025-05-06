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

import type { ICommand } from '@univerjs/core';
import { CommandType, EDITOR_ACTIVATED, ICommandService, IContextService, ThemeService } from '@univerjs/core';
import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatSubscriptCommand,
    SetInlineFormatSuperscriptCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/docs-ui';
import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetTextColorCommand,
    SetUnderlineCommand,
} from '@univerjs/sheets';

/**
 * It is used to set the bold style of selections or one cell, need to distinguish between
 *  **selection state** and **edit state**. If you are in the selective state,
 *  you need to set the style on the cell and the style on the rich text(p textRuns) at the same time,
 *  and if it is only in edit state, then you only need to set the style of the rich text(p textRuns)
 */
export const SetRangeBoldCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-bold',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatBoldCommand.id);
        }

        return commandService.executeCommand(SetBoldCommand.id);
    },
};

export const SetRangeItalicCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-italic',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatItalicCommand.id);
        }

        return commandService.executeCommand(SetItalicCommand.id);
    },
};

export const SetRangeUnderlineCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-underline',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatUnderlineCommand.id);
        }

        return commandService.executeCommand(SetUnderlineCommand.id);
    },
};

export const SetRangeStrickThroughCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-stroke',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatStrikethroughCommand.id);
        }

        return commandService.executeCommand(SetStrikeThroughCommand.id);
    },
};

export const SetRangeSubscriptCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-subscript',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatSubscriptCommand.id);
        }

        return false;
    },
};

export const SetRangeSuperscriptCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-superscript',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatSuperscriptCommand.id);
        }

        return false;
    },
};

export const SetRangeFontSizeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-fontsize',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatFontSizeCommand.id, params);
        }

        return commandService.executeCommand(SetFontSizeCommand.id, params);
    },
};

export const SetRangeFontFamilyCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-font-family',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatFontFamilyCommand.id, params);
        }

        return commandService.executeCommand(SetFontFamilyCommand.id, params);
    },
};

export const SetRangeTextColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-text-color',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatTextColorCommand.id, params);
        }

        return commandService.executeCommand(SetTextColorCommand.id, params);
    },
};

export const ResetRangeTextColorCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.reset-range-text-color',
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(EDITOR_ACTIVATED);
        const themeService = accessor.get(ThemeService);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatTextColorCommand.id, { value: null });
        }

        return commandService.executeCommand(SetTextColorCommand.id, {
            value: themeService.getColorFromTheme('gray.900'),
        });
    },
};
