import { CommandType, ICurrentUniverService, IMutation, IRangeData } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowHideMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRangeData[];
}

export const SetWorksheetRowHideMutationFactory = (accessor: IAccessor, params: ISetWorksheetRowHideMutationParams) => {
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

export const SetWorksheetRowHideMutation: IMutation<ISetWorksheetRowHideMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-hide',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getRowManager();

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);
                if (row != null) {
                    row.hd = 1;
                }
            }
        }

        return true;
    },
};
