import { ISidebarService } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { MORE_FUNCTIONS_COMPONENT } from '../../views/more-functions/interface';

export const MoreFunctionsOperation: ICommand = {
    id: 'formula.operation.more-functions',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sidebarService = accessor.get(ISidebarService);

        sidebarService.open({
            header: { title: 'formula.insert.tooltip' },
            children: { label: MORE_FUNCTIONS_COMPONENT },
        });

        return true;
    },
};
