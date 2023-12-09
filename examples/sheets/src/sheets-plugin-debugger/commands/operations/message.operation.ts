import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

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
