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
        const { value } = params;
        notificationService.show({ type: 'success', content: value || 'Notification Content' });

        return true;
    },
};
