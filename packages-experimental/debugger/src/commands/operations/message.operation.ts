/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { IMessageService } from '@univerjs/ui';

export const MessageOperation: ICommand = {
    id: 'debugger.operation.message',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: { value: string }) => {
        const messageService = accessor.get(IMessageService);

        if (params.value === 'loading') {
            messageService.show({
                type: MessageType.Loading,
                content: 'Loading message',
                duration: 3000,
            });

            return true;
        }

        messageService.show({
            type: MessageType.Success,
            content: 'Demo message',
            duration: 1500,
        });

        return true;
    },
};
