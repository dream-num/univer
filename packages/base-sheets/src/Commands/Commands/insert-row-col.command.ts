import { CommandType, ICellData, ICommand, ICommandService, IUndoRedoService, ObjectMatrixPrimitiveType } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertColMutation, InsertColMutationFactory, InsertRowMutation, InsertRowMutationFactory } from '../Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';

export interface InsertRowCommandParams {
    rowIndex: number;
    rowCount: number;
    workbookId: string;
    worksheetId: string;
    insertRowData: ObjectMatrixPrimitiveType<ICellData>;
}

export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',

    handler: async (accessor: IAccessor, params: InsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const insertRowMutationParams: IInsertRowMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            rowIndex: params.rowIndex,
            rowCount: params.rowCount,
            insertRowData: params.insertRowData,
        };
        const undoClearMutationParams: IRemoveRowMutationParams = InsertRowMutationFactory(accessor, insertRowMutationParams);
        const result = commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveRowMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);
                },
            });
            return true;
        }
        return true;
    },
};

export interface InsertColCommandParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
    insertColData: ObjectMatrixPrimitiveType<ICellData>;
}

export const InsertColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',

    handler: async (accessor: IAccessor, params: InsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const insertColMutationParams: IInsertColMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            colIndex: params.colIndex,
            colCount: params.colCount,
            insertColData: params.insertColData,
        };
        const undoClearMutationParams: IRemoveColMutationParams = InsertColMutationFactory(accessor, insertColMutationParams);
        const result = commandService.executeCommand(InsertRowMutation.id, insertColMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveColMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertColMutation.id, insertColMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
