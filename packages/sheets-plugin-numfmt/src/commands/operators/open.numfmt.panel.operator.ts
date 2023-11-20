import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { NumfmtController } from '../../controllers/numfmt.controller';

export const OpenNumfmtPanelOperator: ICommand = {
    id: 'sheet.operation.open.numfmt.panel',
    type: CommandType.OPERATION,
    handler: (accessor: IAccessor) => {
        const numfmtController = accessor.get(NumfmtController);
        numfmtController.openPanel();
        return true;
    },
};
