import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRowShowMutationParams {
    workbookId: string;
    worksheetId: string;
    rowIndex: number;
    rowCount: number;
}

export const SetWorksheetRowShowMutationFactory = (accessor: IAccessor, params: ISetWorksheetRowShowMutationParams) => {
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

export const SetWorksheetRowShowMutation: IMutation<ISetWorksheetRowShowMutationParams> = {
    id: 'sheet.mutation.set-worksheet-row-show',
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
                row.hd = 0;
            }
        }
        return true;
    },
};
