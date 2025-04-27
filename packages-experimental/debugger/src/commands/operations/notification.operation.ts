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
import { INotificationService } from '@univerjs/ui';

export interface IUIComponentCommandParams {
    value: string;
}

export const NotificationOperation: ICommand = {
    id: 'debugger.operation.notification',
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
