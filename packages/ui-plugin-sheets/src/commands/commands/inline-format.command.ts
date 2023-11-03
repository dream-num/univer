import {
    SetInlineFormatBoldCommand,
    SetInlineFormatItalicCommand,
    SetInlineFormatStrikethroughCommand,
    SetInlineFormatUnderlineCommand,
} from '@univerjs/base-docs';
import { SetBoldCommand, SetItalicCommand, SetStrikeThroughCommand, SetUnderlineCommand } from '@univerjs/base-sheets';
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
