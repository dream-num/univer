import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetFrozenRowsMutationParams {
    workbookId: string;
    worksheetId: string;
    numRows: number;
}

export const SetFrozenRowsMutationFactory = (
    accessor: IAccessor,
    params: ISetFrozenRowsMutationParams
): ISetFrozenRowsMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

    if (universheet == null) {
        throw new Error('universheet is null error!');
    }
    const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);

    if (worksheet == null) {
        throw new Error('worksheet is null error!');
    }
    const config = worksheet.getConfig();
    const oldStatus = config.freezeRow;

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        numRows: oldStatus,
    };
};

export const SetFrozenRowsMutation: IMutation<ISetFrozenRowsMutationParams> = {
    id: 'sheet.mutation.set-frozen-rows',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor, params: ISetFrozenRowsMutationParams) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        config.freezeRow = params.numRows;

        return true;
    },
};
