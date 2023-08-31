import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetNameMutationParams {
    name: string;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetNameMutationFactory = (accessor: IAccessor, params: ISetWorksheetNameMutationParams): ISetWorksheetNameMutationParams => {
    const universheet = accessor.get(ICurrentUniverService).getCurrentUniverSheetInstance();
    const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    return {
        workbookId: params.workbookId,
        name: worksheet.getName(),
        worksheetId: worksheet.getSheetId(),
    };
};

export const SetWorksheetNameMutation: IMutation<ISetWorksheetNameMutationParams> = {
    id: 'sheet.mutation.set-worksheet-name',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const universheet = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            return false;
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);

        if (!worksheet) {
            return false;
        }

        worksheet.setName(params.name);
        return true;
    },
};
