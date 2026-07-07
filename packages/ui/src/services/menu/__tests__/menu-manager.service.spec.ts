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

import type { MenuSchemaType } from '../menu-manager.service';
import { ConfigService, IConfigService, Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { isMenuButtonSelectorItem, isMenuSelectorItem, MenuItemType } from '../menu';
import { IMenuManagerService, MenuManagerService } from '../menu-manager.service';

function createService(): IMenuManagerService {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    return injector.get(IMenuManagerService);
}

describe('MenuManagerService', () => {
    it('appends command menus and returns them in display order', () => {
        const service = createService();

        service.appendRootMenu({
            testPosition: {
                second: { order: 2, menuItemFactory: () => ({ id: 'second' }) },
                first: { order: 1, menuItemFactory: () => ({ id: 'first' }) },
            },
        } as MenuSchemaType);

        expect(service.getMenuByPositionKey('testPosition').map((item) => item.key)).toEqual(['first', 'second']);
        expect(service.getFlatMenuByPositionKey('testPosition').map((item) => item.item?.id)).toEqual(['first', 'second']);
    });

    it('merges menu contributions into existing positions and emits a change event', () => {
        const service = createService();
        const changes: void[] = [];
        const sub = service.menuChanged$.subscribe((value) => changes.push(value));

        service.appendRootMenu({ testMerge: { group: { order: 1 } } } as MenuSchemaType);
        service.mergeMenu({ group: { command: { order: 1, menuItemFactory: () => ({ id: 'command' }) } } } as MenuSchemaType);

        expect(service.getFlatMenuByPositionKey('testMerge').map((item) => item.key)).toEqual(['group', 'command']);
        expect(changes.length).toBeGreaterThanOrEqual(2);
        sub.unsubscribe();
    });

    it('returns an empty array for missing menu positions', () => {
        const service = createService();

        expect(service.getMenuByPositionKey('missing-position')).toEqual([]);
        expect(service.getFlatMenuByPositionKey('missing-position')).toEqual([]);
    });

    it('identifies selector menu item variants used by menu renderers', () => {
        expect(isMenuSelectorItem({ id: 'font-family', type: MenuItemType.SELECTOR })).toBe(true);
        expect(isMenuSelectorItem({ id: 'more-actions', type: MenuItemType.SUBITEMS })).toBe(true);
        expect(isMenuSelectorItem({ id: 'copy', type: MenuItemType.BUTTON })).toBe(false);
        expect(isMenuButtonSelectorItem({ id: 'fill-color', type: MenuItemType.BUTTON_SELECTOR })).toBe(true);
    });
});
