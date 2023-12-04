import { IConfirmService } from '@univerjs/ui';
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
            id: 'confirm1',
            children: { title: 'Confirm Content' },
            title: { title: 'Confirm Title' },
            onClose() {
                confirmService.close('confirm1');
            },
        });

        confirmService.open({
            id: 'confirm2',
            children: { title: 'Confirm2 Content' },
            title: { title: 'Confirm2 Title' },
            onClose() {
                confirmService.close('confirm2');
            },
        });

        return true;
    },
};
