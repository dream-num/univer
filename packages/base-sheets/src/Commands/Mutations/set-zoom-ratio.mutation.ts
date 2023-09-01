import { CommandType, ICurrentUniverService, IMutation, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetZoomRatioMutationParams {
    zoomRatio: number;
    workbookId: string;
    worksheetId: string;
}

export const SetZoomRatioUndoMutationFactory = (accessor: IAccessor, params: ISetZoomRatioMutationParams): ISetZoomRatioMutationParams => {
    const workbook = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId)?.getWorkBook();
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const old = worksheet!.getConfig().zoomRatio;
    return {
        ...Tools.deepClone(params),
        zoomRatio: old,
    };
};

export const SetZoomRatioMutation: IMutation<ISetZoomRatioMutationParams> = {
    id: 'sheet.mutation.set-zoom-ratio',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const workbook = accessor.get(ICurrentUniverService).getUniverSheetInstance(params.workbookId)?.getWorkBook();
        const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
        worksheet!.getConfig().zoomRatio = params.zoomRatio;

        return true;
    },
};
