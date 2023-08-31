import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetOrderMutationParams {
    order: number;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetOrderMutationFactory = (accessor: IAccessor, params: ISetWorksheetOrderMutationParams): ISetWorksheetOrderMutationParams => {
    const universheet = accessor.get(ICurrentUniverService).getCurrentUniverSheetInstance();
    const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = universheet.getWorkBook().getConfig();
    return {
        order: config.sheetOrder.findIndex((current: string) => current === params.worksheetId),
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
    };
};

export const SetWorksheetOrderMutation: IMutation<ISetWorksheetOrderMutationParams> = {
    id: 'sheet.mutation.set-worksheet-order',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const universheet = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId);
        if (universheet == null) {
            return false;
        }
        const config = universheet.getWorkBook().getConfig();
        const exclude = config.sheetOrder.filter((currentId: string) => currentId !== params.worksheetId);
        exclude.splice(params.order, 0, params.worksheetId);
        config.sheetOrder = exclude;
        return true;
    },
};
