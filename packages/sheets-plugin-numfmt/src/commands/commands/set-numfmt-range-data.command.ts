import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface SetNumfmtRangeDataCommandParams {
    value: string;
}

export const SetNumfmtRangeDataCommand: ICommand<SetNumfmtRangeDataCommandParams> = {
    id: 'numfmt.command.set-range-data',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: SetNumfmtRangeDataCommandParams) => {
        const { value } = params;
        console.info('set-numfmt-range-data', value);
        return true;
    },
};
