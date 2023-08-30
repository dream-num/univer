import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowHideMutationParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
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
        rowIndex: params.rowIndex,
        rowCount: params.rowCount,
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
        for (let i = params.rowIndex; i < params.rowIndex + params.rowCount; i++) {
            const row = manager.getRowOrCreate(i);
            if (row != null) {
                row.hd = 1;
            }
        }
        return true;
    },
};
