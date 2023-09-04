import { CommandType, ICellData, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService, ObjectMatrix } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertColMutation, InsertColMutationFactory, InsertRowMutation, InsertRowMutationFactory } from '../Mutations/insert-row-col.mutation';
import { RemoveColMutation, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface InsertRowCommandParams {
    workbookId?: string;
    worksheetId?: string;
    range?: IRangeData;
}

export interface InsertRowCommandBaseParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

const InsertRowCommand: ICommand = {
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
            rowIndex: params.rowIndex,
            rowCount: params.rowCount,
            insertRowData: ObjectMatrix.MakeObjectMatrixSize<ICellData>(params.rowCount).toJSON(),
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

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.range) {
                range = params.range;
            } else {
                if (selections && selections.length === 1) {
                    range = selections[0];
                } else {
                    return false;
                }
            }
        } else {
            if (selections && selections.length === 1) {
                range = selections[0];
            } else {
                return false;
            }
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const insertRowParams: InsertRowCommandBaseParams = {
            workbookId,
            worksheetId,
            rowCount: range.endRow - range.startRow + 1,
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

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.range) {
                range = params.range;
            } else {
                if (selections && selections.length === 1) {
                    range = selections[0];
                } else {
                    return false;
                }
            }
        } else {
            if (selections && selections.length === 1) {
                range = selections[0];
            } else {
                return false;
            }
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const insertRowParams: InsertRowCommandBaseParams = {
            workbookId,
            worksheetId,
            rowCount: range.endRow - range.startRow + 1,
            rowIndex: range.endRow + 1,
        };

        return commandService.executeCommand(InsertRowCommand.id, insertRowParams);
    },
};

export interface InsertColCommandParams {
    workbookId?: string;
    worksheetId?: string;
    range?: IRangeData;
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

        const { colIndex, colCount, workbookId, worksheetId } = params;

        const columnData = new ObjectMatrix<ICellData>();
        worksheet.getCellMatrix().forEach((index) => {
            for (let i = colIndex; i < colIndex + colCount; i++) {
                columnData.setValue(index, i - colIndex, {});
            }
        });

        const redoMutationParams: IInsertColMutationParams = {
            workbookId,
            worksheetId,
            colIndex,
            colCount,
            insertColData: columnData.getData(),
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

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.range) {
                range = params.range;
            } else {
                if (selections && selections.length === 1) {
                    range = selections[0];
                } else {
                    return false;
                }
            }
        } else {
            if (selections && selections.length === 1) {
                range = selections[0];
            } else {
                return false;
            }
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            colCount: range.endColumn - range.startColumn + 1,
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

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        let range: IRangeData;
        const selections = selectionManager.getCurrentSelections();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
            if (params.range) {
                range = params.range;
            } else {
                if (selections && selections.length === 1) {
                    range = selections[0];
                } else {
                    return false;
                }
            }
        } else {
            if (selections && selections.length === 1) {
                range = selections[0];
            } else {
                return false;
            }
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const insertColParams: InsertColCommandBaseParams = {
            workbookId,
            worksheetId,
            colCount: range.endColumn - range.startColumn + 1,
            colIndex: range.endColumn + 1,
        };
        return commandService.executeCommand(InsertColCommand.id, insertColParams);
    },
};
