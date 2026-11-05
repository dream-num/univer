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

import { Univer } from '@univerjs/core';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import {
    DATA_VALIDATION_PANEL,
    OpenValidationPanelOperation,
} from '../../commands/operations/data-validation.operation';
import { openDataValidationMenuFactory } from '../dv.menu';

describe('data validation menu', () => {
    it('passes the empty parameter object required to open the manager', () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
        expect(openDataValidationMenuFactory(injector)).toMatchObject({
            id: OpenValidationPanelOperation.id,
            params: {},
        });
    });
});

describe('openDataValidationMenuFactory activation', () => {
    it('tracks opening, replacement, closing, and late subscribers', async () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);

        const sidebar = injector.get(ISidebarService);
        const menu = openDataValidationMenuFactory(injector);
        let activated: boolean | undefined;
        const subscription = menu.activated$?.subscribe((value) => {
            activated = value;
        });
        onTestFinished(() => subscription?.unsubscribe());
        expect(activated).toBe(false);

        sidebar.open({ id: DATA_VALIDATION_PANEL });
        expect(activated).toBe(true);
        expect(await firstValueFrom(menu.activated$!)).toBe(true);

        sidebar.open({ id: 'another-panel', children: { label: 'another-panel' } });
        expect(activated).toBe(false);

        sidebar.open({ id: DATA_VALIDATION_PANEL });
        sidebar.close();
        expect(activated).toBe(false);
    });
});
