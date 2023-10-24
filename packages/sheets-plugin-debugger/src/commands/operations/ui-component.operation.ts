import { INotificationService } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IUIComponentCommandParams {
    value: string;
}

export const UIComponentOperation: ICommand = {
    id: 'debugger.operation.ui-component',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IUIComponentCommandParams) => {
        const notificationService = accessor.get(INotificationService);
        const { value = '' } = params;
        const type =
            value.indexOf('Success') > -1
                ? 'success'
                : value.indexOf('Info') > -1
                ? 'info'
                : value.indexOf('Warning') > -1
                ? 'warning'
                : 'error';
        notificationService.show({
            type,
            content: value || 'Notification Content',
            title: 'Notification Title',
        });

        return true;
    },
};
