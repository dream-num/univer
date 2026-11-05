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
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { ShortcutPanelComponentName } from '../../commands/operations/toggle-shortcut-panel.operation';
import { DesktopSidebarService } from '../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../services/sidebar/sidebar.service';
import { ShortcutPanelMenuItemFactory } from '../shortcut-panel.menu';

describe('ShortcutPanelMenuItemFactory activation', () => {
    it('tracks opening, replacement, closing, and late subscribers', async () => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([ISidebarService, { useClass: DesktopSidebarService }]);

        const sidebar = injector.get(ISidebarService);
        const menu = ShortcutPanelMenuItemFactory(injector);
        let activated: boolean | undefined;
        const subscription = menu.activated$?.subscribe((value) => {
            activated = value;
        });
        onTestFinished(() => subscription?.unsubscribe());
        expect(activated).toBe(false);

        sidebar.open({ children: { label: ShortcutPanelComponentName } });
        expect(activated).toBe(true);
        expect(await firstValueFrom(menu.activated$!)).toBe(true);

        sidebar.open({ id: 'another-panel', children: { label: 'another-panel' } });
        expect(activated).toBe(false);

        sidebar.open({ children: { label: ShortcutPanelComponentName } });
        sidebar.close();
        expect(activated).toBe(false);
    });
});
