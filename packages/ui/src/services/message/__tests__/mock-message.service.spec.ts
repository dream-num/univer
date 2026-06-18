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

import { Injector } from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { describe, expect, it } from 'vitest';
import { IMessageService } from '../message.service';
import { MockMessageService } from './mock-message.service';

function createService(): IMessageService {
    const injector = new Injector();
    injector.add([IMessageService, { useClass: MockMessageService }]);
    return injector.get(IMessageService);
}

describe('MockMessageService', () => {
    it('acts as a no-op message channel for tests without a UI container', () => {
        const service = createService();
        const disposable = service.show({ content: 'Saved', type: MessageType.Success });

        expect(() => disposable.dispose()).not.toThrow();
        expect(() => service.remove('message-1')).not.toThrow();
        expect(() => service.removeAll()).not.toThrow();
    });
});
