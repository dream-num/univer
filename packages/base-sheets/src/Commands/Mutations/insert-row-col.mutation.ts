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
        ranges: params.ranges,
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

        if (worksheet == null) {
            throw new Error('worksheet is null error!');
        }

        const manager = worksheet.getRowManager();
        const rowPrimitive = manager.getRowData().toJSON();
        const rowWrapper = new ObjectArray(rowPrimitive);
        const defaultRowHeight = worksheet.getConfig().defaultRowHeight;

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            const rowIndex = range.startRow;
            const rowCount = range.endRow - range.startRow + 1;

            if (params.rowInfo) {
                for (let j = rowIndex; j < rowIndex + rowCount; j++) {
                    const defaultRowInfo = {
                        h: defaultRowHeight,
                        hd: 0,
                    };
                    rowWrapper.insert(j, params.rowInfo.get(j) ?? defaultRowInfo);
                }
            } else {
                rowWrapper.inserts(rowIndex, new ObjectArray(rowCount));
            }

            const cellPrimitive = worksheet!.getCellMatrix().toJSON();
            const cellWrapper = new ObjectMatrix(cellPrimitive);
            cellWrapper.insertRowCount(rowIndex, rowCount);
        }

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
        ranges: params.ranges,
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
        if (!worksheet) return false;
        const manager = worksheet.getColumnManager();
        const columnPrimitive = manager.getColumnData().toJSON();
        const columnWrapper = new ObjectArray(columnPrimitive);

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            const colIndex = range.startColumn;
            const colCount = range.endColumn - range.startColumn + 1;
            const defaultColWidth = worksheet.getConfig().defaultColumnWidth;

            if (params.colInfo) {
                for (let j = colIndex; j < colIndex + colCount; j++) {
                    const defaultColInfo = {
                        w: defaultColWidth,
                        hd: 0,
                    };
                    columnWrapper.insert(j, params.colInfo.get(j) ?? defaultColInfo);
                }
            } else {
                columnWrapper.inserts(colIndex, new ObjectArray(colCount));
            }

            const cellPrimitive = worksheet!.getCellMatrix().toJSON();
            const cellWrapper = new ObjectMatrix(cellPrimitive);
            cellWrapper.insertColumnCount(colIndex, colCount);
        }

        return true;
    },
};
