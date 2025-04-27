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

import type { IToasterProps } from '@univerjs/design';
import { ThemeService } from '@univerjs/core';
import { toast, Toaster } from '@univerjs/design';
import { useDependency, useObservable } from '../../utils/di';

export function Notification() {
    const themeService = useDependency(ThemeService);

    const darkMode = useObservable(themeService.darkMode$);

    return <Toaster theme={darkMode ? 'dark' : 'light'} />;
}

export interface INotificationOptions {
    /** The title of the notification */
    title: Parameters<typeof toast>[0];

    /** The description of the notification */
    content?: string;

    /** The type of the notification */
    type?: 'success' | 'info' | 'warning' | 'error' | 'message' | 'loading';

    /** The placement of the notification */
    position?: IToasterProps['position'];

    /** The duration of the notification */
    duration?: number;

    expand?: boolean;

    /** The icon of the notification */
    icon?: React.ReactNode;

    closable?: boolean;
}

export const notification = {
    show: (options: INotificationOptions) => {
        const {
            type = 'message',
            title,
            content,
            duration,
            closable = true,
            position = 'top-right',
        } = options;

        toast[type](title, {
            position,
            description: content,
            duration,
            closeButton: closable,
        });
    },
};
