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
import type { IMessageProps } from '@univerjs/design';
import type { IMessageService } from './message.service';
import { Disposable, Inject, Injector, toDisposable } from '@univerjs/core';
import { message, Messager, removeMessage } from '@univerjs/design';
import { connectInjector } from '../../utils/di';
import { BuiltInUIPart, IUIPartsService } from '../parts/parts.service';

export class DesktopMessageService extends Disposable implements IMessageService {
    constructor(
        @Inject(Injector) protected readonly _injector: Injector,
        @IUIPartsService protected readonly _uiPartsService: IUIPartsService
    ) {
        super();

        this._initUIPart();
    }

    protected _initUIPart(): void {
        this.disposeWithMe(
            this._uiPartsService.registerComponent(BuiltInUIPart.GLOBAL, () => connectInjector(Messager, this._injector))
        );
    }

    override dispose(): void {
        removeMessage();
    }

    show(options: IMessageProps): IDisposable {
        let op = options;
        if (typeof options.id === 'undefined') {
            op = Object.assign({}, options, { id: `message-${Date.now()}` });
        }

        message(op);
        return toDisposable(() => removeMessage(op.id));
    }

    remove(id: string): void {
        removeMessage(id);
    }

    removeAll(): void {
        removeMessage();
    }
}
