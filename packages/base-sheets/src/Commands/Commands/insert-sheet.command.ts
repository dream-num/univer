import { CommandType, ICommand, ICommandService, IUndoRedoService, IWorksheetConfig } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../Mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../Mutations/remove-sheet.mutation';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

export interface InsertSheetCommandParams {
    workbookId: string;
    index: number;
    sheet: IWorksheetConfig;
}

/**
 * The command to insert new worksheet
 */
export const InsertSheetCommand: ICommand = {
    id: 'sheet.command.insert-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: InsertSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { index, sheet, workbookId } = params;
        // prepare do mutations
        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index,
            sheet,
            workbookId,
        };
        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(accessor, insertSheetMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveSheetMutation.id, removeSheetMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
