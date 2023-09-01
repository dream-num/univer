import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColumnHideMutationParams {
    workbookId: string;
    worksheetId: string;
    columnIndex: number;
    columnCount: number;
}

export const SetWorksheetColumnHideMutationFactory = (accessor: IAccessor, params: ISetWorksheetColumnHideMutationParams) => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        columnIndex: params.columnIndex,
        columnCount: params.columnCount,
    };
};

export const SetWorksheetColumnHideMutation: IMutation<ISetWorksheetColumnHideMutationParams> = {
    id: 'sheet.mutation.set-worksheet-column-hide',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getColumnManager();
        for (let i = params.columnIndex; i < params.columnIndex + params.columnCount; i++) {
            const column = manager.getColumnOrCreate(i);
            if (column != null) {
                column.hd = 1;
            }
        }
        return true;
    },
};
