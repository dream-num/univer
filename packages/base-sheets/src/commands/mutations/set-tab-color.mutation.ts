import { CommandType, IMutation, IUniverInstanceService, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetTabColorMutationParams {
    color: string;
    workbookId: string;
    worksheetId: string;
}

export const SetTabColorUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetTabColorMutationParams
): ISetTabColorMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const config = worksheet!.getConfig();

    // store old tab color
    const oldTabColor = config.tabColor;
    return {
        ...Tools.deepClone(params),
        color: oldTabColor,
    };
};

export const SetTabColorMutation: IMutation<ISetTabColorMutationParams> = {
    id: 'sheet.mutation.set-tab-color',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        worksheet.getConfig().tabColor = params.color;

        return true;
    },
};
