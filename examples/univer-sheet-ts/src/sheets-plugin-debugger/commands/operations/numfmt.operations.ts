import { CommandType, ICommand, ICommandService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface NumfmtOperationCommandParams {
    value: 'close' | 'open';
}

export const NumfmtOperation: ICommand = {
    id: 'debugger.operation.numfmt',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: NumfmtOperationCommandParams) => {
        const confirmService = accessor.get(ICommandService);
        if (params.value === 'open') {
            confirmService.executeCommand('sheet.operation.open.numfmt.panel');
        } else {
            confirmService.executeCommand('sheet.operation.close.numfmt.panel');
        }
        return true;
    },
};
