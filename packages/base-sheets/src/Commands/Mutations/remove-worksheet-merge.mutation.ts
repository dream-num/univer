import { CommandType, ICurrentUniverService, IMutation, Rectangle } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IAddWorksheetMergeMutationParams, IRemoveWorksheetMergeMutationParams } from '../../Basics/Interfaces/MutationInterface';

export const RemoveWorksheetMergeMutationFactory = (accessor: IAccessor, params: IRemoveWorksheetMergeMutationParams): IAddWorksheetMergeMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        rectangles: params.rectangles,
    };
};

export const RemoveWorksheetMergeMutation: IMutation<IRemoveWorksheetMergeMutationParams> = {
    id: 'sheet.mutation.remove-worksheet-merge',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor, params: IRemoveWorksheetMergeMutationParams) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const config = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getConfig()!;
        const mergeConfigData = config.mergeData;
        const mergeRemoveData = params.rectangles;
        for (let j = 0; j < mergeRemoveData.length; j++) {
            for (let i = mergeConfigData.length - 1; i >= 0; i--) {
                const configMerge = mergeConfigData[i];
                const removeMerge = mergeRemoveData[j];
                if (Rectangle.intersects(configMerge, removeMerge)) {
                    mergeConfigData.splice(i, 1);
                }
            }
        }
        return true;
    },
};
