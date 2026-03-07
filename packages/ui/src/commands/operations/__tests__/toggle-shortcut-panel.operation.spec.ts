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

import type { IAccessor } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ShortcutPanelService } from '../../../services/shortcut/shortcut-panel.service';
import { ISidebarService } from '../../../services/sidebar/sidebar.service';
import { ShortcutPanelComponentName, ToggleShortcutPanelOperation } from '../toggle-shortcut-panel.operation';

function createAccessor(isOpen: boolean) {
    const shortcutPanelService = {
        isOpen,
        open: vi.fn(),
        close: vi.fn(),
    } as unknown as ShortcutPanelService;

    const sidebarService = {
        open: vi.fn(),
        close: vi.fn(),
    };

    const accessor = {
        get: (token: unknown) => {
            if (token === ShortcutPanelService) return shortcutPanelService;
            if (token === ISidebarService) return sidebarService;
            throw new Error('Unknown token');
        },
    } as unknown as IAccessor;

    return { accessor, shortcutPanelService, sidebarService };
}

describe('ToggleShortcutPanelOperation', () => {
    it('should close shortcut panel and sidebar when panel is open', () => {
        const { accessor, shortcutPanelService, sidebarService } = createAccessor(true);

        expect(ToggleShortcutPanelOperation.handler!(accessor, {})).toBe(true);
        expect(shortcutPanelService.close).toHaveBeenCalledOnce();
        expect(sidebarService.close).toHaveBeenCalledOnce();
        expect(sidebarService.open).not.toHaveBeenCalled();
    });

    it('should open shortcut panel and sidebar when panel is closed', () => {
        const { accessor, shortcutPanelService, sidebarService } = createAccessor(false);

        expect(ToggleShortcutPanelOperation.handler!(accessor, {})).toBe(true);
        expect(shortcutPanelService.open).toHaveBeenCalledOnce();
        expect(sidebarService.open).toHaveBeenCalledWith({
            header: { title: 'shortcut-panel.title' },
            children: { label: ShortcutPanelComponentName },
        });
    });
});
