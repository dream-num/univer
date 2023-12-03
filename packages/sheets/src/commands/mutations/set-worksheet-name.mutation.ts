import { CommandType, IMutation, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetNameMutationParams {
    name: string;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetNameMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetNameMutationParams
): ISetWorksheetNameMutationParams => {
    const universheet = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
    const worksheet = universheet.getSheetBySheetId(params.worksheetId);
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
    handler: (accessor, params) => {
        const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            return false;
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);

        if (!worksheet) {
            return false;
        }

        worksheet.getConfig().name = params.name;
        return true;
    },
};
