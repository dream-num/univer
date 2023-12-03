import type { BooleanNumber, IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetRightToLeftMutationParams {
    rightToLeft: BooleanNumber;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetRightToLeftUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetRightToLeftMutationParams
): ISetWorksheetRightToLeftMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const config = worksheet!.getConfig();

    const oldState = config.rightToLeft;

    return {
        ...Tools.deepClone(params),
        rightToLeft: oldState,
    };
};

export const SetWorksheetRightToLeftMutation: IMutation<ISetWorksheetRightToLeftMutationParams> = {
    id: 'sheet.mutation.set-worksheet-right-to-left',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();

        config.rightToLeft = params.rightToLeft;

        return true;
    },
};
