import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { INumfmtController } from '../../controllers/type';

export const OpenNumfmtPanelOperator: ICommand = {
    id: 'sheet.operation.open.numfmt.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const numfmtController = accessor.get(INumfmtController);
        numfmtController.openPanel();
        return true;
    },
};
