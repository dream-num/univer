import { CommandType, ICommand, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertColMutation, InsertRowMutation } from '../Mutations/insert-row-col.mutation';
import { IRemoveColMutationFactory, IRemoveRowMutationFactory, RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';

export interface RemoveRowCommandParams {
    rowIndex: number;
    rowCount: number;
    workbookId: string;
    worksheetId: string;
}

export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    handler: async (accessor: IAccessor, params: RemoveRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: IRemoveRowMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rowIndex: params.rowIndex,
            rowCount: params.rowCount,
        };

        const undoMutationParams: IInsertRowMutationParams = IRemoveRowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveRowMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(InsertRowMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(RemoveRowMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

export interface RemoveColCommandParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
}

export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col',
    handler: async (accessor: IAccessor, params: RemoveColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const redoMutationParams: IRemoveColMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            colIndex: params.colIndex,
            colCount: params.colCount,
        };
        const undoMutationParams: IRemoveColMutationParams = IRemoveColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(RemoveColMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(InsertColMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(RemoveColMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
