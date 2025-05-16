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

import type { INotificationOptions } from '@univerjs/ui';
import { INotificationService, useDependency } from '@univerjs/ui';

const menu = [
    {
        label: 'Notification success',
        value: 'success',
    },
    {
        label: 'Notification info',
        value: 'info',
    },
    {
        label: 'Notification warning',
        value: 'warning',
    },
    {
        label: 'Notification error',
        value: 'error',
    },
];

export function useNotification() {
    const notificationService = useDependency(INotificationService);

    const onSelect = (value: string) => {
        notificationService.show({
            type: value as INotificationOptions['type'],
            content: 'Lorem Ipusm dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            title: 'Notification Title',
        });
    };

    return {
        type: 'subItem' as const,
        children: '🔔 Notification',
        options: menu.map((item) => ({
            type: 'item' as const,
            children: item.label,
            onSelect: () => onSelect(item.value),
        })),
    };
}
