import {
    SetInlineFormatBoldCommand,
    SetInlineFormatFontFamilyCommand,
    SetInlineFormatFontSizeCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatTextColorCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/base-docs';
import {
    SetBoldCommand,
    SetFontFamilyCommand,
    SetFontSizeCommand,
    SetItalicCommand,
    SetStrikeThroughCommand,
    SetTextColorCommand,
    SetUnderlineCommand,
} from '@univerjs/base-sheets';
import { CommandType, FOCUSING_EDITOR, ICommand, ICommandService, IContextService } from '@univerjs/core';

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatStrikethroughCommand.id);
        }

        return commandService.executeCommand(SetStrikeThroughCommand.id);
    },
};

export const SetRangeFontSizeCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-fontsize',
    handler: async (accessor, params) => {
        const commandService = accessor.get(ICommandService);
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

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
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

        if (isCellEditorFocus) {
            return commandService.executeCommand(SetInlineFormatTextColorCommand.id, params);
        }

        return commandService.executeCommand(SetTextColorCommand.id, params);
    },
};
