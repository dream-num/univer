/**
 * Copyright 2023-present DreamNum Inc.
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

import { toDisposable } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';

import type { INotificationMethodOptions } from '../../components/notification/Notification';
import { notification } from '../../components/notification/Notification';
import type { INotificationService } from './notification.service';

export class DesktopNotificationService implements INotificationService {
    show(params: INotificationMethodOptions): IDisposable {
        notification.show(params);

        return toDisposable(() => {});
    }
}
