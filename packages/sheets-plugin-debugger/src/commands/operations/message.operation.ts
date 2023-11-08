import { IMessageService, MessageType } from '@univerjs/base-ui';
import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const MessageOperation: ICommand = {
    id: 'debugger.operation.message',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const messageService = accessor.get(IMessageService);
        messageService.show({
            type: MessageType.Error,
            content: 'Demo message',
        });

        return true;
    },
};
