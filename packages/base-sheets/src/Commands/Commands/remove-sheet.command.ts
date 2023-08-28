import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from '../Mutations/remove-sheet.mutation';
import { InsertSheetMutation } from '../Mutations/insert-sheet.mutation';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

export interface RemoveSheetCommandParams {
    workbookId: string;
    sheetId: string;
}

/**
 * The command to insert new worksheet
 */
export const RemoveSheetCommand: ICommand = {
    id: 'sheet.command.remove-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: RemoveSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { sheetId, workbookId } = params;
        // prepare do mutations
        const RemoveSheetMutationParams: IRemoveSheetMutationParams = {
            sheetId,
            workbookId,
        };
        const InsertSheetMutationParams: IInsertSheetMutationParams = RemoveSheetUndoMutationFactory(accessor, RemoveSheetMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(RemoveSheetMutation.id, RemoveSheetMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(InsertSheetMutation.id, InsertSheetMutationParams);
                },
                redo() {
                    return commandService.executeCommand(RemoveSheetMutation.id, RemoveSheetMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
