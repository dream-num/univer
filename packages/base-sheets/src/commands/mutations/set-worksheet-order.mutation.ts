import { CommandType, IMutation, IUniverInstanceService, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetOrderMutationParams {
    order: number;
    workbookId: string;
    worksheetId: string;
}

export const SetWorksheetOrderUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetOrderMutationParams
): ISetWorksheetOrderMutationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const config = workbook!.getConfig();
    const oldIndex = config.sheetOrder.findIndex((current: string) => current === params.worksheetId);
    return {
        ...Tools.deepClone(params),
        order: oldIndex,
    };
};

export const SetWorksheetOrderMutation: IMutation<ISetWorksheetOrderMutationParams> = {
    id: 'sheet.mutation.set-worksheet-order',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) return false;
        const config = workbook.getConfig();
        const exclude = config.sheetOrder.filter((currentId: string) => currentId !== params.worksheetId);
        exclude.splice(params.order, 0, params.worksheetId);
        config.sheetOrder = exclude;
        return true;
    },
};
