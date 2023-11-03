import { CommandType, ICommand, ICommandInfo, ICommandService, IUndoRedoService } from '@univerjs/core';

import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

export const SetInlineFormatBoldCommand: ICommand = {
    id: 'doc.command.set-inline-format-bold',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatItalicCommand: ICommand = {
    id: 'doc.command.set-inline-format-italic',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatUnderlineCommand: ICommand = {
    id: 'doc.command.set-inline-format-underline',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatStrikethroughCommand: ICommand = {
    id: 'doc.command.set-inline-format-strikethrough',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatFontSizeCommand: ICommand = {
    id: 'doc.command.set-inline-format-fontsize',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatFontFamilyCommand: ICommand = {
    id: 'doc.command.set-inline-format-font-family',
    type: CommandType.COMMAND,
    handler: async () => true,
};

export const SetInlineFormatCommand: ICommand = {
    id: 'doc.command.set-inline-format',
    type: CommandType.COMMAND,
    handler: async (
        accessor,
        params: {
            unitId: string;
            doMutation: ICommandInfo<IRichTextEditingMutationParams>;
        }
    ) => {
        const { unitId, doMutation } = params;
        const undoRedoService = accessor.get(IUndoRedoService);
        const commandService = accessor.get(ICommandService);

        const result = commandService.syncExecuteCommand<
            IRichTextEditingMutationParams,
            IRichTextEditingMutationParams
        >(doMutation.id, doMutation.params);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: unitId,
                undo() {
                    return commandService.syncExecuteCommand(RichTextEditingMutation.id, result);
                },
                redo() {
                    return commandService.syncExecuteCommand(doMutation.id, doMutation.params);
                },
            });

            return true;
        }

        return false;
    },
};
