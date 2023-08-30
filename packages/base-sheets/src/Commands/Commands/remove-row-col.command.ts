import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertColMutation, InsertRowMutation } from '../Mutations/insert-row-col.mutation';
import { IRemoveColMutationFactory, IRemoveRowMutationFactory, RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface RemoveRowCommandParams {
    rowIndex: number;
    rowCount: number;
    workbookId: string;
    worksheetId: string;
}

export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    handler: async (accessor: IAccessor, params?: RemoveRowCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let redoMutationParams: IRemoveRowMutationParams;
        if (params == null) {
            const selections = selectionManager.getCurrentSelections();
            const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            if (!selections.length) {
                return false;
            }
            const range = selections[0];
            redoMutationParams = {
                workbookId: workbook.getUnitId(),
                worksheetId: workbook.getActiveSheet().getSheetId(),
                rowIndex: range.startRow,
                rowCount: range.endRow - range.startRow,
            };
        } else {
            redoMutationParams = {
                workbookId: params.workbookId,
                worksheetId: params.worksheetId,
                rowIndex: params.rowIndex,
                rowCount: params.rowCount,
            };
        }

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
    handler: async (accessor: IAccessor, params?: RemoveColCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        let redoMutationParams: IRemoveColMutationParams;
        if (params == null) {
            const selections = selectionManager.getCurrentSelections();
            const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
            if (!selections.length) {
                return false;
            }
            const range = selections[0];
            redoMutationParams = {
                workbookId: workbook.getUnitId(),
                worksheetId: workbook.getActiveSheet().getSheetId(),
                colIndex: range.startColumn,
                colCount: range.endColumn - range.startColumn,
            };
        } else {
            redoMutationParams = {
                workbookId: params.workbookId,
                worksheetId: params.worksheetId,
                colIndex: params.colIndex,
                colCount: params.colCount,
            };
        }
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
