import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FindService } from '../../services/find.service';

export const ShowModalOperation: ICommand = {
    id: 'find.operation.show-modal',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(true);
        return true;
    },
};
export const HideModalOperation: ICommand = {
    id: 'find.operation.hide-modal',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const findService = accessor.get(FindService);
        findService.showModal(false);
        return true;
    },
};
