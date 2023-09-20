import { CommandType, ICurrentUniverService, IMutation, ISelectionRange, ObjectArray } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: ISelectionRange[];
    rowHeight: number | ObjectArray<number>;
}

export const SetWorksheetRowHeightMutationFactory = (accessor: IAccessor, params: ISetWorksheetRowHeightMutationParams): ISetWorksheetRowHeightMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
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
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
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
