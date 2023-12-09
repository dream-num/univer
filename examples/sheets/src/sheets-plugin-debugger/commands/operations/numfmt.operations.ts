import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

export interface INumfmtOperationCommandParams {
    value: 'close' | 'open';
}

export const NumfmtOperation: ICommand = {
    id: 'debugger.operation.numfmt',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: INumfmtOperationCommandParams) => {
        const confirmService = accessor.get(ICommandService);
        if (params.value === 'open') {
            confirmService.executeCommand('sheet.operation.open.numfmt.panel');
        } else {
            confirmService.executeCommand('sheet.operation.close.numfmt.panel');
        }
        return true;
    },
};
