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

/* eslint-disable import/first */

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@univerjs/ui', async () => {
    const actual = await vi.importActual<typeof import('@univerjs/ui')>('@univerjs/ui');
    return {
        ...actual,
        getMenuHiddenObservable: vi.fn(() => of(false)),
    };
});

import { MenuItemType } from '@univerjs/ui';
import {
    CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT,
    CrosshairHighlightMenuItemFactory,
} from '../../controllers/crosshair.menu';
import { menuSchema } from '../../controllers/menu.schema';
import {
    CROSSHAIR_HIGHLIGHT_COLORS,
    SheetsCrosshairHighlightService,
} from '../../services/crosshair.service';
import {
    DisableCrosshairHighlightOperation,
    EnableCrosshairHighlightOperation,
    SetCrosshairHighlightColorOperation,
    ToggleCrosshairHighlightOperation,
} from './operation';

describe('crosshair operations/menu/service', () => {
    it('should handle service state changes and dispose', () => {
        const service = new SheetsCrosshairHighlightService();
        expect(service.enabled).toBe(false);
        expect(service.color).toBe(CROSSHAIR_HIGHLIGHT_COLORS[0]);

        service.setEnabled(true);
        service.setColor(CROSSHAIR_HIGHLIGHT_COLORS[1]);
        expect(service.enabled).toBe(true);
        expect(service.color).toBe(CROSSHAIR_HIGHLIGHT_COLORS[1]);

        service.dispose();
    });

    it('should execute operation handlers with branch coverage', () => {
        const service = new SheetsCrosshairHighlightService();
        const accessor = { get: vi.fn(() => service) };

        expect(ToggleCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(service.enabled).toBe(true);

        service.setEnabled(false);
        expect(SetCrosshairHighlightColorOperation.handler(accessor as never, { value: 'rgba(0,0,0,0.1)' })).toBe(true);
        expect(service.enabled).toBe(true);
        expect(service.color).toBe('rgba(0,0,0,0.1)');
        expect(SetCrosshairHighlightColorOperation.handler(accessor as never, { value: 'rgba(0,0,0,0.2)' })).toBe(true);

        expect(EnableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(false);
        service.setEnabled(false);
        expect(EnableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);

        expect(DisableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(true);
        expect(DisableCrosshairHighlightOperation.handler(accessor as never, undefined as never)).toBe(false);
    });

    it('should create menu item schema and factory output', () => {
        const service = new SheetsCrosshairHighlightService();
        service.setEnabled(true);
        const accessor = { get: vi.fn(() => service) };

        const item = CrosshairHighlightMenuItemFactory(accessor as never);
        expect(item.id).toBe(ToggleCrosshairHighlightOperation.id);
        expect(item.type).toBe(MenuItemType.BUTTON_SELECTOR);
        const itemSelections = (item as unknown as { selections: Array<{ label: { name: string } }> }).selections;
        expect(itemSelections[0].label.name).toBe(CROSSHAIR_HIGHLIGHT_OVERLAY_COMPONENT);
        expect(item.selectionsCommandId).toBe(SetCrosshairHighlightColorOperation.id);
        expect(item.activated$).toBe(service.enabled$);
        expect(item.hidden$).toBeDefined();

        const firstLevel = Object.values(menuSchema)[0] as Record<string, Record<string, unknown>>;
        const secondLevel = Object.values(firstLevel)[0] as Record<string, { menuItemFactory: unknown; order: number }>;
        expect(secondLevel[ToggleCrosshairHighlightOperation.id].menuItemFactory).toBe(CrosshairHighlightMenuItemFactory);
        expect(secondLevel[ToggleCrosshairHighlightOperation.id].order).toBe(0);

        expect(accessor.get).toHaveBeenCalledWith(service.constructor);
    });
});
