import { ISidebarService } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const CloseNumfmtPanelOperator: ICommand = {
    id: 'sheet.operation.close.numfmt.panel',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sidebarService = accessor.get(ISidebarService);
        sidebarService.close();
        return true;
    },
};
