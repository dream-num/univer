import { CommandType, IMutation } from '@univerjs/core';

export interface IInsertRowParams {}

export const InsertRowMutation: IMutation<IInsertRowParams> = {
    id: 'sheet.mutation.insert-row',
    type: CommandType.MUTATION,
    handler: async (accessor, params) =>
        // TODO: copy code from
        // packages/core/src/Sheets/Apply/InsertRow.ts
        true,
};

export interface IInsertColParams {}

export const IInsertColMutation: IMutation<IInsertColParams> = {
    id: 'sheet.mutation.insert-col',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => true,
};
