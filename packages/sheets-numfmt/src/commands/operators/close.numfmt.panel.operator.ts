import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export const CloseNumfmtPanelOperator: ICommand = {
    id: 'sheet.operation.close.numfmt.panel',
    type: CommandType.OPERATION,
    handler: () =>
        // do nothing,just notify panel is closed
        true,
};
