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
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopMessageService } from '../desktop-message.service';
import { IMessageService } from '../message.service';

function createService(): IMessageService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IMessageService, { useClass: DesktopMessageService }]);
    return injector.get(IMessageService);
}

describe('DesktopMessageService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('shows a message and allows callers to close it through the returned disposable', () => {
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(1);
            return 1;
        });
        const service = createService();

        const disposable = service.show({ id: 'save-message', content: 'Saved', type: MessageType.Success });

        expect(() => disposable.dispose()).not.toThrow();
        expect(() => service.removeAll()).not.toThrow();
    });

    it('registers the message container UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IMessageService, { useClass: DesktopMessageService }]);

        injector.get(IMessageService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
