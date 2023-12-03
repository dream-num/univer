import type { BooleanNumber, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetHideMutationParams {
    hidden: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetHideMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetHideMutationParams
): ISetWorksheetHideMutationParams => {
    const universheet = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
    const worksheet = universheet.getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    return {
        hidden: worksheet.isSheetHidden(),
        workbookId: params.workbookId,
        worksheetId: worksheet.getSheetId(),
    };
};

export const SetWorksheetHideMutation: IMutation<ISetWorksheetHideMutationParams> = {
    id: 'sheet.mutation.set-worksheet-hidden',
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

        worksheet.getConfig().hidden = params.hidden;

        return true;
    },
};
