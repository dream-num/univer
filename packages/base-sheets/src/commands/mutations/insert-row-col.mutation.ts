import { CommandType, ICurrentUniverService, IMutation, ObjectArray, Rectangle } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../Basics/Interfaces/MutationInterface';

export const InsertRowMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertRowMutationParams
): IRemoveRowsMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges.map((r) => Rectangle.clone(r)),
    };
};

export const InsertRowMutation: IMutation<IInsertRowMutationParams> = {
    id: 'sheet.mutation.insert-row',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const { workbookId, worksheetId, ranges, rowInfo } = params;
        const currentUniverService = accessor.get(ICurrentUniverService);

        const universheet = currentUniverService.getUniverSheetInstance(workbookId);
        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(worksheetId);
        if (worksheet == null) {
            throw new Error('worksheet is null error!');
        }

        const manager = worksheet.getRowManager();
        const rowPrimitive = manager.getRowData().toJSON();
        const rowWrapper = new ObjectArray(rowPrimitive);
        const defaultRowInfo = {
            h: worksheet.getConfig().defaultRowHeight,
            hd: 0,
        };

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const rowIndex = range.startRow;
            const rowCount = range.endRow - range.startRow + 1;

            for (let j = rowIndex; j < rowIndex + rowCount; j++) {
                if (rowInfo) {
                    rowWrapper.insert(j, rowInfo.get(j - range.startRow) ?? defaultRowInfo);
                } else {
                    rowWrapper.insert(j, defaultRowInfo);
                }
            }
        }

        worksheet.setRowCount(
            worksheet.getRowCount() + ranges.reduce((acc, cur) => acc + cur.endRow - cur.startRow + 1, 0)
        );

        return true;
    },
};

export const InsertColMutationUndoFactory = (
    accessor: IAccessor,
    params: IInsertColMutationParams
): IRemoveColMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges.map((r) => Rectangle.clone(r)),
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

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const manager = worksheet.getColumnManager();
        const { ranges, colInfo } = params;
        const columnPrimitive = manager.getColumnData().toJSON();
        const columnWrapper = new ObjectArray(columnPrimitive);

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            const colIndex = range.startColumn;
            const colCount = range.endColumn - range.startColumn + 1;
            const defaultColWidth = worksheet.getConfig().defaultColumnWidth;

            for (let j = colIndex; j < colIndex + colCount; j++) {
                const defaultColInfo = {
                    w: defaultColWidth,
                    hd: 0,
                };
                if (colInfo) {
                    columnWrapper.insert(j, colInfo.get(j - range.startColumn) ?? defaultColInfo);
                } else {
                    columnWrapper.insert(j, defaultColInfo);
                }
            }
        }

        worksheet.setColumnCount(
            worksheet.getColumnCount() + ranges.reduce((acc, cur) => acc + cur.endColumn - cur.startColumn + 1, 0)
        );

        return true;
    },
};
