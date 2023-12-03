import { BooleanNumber, CommandType, IMutation, IUniverInstanceService, Nullable, Worksheet } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetActivateMutationParams {
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetUnActivateMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetActivateMutationParams
): ISetWorksheetActivateMutationParams => {
    const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheets = universheet.getWorksheets();
    let activate: Nullable<Worksheet> = null;

    for (const [, worksheet] of worksheets) {
        if (worksheet.getStatus() === BooleanNumber.TRUE) {
            activate = worksheet;
            break;
        }
    }

    if (activate == null) {
        throw new Error('not found activate worksheet!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: activate.getSheetId(),
    };
};

export const SetWorksheetActivateMutation: IMutation<ISetWorksheetActivateMutationParams> = {
    id: 'sheet.mutation.set-worksheet-activate',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const universheet = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);

        if (!universheet) return false;

        const worksheets = universheet.getWorksheets();

        for (const [, worksheet] of worksheets) {
            if (worksheet.getSheetId() === params.worksheetId) {
                worksheet.getConfig().status = BooleanNumber.TRUE;
            } else {
                worksheet.getConfig().status = BooleanNumber.FALSE;
            }
        }
        return true;
    },
};
