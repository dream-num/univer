import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColumnShowMutationParams {
    workbookId: string;
    worksheetId: string;
    columnIndex: number;
    columnCount: number;
}

export const SetWorksheetColumnShowMutationFactory = (accessor: IAccessor, params: ISetWorksheetColumnShowMutationParams) => {
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

export const SetWorksheetColumnShowMutation: IMutation<ISetWorksheetColumnShowMutationParams> = {
    id: 'sheet.mutation.set-worksheet-column-show',
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
                column.hd = 0;
            }
        }
        return true;
    },
};
