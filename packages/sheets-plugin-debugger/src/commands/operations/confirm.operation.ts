import { IConfirmService } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IUIComponentCommandParams {
    value: string;
}

export const ConfirmOperation: ICommand = {
    id: 'debugger.operation.confirm',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const confirmService = accessor.get(IConfirmService);

        confirmService.open({
            visible: true,
            children: { title: 'Confirm Content' },
            title: { title: 'Confirm Title' },
            onClose() {
                confirmService.close();
            },
        });

        return true;
    },
};
