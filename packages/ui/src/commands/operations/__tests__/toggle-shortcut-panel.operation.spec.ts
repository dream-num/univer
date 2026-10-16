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
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShortcutPanelService } from '../../../services/shortcut/shortcut-panel.service';
import { DesktopSidebarService } from '../../../services/sidebar/desktop-sidebar.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { ShortcutPanelComponentName, ToggleShortcutPanelOperation } from '../toggle-shortcut-panel.operation';

describe('ToggleShortcutPanelOperation', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector([
            [ShortcutPanelService],
            [ISidebarService, { useClass: DesktopSidebarService }],
        ]);
    });

    afterEach(() => injector.dispose());

    it('should close shortcut panel and sidebar when toggled twice', () => {
        const shortcutPanelService = injector.get(ShortcutPanelService);
        const sidebarService = injector.get(ISidebarService);

        ToggleShortcutPanelOperation.handler!(injector, {});

        expect(ToggleShortcutPanelOperation.handler!(injector, {})).toBe(true);
        expect(shortcutPanelService.isOpen).toBe(false);
        expect(sidebarService.visible).toBe(false);
    });

    it('should open shortcut panel and sidebar when panel is closed', () => {
        const shortcutPanelService = injector.get(ShortcutPanelService);
        const sidebarService = injector.get(ISidebarService);

        expect(ToggleShortcutPanelOperation.handler!(injector, {})).toBe(true);
        expect(shortcutPanelService.isOpen).toBe(true);
        expect(sidebarService.options).toMatchObject({
            visible: true,
            header: { title: 'ui.shortcut-panel.title' },
            children: { label: ShortcutPanelComponentName },
        });
    });

    it('should reopen on the first toggle after the sidebar is closed directly', () => {
        const shortcutPanelService = injector.get(ShortcutPanelService);
        const sidebarService = injector.get(ISidebarService);

        ToggleShortcutPanelOperation.handler!(injector, {});
        sidebarService.close();

        expect(shortcutPanelService.isOpen).toBe(false);

        ToggleShortcutPanelOperation.handler!(injector, {});

        expect(sidebarService.visible).toBe(true);
        expect(sidebarService.options.children?.label).toBe(ShortcutPanelComponentName);
    });
});
