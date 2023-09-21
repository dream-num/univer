import { CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetFrozenColumnsMutationParams {
    workbookId: string;
    worksheetId: string;
    numColumns: number;
}

export const SetFrozenColumnsMutationFactory = (
    accessor: IAccessor,
    params: ISetFrozenColumnsMutationParams
): ISetFrozenColumnsMutationParams => {
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
    const oldStatus = config.freezeColumn;

    return {
        workbookId: params.workbookId,
        worksheetId: params.worksheetId,
        numColumns: oldStatus,
    };
};

export const SetFrozenColumnsMutation: IMutation<ISetFrozenColumnsMutationParams> = {
    id: 'sheet.mutation.set-frozen-columns',
    type: CommandType.MUTATION,
    handler: async (accessor: IAccessor, params: ISetFrozenColumnsMutationParams) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const worksheet = universheet.getWorkBook().getSheetBySheetId(params.worksheetId);
        if (!worksheet) return false;
        const config = worksheet.getConfig();
        config.freezeColumn = params.numColumns;

        return true;
    },
};
