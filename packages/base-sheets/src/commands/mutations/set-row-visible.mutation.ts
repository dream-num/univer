import { CommandType, ICurrentUniverService, IMutation, IRange } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetRowVisibleMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetRowVisibleUndoMutationFactory = (accessor: IAccessor, params: ISetRowVisibleMutationParams) => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
    };
};

export const SetRowVisibleMutation: IMutation<ISetRowVisibleMutationParams> = {
    id: 'sheet.mutation.set-row-visible',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getSheetBySheetId(params.worksheetId)!.getRowManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);
                if (row != null) {
                    row.hd = 0;
                }
            }
        }

        return true;
    },
};

export interface ISetRowHiddenMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetRowHiddenUndoMutationFactory = (accessor: IAccessor, params: ISetRowHiddenMutationParams) => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ranges: params.ranges,
    };
};

export const SetRowHiddenMutation: IMutation<ISetRowHiddenMutationParams> = {
    id: 'sheet.mutation.set-row-hidden',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const manager = universheet.getSheetBySheetId(params.worksheetId)!.getRowManager();

        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startRow; j < range.endRow + 1; j++) {
                const row = manager.getRowOrCreate(j);
                if (row != null) {
                    row.hd = 1;
                }
            }
        }

        return true;
    },
};
