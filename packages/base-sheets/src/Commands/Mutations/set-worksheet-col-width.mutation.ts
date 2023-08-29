import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColWidthMutationParams {
    workbookId: string;
    worksheetId: string;
    colIndex: number;
    colWidth: number[];
}

export const SetWorksheetColWidthMutationFactory = (accessor: IAccessor, params: ISetWorksheetColWidthMutationParams) => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getColumnManager();
    const colWidth = [];
    for (let i = params.colIndex; i < params.colIndex + params.colWidth.length; i++) {
        const column = manager.getColumnOrCreate(i);
        colWidth[i - params.colIndex] = column.w;
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        colIndex: params.colIndex,
        colWidth: params.colWidth,
    };
};

export const SetWorksheetColWidthMutation: IMutation<ISetWorksheetColWidthMutationParams> = {
    id: 'sheet.mutation.set-worksheet-col-width',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getColumnManager();
        for (let i = params.colIndex; i < params.colIndex + params.colWidth.length; i++) {
            const column = manager.getColumnOrCreate(i);
            column.w = params.colWidth[i - params.colIndex];
        }
        return true;
    },
};
