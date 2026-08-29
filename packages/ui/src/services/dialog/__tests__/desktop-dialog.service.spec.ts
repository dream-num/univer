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

import type { IDialogPartMethodOptions } from '../../../views/components/dialog-part/interface';
import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { BuiltInUIPart, IUIPartsService, UIPartsService } from '../../parts/parts.service';
import { DesktopDialogService } from '../desktop-dialog.service';
import { IDialogService } from '../dialog.service';

function createService(): IDialogService {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: DesktopDialogService }]);
    return injector.get(IDialogService);
}

describe('DesktopDialogService', () => {
    it('tracks opened dialogs and closes only the requested dialog', () => {
        const service = createService();
        const snapshots: IDialogPartMethodOptions[][] = [];
        const sub = service.getDialogs$().subscribe((options) => snapshots.push(options));

        service.open({ id: 'first' });
        service.open({ id: 'second' });
        service.close('first');

        expect(snapshots.at(-1)).toMatchObject([{ id: 'first', open: false }, { id: 'second', open: true }]);
        sub.unsubscribe();
    });

    it('keeps excepted dialogs open when closing all', () => {
        const service = createService();
        const snapshots: IDialogPartMethodOptions[][] = [];
        const sub = service.getDialogs$().subscribe((options) => snapshots.push(options));

        service.open({ id: 'first' });
        service.open({ id: 'second' });
        service.closeAll(['second']);

        expect(snapshots.at(-1)).toMatchObject([{ id: 'first', open: false }, { id: 'second', open: true }]);
        sub.unsubscribe();
    });

    it('registers the global dialog UI part when constructed', () => {
        const injector = new Injector();
        injector.add([IUIPartsService, { useClass: UIPartsService }]);
        injector.add([IDialogService, { useClass: DesktopDialogService }]);

        injector.get(IDialogService);
        expect(injector.get(IUIPartsService).getComponents(BuiltInUIPart.GLOBAL).size).toBe(1);
    });
});
