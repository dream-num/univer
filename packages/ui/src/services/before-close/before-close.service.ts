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

import type { IDisposable } from '@wendellhu/redi';
import { createIdentifier } from '@wendellhu/redi';

import { INotificationService } from '../notification/notification.service';

export interface IBeforeCloseService {
    /**
     * Provide a callback to check if the web page could be closed safely.
     *
     * @param callback The callback to check if the web page could be closed safely.
     * It should return a string to show a message to the user. If the return value is undefined,
     * the web page could be closed safely.
     */
    registerBeforeClose(callback: () => string | undefined): IDisposable;
}

export const IBeforeCloseService = createIdentifier<IBeforeCloseService>('univer.ui.before-close-service');

export class DesktopBeforeCloseService implements IBeforeCloseService {
    private _callbacks: Array<() => string | undefined> = [];

    constructor(@INotificationService private readonly _notificationService: INotificationService) {
        this._init();
    }

    registerBeforeClose(callback: () => string | undefined): IDisposable {
        this._callbacks.push(callback);
        return {
            dispose: () => {
                this._callbacks = this._callbacks.filter((cb) => cb !== callback);
            },
        };
    }

    private _init(): void {
        window.onbeforeunload = (event: BeforeUnloadEvent) => {
            const message = this._callbacks
                .map((callback) => callback())
                .filter((m) => !!m)
                .join('\n');

            if (message) {
                this._notificationService.show({
                    type: 'error',
                    title: 'Some changes are not saved',
                    content: message,
                });

                if (typeof event === 'undefined') {
                    event = window.event as BeforeUnloadEvent;
                }

                event.returnValue = message;
                return message;
            }
        };
    }
}
