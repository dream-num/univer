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

import type { IMessageService } from '../message.service';
import { toDisposable } from '@univerjs/core';

/**
 * This is a mocked message service for testing purposes.
 *
 * @ignore
 */
export class MockMessageService implements IMessageService {
    show(_options: IMessageProps): IDisposable {
        return toDisposable(() => { /* empty */ });
    }

    remove(_id: string): void {
        // empty
    }

    removeAll(): void {
        // empty
    }

    setContainer(): void {
        // empty
    }

    getContainer(): HTMLElement | undefined {
        return undefined;
    }
}
