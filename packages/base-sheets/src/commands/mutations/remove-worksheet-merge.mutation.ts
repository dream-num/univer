import { CommandType, ICurrentUniverService, IMutation, Rectangle } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../Basics/Interfaces/MutationInterface';

export const RemoveMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IRemoveWorksheetMergeMutationParams
): IAddWorksheetMergeMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    const worksheet = universheet.getSheetBySheetId(params.worksheetId);
    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = worksheet.getConfig();
    const mergeConfigData = config.mergeData;
    const mergeRemoveData = params.ranges;
    const ranges = [];
    for (let j = 0; j < mergeRemoveData.length; j++) {
        for (let i = mergeConfigData.length - 1; i >= 0; i--) {
            const configMerge = mergeConfigData[i];
            const removeMerge = mergeRemoveData[j];
            if (Rectangle.intersects(configMerge, removeMerge)) {
                ranges.push(mergeConfigData[i]);
            }
        }
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges,
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

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        const mergeConfigData = config.mergeData;
        const mergeRemoveData = params.ranges;
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
