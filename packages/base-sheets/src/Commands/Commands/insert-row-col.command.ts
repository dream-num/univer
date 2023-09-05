import { CommandType, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { ISelectionManager } from '../../Services/tokens';
import { InsertColMutation, InsertColMutationFactory, InsertRowMutation, InsertRowMutationFactory } from '../Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';

export interface InsertRowCommandParams {
    rowCount: number;
}

export interface InsertRowCommandBaseParams {
    workbookId: string;
    worksheetId: string;
    rowCount: number;
    rowIndex: number;
}

export const InsertRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row',
    handler: async (accessor: IAccessor, params: InsertRowCommandBaseParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: IInsertRowMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [
                {
                    startRow: params.rowIndex,
                    endRow: params.rowIndex + params.rowCount - 1,
                    startColumn: 0,
                    endColumn: 0,
                },
            ],
        };
        const undoMutationParams: IRemoveRowMutationParams = InsertRowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(InsertRowMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveRowMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertRowMutation.id, redoMutationParams);
                },
            });
            return true;
        }
        return false;
    },
};

export const InsertRowBeforeCommand: ICommand<InsertRowCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-before',
    handler: async (accessor: IAccessor, params?: InsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endRow - range.startRow + 1;
        if (params) {
            count = params.rowCount;
        }

        const insertRowParams: InsertRowCommandBaseParams = {
            workbookId,
            worksheetId,
            rowCount: count,
            rowIndex: range.startRow,
        };

        return commandService.executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export const InsertRowAfterCommand: ICommand<InsertRowCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-row-after',
    handler: async (accessor: IAccessor, params: InsertRowCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endRow - range.startRow + 1;
        if (params) {
            count = params.rowCount;
        }

        const insertRowParams: InsertRowCommandBaseParams = {
            workbookId,
            worksheetId,
            rowCount: count,
            rowIndex: range.endRow + 1,
        };

        return commandService.executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface InsertColCommandParams {
    colCount: number;
}

export interface InsertColCommandBaseParams {
    colIndex: number;
    colCount: number;
    workbookId: string;
    worksheetId: string;
}

export const InsertColCommand: ICommand<InsertColCommandBaseParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col',
    handler: async (accessor: IAccessor, params: InsertColCommandBaseParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbook = currentUniverService.getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: IInsertColMutationParams = {
            workbookId: params.workbookId,
            worksheetId: params.worksheetId,
            ranges: [
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn: params.colIndex,
                    endColumn: params.colIndex + params.colCount - 1,
                },
            ],
        };
        const undoMutationParams: IRemoveColMutationParams = InsertColMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(InsertColMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveColMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertColMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return false;
    },
};

export const InsertColBeforeCommand: ICommand<InsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-before',
    handler: async (accessor: IAccessor, params?: InsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endColumn - range.startColumn + 1;
        if (params) {
            count = params.colCount;
        }

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            colCount: count,
            colIndex: range.startColumn,
        };
        return commandService.executeCommand(InsertColCommand.id, insertColParams);
    },
};

export const InsertColAfterCommand: ICommand<InsertColCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-col-after',
    handler: async (accessor: IAccessor, params?: InsertColCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();
        if (selections && selections.length === 1) {
            range = selections[0];
        } else {
            return false;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        let count = range.endColumn - range.startColumn + 1;
        if (params) {
            count = params.colCount;
        }

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            colCount: count,
            colIndex: range.endColumn + 1,
        };
        return commandService.executeCommand(InsertColCommand.id, insertColParams);
    },
};
