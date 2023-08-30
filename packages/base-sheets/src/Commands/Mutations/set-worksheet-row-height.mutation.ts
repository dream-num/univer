import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowHeightMutationParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowHeight: number[];
}

export const SetWorksheetRowHeightMutationFactory = (accessor: IAccessor, params: ISetWorksheetRowHeightMutationParams): ISetWorksheetRowHeightMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getRowManager();
    const rowHeight = [];
    for (let i = params.rowIndex; i < params.rowIndex + params.rowHeight.length; i++) {
        const row = manager.getRowOrCreate(i);
        rowHeight[i - params.rowIndex] = row.h;
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        rowIndex: params.rowIndex,
        rowHeight: params.rowHeight,
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

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getRowManager();
        for (let i = params.rowIndex; i < params.rowIndex + params.rowHeight.length; i++) {
            const row = manager.getRowOrCreate(i);
            row.h = params.rowHeight[i - params.rowIndex];
        }
        return true;
    },
};
