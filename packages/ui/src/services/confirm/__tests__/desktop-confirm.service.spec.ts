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

    it('updates duplicate confirm ids and resolves close callbacks as cancellation', async () => {
        const service = createService();
        const snapshots: IConfirmPartMethodOptions[][] = [];
        const sub = service.confirmOptions$.subscribe((options) => snapshots.push(options));

        const disposable = service.open({ id: 'save-confirm', children: 'Save changes?' });
        service.open({ id: 'save-confirm', children: 'Discard changes?' });
        service.close('save-confirm');

        expect(snapshots.at(-2)?.[0]).toMatchObject({ id: 'save-confirm', children: 'Discard changes?', visible: true });
        expect(snapshots.at(-1)?.[0]).toMatchObject({ id: 'save-confirm', visible: false });

        const promise = service.confirm({ id: 'cancel-confirm', children: 'Cancel?' });
        snapshots.at(-1)?.find((item) => item.id === 'cancel-confirm')?.onClose?.();
        await expect(promise).resolves.toBe(false);

        disposable.dispose();
        expect(snapshots.at(-1)).toEqual([]);
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
