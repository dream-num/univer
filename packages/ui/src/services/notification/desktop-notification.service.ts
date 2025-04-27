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
import type { INotificationOptions } from '../../components/notification/Notification';

import type { INotificationService } from './notification.service';
import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { notification, Notification } from '../../components/notification/Notification';
import { connectInjector } from '../../utils/di';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class DesktopNotificationService extends Disposable implements INotificationService {
    constructor(
        @Inject(Injector) private readonly _injector: Injector,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initUIPart();
    }

    show(params: INotificationOptions): IDisposable {
        notification.show(params);

        return toDisposable(() => { /* empty */ });
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(Notification, this._injector))
        );
    }
}
