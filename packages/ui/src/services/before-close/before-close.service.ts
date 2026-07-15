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

import type { IDisposable } from '@univerjs/core';
import type { LocaleKey } from '../../locale/types';
import { createIdentifier, Disposable, Inject, LocaleService } from '@univerjs/core';
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

    /**
     * Provide a callback to be called when the web page is closed.
     *
     * @param callback The callback to be called when the web page is closed.
     */
    registerOnClose(callback: () => void): IDisposable;
}

export const IBeforeCloseService = createIdentifier<IBeforeCloseService>('univer.ui.before-close-service');

export class DesktopBeforeCloseService extends Disposable implements IBeforeCloseService {
    private _beforeUnloadCallbacks: Array<() => string | undefined> = [];
    private _onCloseCallbacks: Array<() => void> = [];

    private readonly _beforeUnloadHandler: (event: BeforeUnloadEvent) => string | undefined;
    private readonly _unloadHandler: () => void;

    constructor(
        @INotificationService private readonly _notificationService: INotificationService,
        @Inject(LocaleService) private readonly _localeService: LocaleService
    ) {
        super();
        this._beforeUnloadHandler = (_event: BeforeUnloadEvent) => {
            let event = _event;
            const message = this._beforeUnloadCallbacks
                .map((callback) => callback())
                .filter((m) => !!m)
                .join('\n');

            if (message) {
                this._notificationService.show({
                    type: 'error',
                    title: this._localeService.t<LocaleKey>('ui.beforeClose.title'),
                    content: message,
                });

                if (typeof event === 'undefined') {
                    event = window.event as BeforeUnloadEvent;
                }

                event.returnValue = message;
                return message;
            }
        };

        this._unloadHandler = () => {
            this._onCloseCallbacks.forEach((callback) => callback());
        };

        this._init();
    }

    override dispose(): void {
        window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        window.removeEventListener('unload', this._unloadHandler);
        this._beforeUnloadCallbacks = [];
        this._onCloseCallbacks = [];
        super.dispose();
    }

    registerBeforeClose(callback: () => string | undefined): IDisposable {
        this._beforeUnloadCallbacks.push(callback);
        return {
            dispose: () => {
                this._beforeUnloadCallbacks = this._beforeUnloadCallbacks.filter((cb) => cb !== callback);
            },
        };
    }

    registerOnClose(callback: () => void): IDisposable {
        this._onCloseCallbacks.push(callback);
        return {
            dispose: () => {
                this._onCloseCallbacks = this._onCloseCallbacks.filter((cb) => cb !== callback);
            },
        };
    }

    private _init(): void {
        window.addEventListener('beforeunload', this._beforeUnloadHandler);
        window.addEventListener('unload', this._unloadHandler);
    }
}
