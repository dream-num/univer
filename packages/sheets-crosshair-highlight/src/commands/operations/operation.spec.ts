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

import { MenuItemType } from '@univerjs/ui';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CrosshairHighlightMenuItemFactory } from '../../menu/crosshair.menu';
import { menuSchema } from '../../menu/schema';
import {
    SheetsCrosshairHighlightService,
} from '../../services/crosshair.service';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from './operation';

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

function createThemeService() {
    return {
        currentTheme$: of({}),
        getColorFromTheme: vi.fn((path: string) => ({
            'highlight.background.1': { color: 'purple.500', alpha: 0.3 },
            'highlight.background.2': { color: 'red.500', alpha: 0.15 },
            'purple.500': '#010203',
            'red.500': '#040506',
        })[path]),
    };
}

describe('crosshair operations/menu/service', () => {
    it('should handle service state changes and dispose', () => {
        const service = new SheetsCrosshairHighlightService(createThemeService() as never);
        expect(service.enabled).toBe(false);

        service.setEnabled(true);
        expect(service.enabled).toBe(true);

        service.dispose();
    });

    it('should execute operation handlers with branch coverage', () => {
        const service = new SheetsCrosshairHighlightService(createThemeService() as never);
        const accessor = { get: vi.fn(() => service) };

        expect(ToggleCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(service.enabled).toBe(true);

        service.setEnabled(false);
        expect(EnableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(EnableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(false);

        expect(DisableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(DisableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(false);

        expect(SetCrosshairHighlightColorOperation.handler(accessor as never, { value: 'highlight.background.2' })).toBe(true);
        expect(service.enabled).toBe(true);
    });

    it('should create menu item schema and factory output', () => {
        const service = new SheetsCrosshairHighlightService(createThemeService() as never);
        service.setEnabled(true);
        const accessor = { get: vi.fn(() => service) };

        const item = CrosshairHighlightMenuItemFactory(accessor as never);
        expect(item.id).toBe(ToggleCrosshairHighlightOperation.id);
        expect(item.type).toBe(MenuItemType.BUTTON_SELECTOR);
        expect(item.selectionsCommandId).toBe(SetCrosshairHighlightColorOperation.id);
        expect(item.selections).toHaveLength(1);
        expect(item.activated$).toBe(service.enabled$);
        expect(item.hidden$).toBeDefined();

        const firstLevel = Object.values(menuSchema)[0] as Record<string, Record<string, unknown>>;
        const secondLevel = Object.values(firstLevel)[0] as Record<string, { menuItemFactory: unknown; order: number }>;
        expect(secondLevel[ToggleCrosshairHighlightOperation.id].menuItemFactory).toBe(CrosshairHighlightMenuItemFactory);
        expect(secondLevel[ToggleCrosshairHighlightOperation.id].order).toBe(0);

        expect(accessor.get).toHaveBeenCalledWith(service.constructor);
    });
});
