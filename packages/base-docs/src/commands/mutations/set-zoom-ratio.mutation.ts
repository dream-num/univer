import { CommandType, ICurrentUniverService, IMutation, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetZoomRatioMutationParams {
    zoomRatio: number;
    documentId: string;
}

export const SetZoomRatioUndoMutationFactory = (
    accessor: IAccessor,
    params: ISetZoomRatioMutationParams
): ISetZoomRatioMutationParams => {
    const documentModel = accessor.get(ICurrentUniverService).getUniverDocInstance(params.documentId);
    const old = documentModel?.getSettings()?.zoomRatio || 1;
    return {
        ...Tools.deepClone(params),
        zoomRatio: old,
    };
};

export const SetZoomRatioMutation: IMutation<ISetZoomRatioMutationParams> = {
    id: 'doc.mutation.set-zoom-ratio',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const documentModel = accessor.get(ICurrentUniverService).getUniverDocInstance(params.documentId);
        if (!documentModel) return false;
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
