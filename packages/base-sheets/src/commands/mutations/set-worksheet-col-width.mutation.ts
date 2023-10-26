import { CommandType, IMutation, IRange, IUniverInstanceService, ObjectArray } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColWidthMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
    colWidth: number | ObjectArray<number>;
}

export const SetWorksheetColWidthMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetColWidthMutationParams
): ISetWorksheetColWidthMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('universheet is null error!');
    }
    const colWidth = new ObjectArray<number>();
    const manager = worksheet.getColumnManager();
    const ranges = params.ranges;
    for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        for (let j = range.startColumn; j < range.endColumn + 1; j++) {
            const column = manager.getColumnOrCreate(j);
            colWidth.set(j, column.w);
        }
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
        colWidth,
    };
};

export const SetWorksheetColWidthMutation: IMutation<ISetWorksheetColWidthMutationParams> = {
    id: 'sheet.mutation.set-worksheet-col-width',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) {
            return false;
        }

        const defaultColumnWidth = worksheet.getConfig().defaultColumnWidth;
        const manager = worksheet.getColumnManager();
        const ranges = params.ranges;

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            for (let j = range.startColumn; j < range.endColumn + 1; j++) {
                const column = manager.getColumnOrCreate(j);
                if (typeof params.colWidth === 'number') {
                    column.w = params.colWidth;
                } else {
                    column.w = params.colWidth.get(j - range.startColumn) ?? defaultColumnWidth;
                }
            }
        }

        return true;
    },
};
