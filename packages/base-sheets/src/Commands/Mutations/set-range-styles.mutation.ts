import { CommandType, IMutation } from '@univerjs/core';

export interface ISetRangeStyleMutation {

}

export const SetRangeStyleMutation: IMutation<> = {
    id: 'sheet.mutation.set-range-style',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        return true;
    }
};