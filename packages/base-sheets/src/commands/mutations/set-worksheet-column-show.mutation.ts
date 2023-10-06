import { CommandType, ICurrentUniverService, IMutation, IRange } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface ISetWorksheetColumnShowMutationParams {
    workbookId: string;
    worksheetId: string;
    ranges: IRange[];
}

export const SetWorksheetColumnShowMutationFactory = (
    accessor: IAccessor,
    params: ISetWorksheetColumnShowMutationParams
) => {
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

export const SetWorksheetColumnShowMutation: IMutation<ISetWorksheetColumnShowMutationParams> = {
    id: 'sheet.mutation.set-worksheet-column-show',
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
