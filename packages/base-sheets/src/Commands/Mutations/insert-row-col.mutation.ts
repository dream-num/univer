import { CommandType, ICurrentUniverService, IMutation, ObjectArray, ObjectMatrix } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';

export const InsertRowMutationFactory = (accessor: IAccessor, params: IInsertRowMutationParams): IRemoveRowMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        rowIndex: params.rowIndex,
        rowCount: params.rowCount,
    };
};

export const InsertRowMutation: IMutation<IInsertRowMutationParams> = {
    id: 'sheet.mutation.insert-row',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
        const manager = worksheet!.getRowManager();
        const rowPrimitive = manager.getRowData().toJSON();
        const rowWrapper = new ObjectArray(rowPrimitive);
        rowWrapper.inserts(params.rowIndex, new ObjectArray(params.rowCount));

        const cellPrimitive = worksheet!.getCellMatrix().toJSON();
        const cellWrapper = new ObjectMatrix(cellPrimitive);
        cellWrapper.insertRows(params.rowIndex, new ObjectMatrix(params.insertRowData));
        return true;
    },
};

export const InsertColMutationFactory = (accessor: IAccessor, params: IInsertColMutationParams): IRemoveColMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        colIndex: params.colIndex,
        colCount: params.colCount,
    };
};

export const InsertColMutation: IMutation<IInsertColMutationParams> = {
    id: 'sheet.mutation.insert-col',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
        const manager = worksheet!.getColumnManager();
        const columnPrimitive = manager.getColumnData().toJSON();
        const columnWrapper = new ObjectArray(columnPrimitive);
        columnWrapper.inserts(params.colIndex, new ObjectArray(params.colCount));

        const cellPrimitive = worksheet!.getCellMatrix().toJSON();
        const cellWrapper = new ObjectMatrix(cellPrimitive);
        cellWrapper.insertColumns(params.colIndex, new ObjectMatrix(params.insertColData));
        return true;
    },
};
