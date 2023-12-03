import type { IOperation } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Tools } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface ISetDocZoomRatioOperationParams {
    zoomRatio: number;
    unitId: string;
}

export const SetDocZoomRatioUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetDocZoomRatioOperationParams
): ISetDocZoomRatioOperationParams => {
    const documentModel = accessor.get(IUniverInstanceService).getUniverDocInstance(params.unitId);
    const old = documentModel?.zoomRatio || 1;
    return {
        ...Tools.deepClone(params),
        zoomRatio: old,
    };
};

export const SetDocZoomRatioOperation: IOperation<ISetDocZoomRatioOperationParams> = {
    id: 'doc.operation.set-zoom-ratio',

    type: CommandType.OPERATION,

    handler: (accessor, params: ISetDocZoomRatioOperationParams) => {
        const documentModel = accessor.get(IUniverInstanceService).getUniverDocInstance(params.unitId);
        if (!documentModel) {
            return false;
        }

        const documentData = documentModel.getSnapshot();
        if (documentData.settings == null) {
            documentData.settings = {
                zoomRatio: params.zoomRatio,
            };
        } else {
            documentData.settings.zoomRatio = params.zoomRatio;
        }

        return true;
    },
};
