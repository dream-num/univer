import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { NumfmtService } from '../services/numfmt.service';

export interface ShowModalCommandParams {
    value: string;
}

export const ShowModalCommand: ICommand<ShowModalCommandParams> = {
    id: 'numfmt.command.show-modal',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: ShowModalCommandParams) => {
        const { value } = params;
        const numfmtService = accessor.get(NumfmtService);
        console.info('numfmt-command-show-modal', value);
        numfmtService.showModal(value);
        return true;
    },
};
