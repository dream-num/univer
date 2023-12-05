import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';

export const AddMergeUndoMutationFactory = (
    accessor: IAccessor,
    params: IAddWorksheetMergeMutationParams
): IRemoveWorksheetMergeMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
    };
};

export const AddWorksheetMergeMutation: IMutation<IAddWorksheetMergeMutationParams> = {
    id: 'sheet.mutation.add-worksheet-merge',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: IAddWorksheetMergeMutationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig()!;
        const mergeConfigData = config.mergeData;
        const mergeAppendData = params.ranges;
        console.log('config merge data', mergeAppendData);
        for (let i = 0; i < mergeAppendData.length; i++) {
            mergeConfigData.push(mergeAppendData[i]);
        }
        return true;
    },
};
