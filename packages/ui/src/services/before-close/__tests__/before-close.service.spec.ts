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
import type { INotificationOptions } from '../../../views/notification/Notification';
import { Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopNotificationService } from '../../notification/desktop-notification.service';
import { INotificationService } from '../../notification/notification.service';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopBeforeCloseService, IBeforeCloseService } from '../before-close.service';

class FakeNotificationService extends DesktopNotificationService {
    static notifications: INotificationOptions[] = [];

    override show(params: INotificationOptions): IDisposable {
        FakeNotificationService.notifications.push(params);
        return { dispose: () => {} };
    }
}

function createService(): IBeforeCloseService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([LocaleService, { useClass: LocaleService }]);
    injector.add([INotificationService, { useClass: FakeNotificationService }]);
    injector.add([IBeforeCloseService, { useClass: DesktopBeforeCloseService }]);
    const localeService = injector.get(LocaleService);
    localeService.load({
        [LocaleType.EN_US]: {},
    });
    return injector.get(IBeforeCloseService);
}

describe('DesktopBeforeCloseService', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        FakeNotificationService.notifications = [];
    });

    it('blocks unload with combined messages and clears handlers on dispose', () => {
        const windowTarget = new EventTarget();
        vi.stubGlobal('window', windowTarget);
        const service = createService();
        service.registerBeforeClose(() => 'Unsaved sheet');
        const disposable = service.registerBeforeClose(() => 'Pending upload');

        const event = new Event('beforeunload') as BeforeUnloadEvent;
        windowTarget.dispatchEvent(event);

        expect(event.returnValue).toBe('Unsaved sheet\nPending upload');

        disposable.dispose();
        (service as DesktopBeforeCloseService).dispose();
        const nextEvent = new Event('beforeunload') as BeforeUnloadEvent;
        windowTarget.dispatchEvent(nextEvent);
        expect(nextEvent.returnValue).toBeUndefined();
    });

    it('runs close callbacks when the page unloads and stops after disposal', () => {
        const windowTarget = new EventTarget();
        vi.stubGlobal('window', windowTarget);
        const service = createService();
        const closed: string[] = [];
        const disposable = service.registerOnClose(() => closed.push('closed'));

        windowTarget.dispatchEvent(new Event('unload'));
        disposable.dispose();
        windowTarget.dispatchEvent(new Event('unload'));

        expect(closed).toEqual(['closed']);
    });

    it('registers the notification UI part used for blocked close messages', () => {
        const windowTarget = new EventTarget();
        vi.stubGlobal('window', windowTarget);
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([LocaleService, { useClass: LocaleService }]);
        injector.add([INotificationService, { useClass: FakeNotificationService }]);
        injector.add([IBeforeCloseService, { useClass: DesktopBeforeCloseService }]);

        injector.get(IBeforeCloseService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
