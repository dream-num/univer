import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

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
