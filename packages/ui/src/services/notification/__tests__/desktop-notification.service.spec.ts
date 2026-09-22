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
import { toast } from '@univerjs/design';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('shows a notification and returns a disposable close handle', () => {
        const service = createService();
        const onClick = vi.fn();
        const showToast = vi.spyOn(toast, 'error').mockReturnValue('conflict-toast');
        const dismissToast = vi.spyOn(toast, 'dismiss');

        const disposable = service.show({
            title: 'Conflict',
            content: 'Reload the page',
            type: 'error',
            duration: Infinity,
            closable: false,
            dismissible: false,
            action: {
                label: 'Reload page',
                onClick,
            },
        });

        expect(showToast).toHaveBeenCalledWith('Conflict', {
            position: 'top-right',
            description: 'Reload the page',
            duration: Infinity,
            closeButton: false,
            dismissible: false,
            action: {
                label: 'Reload page',
                onClick,
            },
        });
        disposable.dispose();
        expect(dismissToast).toHaveBeenCalledWith('conflict-toast');
    });

    it('registers the notification UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([INotificationService, { useClass: DesktopNotificationService }]);

        injector.get(INotificationService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
