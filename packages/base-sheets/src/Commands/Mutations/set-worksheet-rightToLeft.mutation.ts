import { CommandType, IMutation } from '@univerjs/core';

export type ISetWorksheetRightToLeftMutationParams = {
    workbookId: string;
    worksheetId: string;
};

export const SetWorksheetRightToLeftMutation: IMutation<ISetWorksheetRightToLeftMutationParams> = {
    id: 'sheet.mutation.set-worksheet-rightToLeft',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => true,
};
