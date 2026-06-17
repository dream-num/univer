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

import type { IConfirmPartMethodOptions } from '../../../views/components/confirm-part/interface';
import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopConfirmService } from '../desktop-confirm.service';

function createService(): DesktopConfirmService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([DesktopConfirmService]);
    return injector.get(DesktopConfirmService);
}

describe('DesktopConfirmService', () => {
    it('opens a confirm request and resolves it through the confirm callback', async () => {
        const service = createService();
        const opened: IConfirmPartMethodOptions[][] = [];
        const sub = service.confirmOptions$.subscribe((options) => opened.push(options));

        const promise = service.confirm({ id: 'save-confirm', children: 'Save changes?' });
        opened.at(-1)?.[0].onConfirm?.();

        await expect(promise).resolves.toBe(true);
        expect(opened.at(-1)).toEqual([]);
        sub.unsubscribe();
    });

    it('registers the global confirm UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([DesktopConfirmService]);

        injector.get(DesktopConfirmService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
