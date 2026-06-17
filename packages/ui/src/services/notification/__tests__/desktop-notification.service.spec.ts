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
import { describe, expect, it } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopNotificationService } from '../desktop-notification.service';
import { INotificationService } from '../notification.service';

function createService(): INotificationService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([INotificationService, { useClass: DesktopNotificationService }]);
    return injector.get(INotificationService);
}

describe('DesktopNotificationService', () => {
    it('shows a notification and returns a disposable close handle', () => {
        const service = createService();

        const disposable = service.show({ title: 'Saved', content: 'Workbook saved', type: 'success' });

        expect(() => disposable.dispose()).not.toThrow();
    });

    it('registers the notification UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([INotificationService, { useClass: DesktopNotificationService }]);

        injector.get(INotificationService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
