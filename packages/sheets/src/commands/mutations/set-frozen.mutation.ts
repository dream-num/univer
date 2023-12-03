import { CommandType, IMutation, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetFrozenMutationParams {
    workbookId: string;
    worksheetId: string;
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetFrozenMutationFactory = (
    accessor: IAccessor,
    params: ISetFrozenMutationParams
): ISetFrozenMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }
    const worksheet = universheet.getSheetBySheetId(params.worksheetId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = worksheet.getConfig();
    const freeze = config.freeze;

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        ...freeze,
    };
};

export const SetFrozenMutation: IMutation<ISetFrozenMutationParams> = {
    id: 'sheet.mutation.set-frozen',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params: ISetFrozenMutationParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const universheet = univerInstanceService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        const { startRow, startColumn, ySplit, xSplit } = params;
        config.freeze = { startRow, startColumn, ySplit, xSplit };
        return true;
    },
};
