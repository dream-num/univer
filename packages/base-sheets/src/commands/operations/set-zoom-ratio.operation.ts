import { CommandType, IOperation, IUniverInstanceService, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetZoomRatioOperationParams {
    zoomRatio: number;
    workbookId: string;
    worksheetId: string;
}

export const SetZoomRatioUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetZoomRatioOperationParams
): ISetZoomRatioOperationParams => {
    const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
    const worksheet = workbook!.getSheetBySheetId(params.worksheetId);
    const old = worksheet!.getConfig().zoomRatio;
    return {
        ...Tools.deepClone(params),
        zoomRatio: old,
    };
};

export const SetZoomRatioOperation: IOperation<ISetZoomRatioOperationParams> = {
    id: 'sheet.operation.set-zoom-ratio',
    type: CommandType.OPERATION,
    handler: (accessor, params: ISetZoomRatioOperationParams) => {
        const workbook = accessor.get(IUniverInstanceService).getUniverSheetInstance(params.workbookId);
        if (!workbook) {
            return false;
        }

        const worksheet = workbook.getSheetBySheetId(params.worksheetId);
        if (!worksheet) {
            return false;
        }

        worksheet.getConfig().zoomRatio = params.zoomRatio;

        return true;
    },
};
