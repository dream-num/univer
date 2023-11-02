import { CommandType, ICommand, ICommandInfo, ICommandService, IUndoRedoService } from '@univerjs/core';

import { IRichTextEditingMutationParams, RichTextEditingMutation } from '../mutations/core-editing.mutation';

export const SetInlineFormatBoldCommand: ICommand = {
    id: 'doc.command.set-inline-format-bold',
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
