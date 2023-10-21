import { IRowAutoHeightInfo } from '@univerjs/base-render';
import { CommandType, IMutation, IRange, IUniverInstanceService, ObjectArray } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    rowHeight: number | ObjectArray<number>;
}

export interface ISetWorksheetRowAutoHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    rowsAutoHeightInfo: IRowAutoHeightInfo[];
}

export const SetWorksheetRowHeightMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetRowHeightMutationParams
): ISetWorksheetRowHeightMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('universheet is null error!');
    }
    const rowHeight = new ObjectArray<number>();
    const manager = worksheet.getRowManager();
    const ranges = params.ranges;
    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        for (let j = range.startRow; j < range.endRow + 1; j++) {
            const row = manager.getRowOrCreate(j);
            rowHeight.set(j, row.h);
        }
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
        rowHeight,
    };
};

export const SetWorksheetRowHeightMutation: IMutation<ISetWorksheetRowHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-height',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;

        const defaultRowHeight = worksheet.getConfig().defaultRowHeight;
        const manager = worksheet.getRowManager();
        const ranges = params.ranges;

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);

                if (typeof params.rowHeight === 'number') {
                    row.h = params.rowHeight;
                } else {
                    row.h = params.rowHeight.get(j) ?? defaultRowHeight;
                }
            }
        }

        return true;
    },
};

export const SetWorksheetRowAutoHeightMutation: IMutation<ISetWorksheetRowAutoHeightMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-auto-height',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const { workbookId, worksheetId, rowsAutoHeightInfo } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        const worksheet = workbook?.getSheetBySheetId(worksheetId);

        if (!worksheet || !workbook) {
            return false;
        }

        const rowManager = worksheet.getRowManager();

        for (const { rowNumber, autoHeight } of rowsAutoHeightInfo) {
            const row = rowManager.getRowOrCreate(rowNumber);
            row.ah = autoHeight;
        }

        return true;
    },
};
