import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FindService } from '../services/find.service';

export const ShowModalCommand: ICommand = {
    id: 'find.command.show-modal',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(true);
        return true;
    },
};
export const HideModalCommand: ICommand = {
    id: 'find.command.hide-modal',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(false);
        return true;
    },
};
