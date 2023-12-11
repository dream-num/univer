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
import type { IMessageMethodOptions, IMessageProps } from '@univerjs/design';
import { Message } from '@univerjs/design';
import type { IDisposable } from '@wendellhu/redi';

import type { IMessageService } from './message.service';

export class DesktopMessageService implements IMessageService {
    portalContainer: HTMLElement = document.body;
    message?: Message;

    setContainer(container: HTMLElement): void {
        this.portalContainer = container;
        this.message = new Message(container);
    }

    show(options: IMessageMethodOptions & Omit<IMessageProps, 'key'>): IDisposable {
        const { type, ...rest } = options;

        this.message && this.message[type](rest);

        return toDisposable(() => {});
    }
}
