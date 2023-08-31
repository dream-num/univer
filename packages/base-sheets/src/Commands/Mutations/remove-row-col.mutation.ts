import { CommandType, ICurrentUniverService, IMutation, ObjectArray, ObjectMatrix } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertColMutationParams, IInsertRowMutationParams, IRemoveColMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';

export const RemoveRowMutationFactory = (accessor: IAccessor, params: IRemoveRowMutationParams): IInsertRowMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const rowPrimitive = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getCellMatrix().toJSON();
    const rowWrapper = new ObjectMatrix(rowPrimitive);
    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        rowIndex: params.rowIndex,
        rowCount: params.rowCount,
        insertRowData: rowWrapper.sliceRows(params.rowIndex, params.rowCount).toJSON(),
    };
};

export const RemoveRowMutation: IMutation<IRemoveRowMutationParams> = {
    id: 'sheet.mutation.remove-row',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getRowManager();
        const rowPrimitive = manager.getRowData().toJSON();
        const rowWrapper = new ObjectArray(rowPrimitive);
        rowWrapper.splice(params.rowIndex, params.rowCount);

        const cellPrimitive = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getCellMatrix().toJSON();
        const wrapper = new ObjectMatrix(cellPrimitive);
        wrapper.spliceRows(params.rowIndex, params.rowCount);
        return true;
    },
};

export const IRemoveColMutationFactory = (accessor: IAccessor, params: IRemoveColMutationParams): IInsertColMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
    const cellPrimitive = worksheet!.getCellMatrix().toJSON();
    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        colIndex: params.colIndex,
        colCount: params.colCount,
        insertColData: new ObjectMatrix(cellPrimitive).sliceColumns(params.colIndex, params.colCount).toJSON(),
    };
};

export const RemoveColMutation: IMutation<IRemoveColMutationParams> = {
    id: 'sheet.mutation.remove-col',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getColumnManager();
        const columnPrimitive = manager.getColumnData().toJSON();
        const columnWrapper = new ObjectArray(columnPrimitive);
        const start = params.colIndex;
        const end = params.colIndex + params.colCount;
        for (let i = start; i < end; i++) columnWrapper.splice(params.colIndex, 1);

        const cellPrimitive = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getCellMatrix().toJSON();
        const cellWrapper = new ObjectMatrix(cellPrimitive);
        cellWrapper.spliceColumns(params.colIndex, params.colCount).toJSON();
        return true;
    },
};
