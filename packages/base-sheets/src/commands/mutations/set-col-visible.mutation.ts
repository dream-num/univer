import { CommandType, ICurrentUniverService, IMutation, IRange } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetColHiddenMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetColHiddenUndoMutationFactory = (accessor: IAccessor, params: ISetColHiddenMutationParams) => {
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

export const SetColHiddenMutation: IMutation<ISetColHiddenMutationParams> = {
    id: 'sheet.mutation.set-col-hidden',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (!universheet) {
            return false;
        }

        const manager = universheet.getSheetBySheetId(params.worksheetId)!.getColumnManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startColumn; j < range.startColumn + range.endColumn; j++) {
                const column = manager.getColumnOrCreate(j);
                if (column != null) {
                    column.hd = 1;
                }
            }
        }

        return true;
    },
};

export interface ISetColVisibleMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetColVisibleUndoMutationFactory = (accessor: IAccessor, params: ISetColVisibleMutationParams) => {
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

export const SetColVisibleMutation: IMutation<ISetColVisibleMutationParams> = {
    id: 'sheet.mutation.set-col-visible',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (!universheet) {
            return false;
        }

        const manager = universheet.getSheetBySheetId(params.worksheetId)!.getColumnManager();
        for (let i = 0; i < params.ranges.length; i++) {
            const range = params.ranges[i];
            for (let j = range.startColumn; j < range.startColumn + range.endColumn; j++) {
                const column = manager.getColumnOrCreate(j);
                if (column != null) {
                    column.hd = 0;
                }
            }
        }

        return true;
    },
};
