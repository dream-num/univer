import { CommandType, ICurrentUniverService, IMutation, IWorksheetConfig, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetConfigMutationParams {
    workbookId: string;
    worksheetId: string;
    config: IWorksheetConfig;
}

export const SetWorksheetConfigUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetConfigMutationParams
): ISetWorksheetConfigMutationParams => {
    const workbook = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId)?.getWorkBook();
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId)!;
    const config = Tools.deepClone(worksheet.getConfig());

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        config,
    };
};

export const SetWorksheetConfigMutation: IMutation<ISetWorksheetConfigMutationParams> = {
    id: 'sheet.mutation.set-worksheet-config',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const workbook = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        worksheet.setConfig(params.config);

        return true;
    },
};
