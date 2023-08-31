import { BooleanNumber, CommandType, ICurrentUniverService, IMutation } from '@univerjs/core';

export interface ISetWorksheetStatusMutationParams {
    workbookId: string;
    worksheetId: string;
    sheetStatus: BooleanNumber;
}

export const SetWorksheetStatusMutation: IMutation<ISetWorksheetStatusMutationParams> = {
    id: 'sheet.mutation.set-worksheet-status',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const universheet = currentUniverService.getUniverSheetInstance(params.workbookId);

        if (universheet == null) {
            throw new Error('universheet is null error!');
        }

        const config = universheet.getWorkBook().getSheetBySheetId(params.worksheetId)!.getConfig()!;
        config.status = params.sheetStatus;
        return true;
    },
};
