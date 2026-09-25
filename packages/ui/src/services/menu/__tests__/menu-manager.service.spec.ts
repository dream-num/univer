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

import type { MenuConfig } from '../menu';
import { ConfigService, IConfigService, Injector } from '@univerjs/core';

import { describe, expect, it } from 'vitest';
import { isMenuButtonSelectorItem, isMenuSelectorItem, MenuItemType } from '../menu';
import { IMenuManagerService, MenuManagerService } from '../menu-manager.service';
import { FloatingObjectToolbarPosition, MenuManagerPosition, RibbonPosition, RibbonStartGroup } from '../types';

function createInjector(): Injector {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    return injector;
}

describe('MenuManagerService', () => {
    it('appends command menus and returns them in display order', () => {
        const service = createInjector().get(IMenuManagerService);

        service.appendRootMenu({
            testPosition: {
                second: { order: 2, menuItemFactory: () => ({ id: 'second', type: MenuItemType.BUTTON }) },
                first: { order: 1, menuItemFactory: () => ({ id: 'first', type: MenuItemType.BUTTON }) },
            },
        });

        expect(service.getMenuByPositionKey('testPosition').map((item) => item.key)).toEqual(['first', 'second']);
        expect(service.getFlatMenuByPositionKey('testPosition').map((item) => item.item?.id)).toEqual(['first', 'second']);
    });

    it('merges menu contributions into existing positions and emits a change event', () => {
        const service = createInjector().get(IMenuManagerService);
        const changes: void[] = [];
        const sub = service.menuChanged$.subscribe((value) => changes.push(value));

        service.appendRootMenu({ testMerge: { group: { order: 1 } } });
        service.mergeMenu({ group: { command: { order: 1, menuItemFactory: () => ({ id: 'command', type: MenuItemType.BUTTON }) } } });

        expect(service.getFlatMenuByPositionKey('testMerge').map((item) => item.key)).toEqual(['group', 'command']);
        expect(changes.length).toBeGreaterThanOrEqual(2);
        sub.unsubscribe();
    });

    it.each(Object.values(FloatingObjectToolbarPosition))('accepts contributions for %s', (position) => {
        const service = createInjector().get(IMenuManagerService);

        service.mergeMenu({
            [position]: {
                comment: { order: 1, menuItemFactory: () => ({ id: 'comment', type: MenuItemType.BUTTON }) },
            },
        });

        expect(service.getFlatMenuByPositionKey(position).map((item) => item.item?.id)).toEqual(['comment']);
    });

    it('removes menu nodes by key from every position and emits a change event', () => {
        const service = createInjector().get(IMenuManagerService);
        const changes: void[] = [];

        service.appendRootMenu({
            firstPosition: { group: { order: 0 } },
            secondPosition: { group: { order: 0 } },
        });
        service.mergeMenu({
            group: {
                keep: { order: 0, menuItemFactory: () => ({ id: 'keep', type: MenuItemType.BUTTON }) },
                custom: {
                    order: 1,
                    menuItemFactory: () => ({ id: 'custom', type: MenuItemType.SUBITEMS }),
                    child: { order: 0, menuItemFactory: () => ({ id: 'child', type: MenuItemType.BUTTON }) },
                },
            },
        });
        expect(service.getFlatMenuByPositionKey('firstPosition').map((item) => item.key)).toEqual(['group', 'keep', 'custom', 'child']);
        expect(service.getFlatMenuByPositionKey('secondPosition').map((item) => item.key)).toEqual(['group', 'keep', 'custom', 'child']);

        const sub = service.menuChanged$.subscribe((value) => changes.push(value));
        expect(service.removeMenu('custom')).toBe(true);

        expect(changes).toHaveLength(1);
        expect(service.getFlatMenuByPositionKey('firstPosition').map((item) => item.key)).toEqual(['group', 'keep']);
        expect(service.getFlatMenuByPositionKey('secondPosition').map((item) => item.key)).toEqual(['group', 'keep']);

        expect(service.removeMenu('custom')).toBe(false);
        expect(service.removeMenu('missing')).toBe(false);
        expect(changes).toHaveLength(1);
        sub.unsubscribe();
    });

    it('returns an empty array for missing menu positions', () => {
        const service = createInjector().get(IMenuManagerService);

        expect(service.getMenuByPositionKey('missing-position')).toEqual([]);
        expect(service.getFlatMenuByPositionKey('missing-position')).toEqual([]);
    });

    it('identifies selector menu item variants used by menu renderers', () => {
        expect(isMenuSelectorItem({ id: 'font-family', type: MenuItemType.SELECTOR })).toBe(true);
        expect(isMenuSelectorItem({ id: 'more-actions', type: MenuItemType.SUBITEMS })).toBe(true);
        expect(isMenuSelectorItem({ id: 'copy', type: MenuItemType.BUTTON })).toBe(false);
        expect(isMenuButtonSelectorItem({ id: 'fill-color', type: MenuItemType.BUTTON_SELECTOR })).toBe(true);
    });

    it('applies configured tab, group, and item order to menus registered later', () => {
        const injector = createInjector();
        const service = injector.get(IMenuManagerService);
        injector.get(IConfigService).setConfig('menu', {
            [RibbonPosition.INSERT]: { order: -1 },
            [RibbonStartGroup.FORMAT]: { order: -1 },
            font: { order: 2, gridLayout: { row: 2, column: 1, width: 120 } },
        } satisfies MenuConfig);

        service.mergeMenu({
            [RibbonPosition.START]: {
                [RibbonStartGroup.HISTORY]: {
                    undo: { order: 0, menuItemFactory: () => ({ id: 'undo', type: MenuItemType.BUTTON }) },
                },
                [RibbonStartGroup.FORMAT]: {
                    fontMenu: {
                        order: 0,
                        gridLayout: { row: 1, column: 1, columnSpan: 2, showLabel: true, width: 180 },
                        menuItemFactory: () => ({ id: 'font', type: MenuItemType.SELECTOR }),
                    },
                    bold: { order: 1, menuItemFactory: () => ({ id: 'bold', type: MenuItemType.BUTTON }) },
                },
            },
            [RibbonPosition.INSERT]: {
                custom: {
                    order: 0,
                    image: { order: 0, menuItemFactory: () => ({ id: 'image', type: MenuItemType.BUTTON }) },
                },
            },
        });

        expect(service.getMenuByPositionKey(MenuManagerPosition.RIBBON).map((tab) => tab.key)).toEqual([
            RibbonPosition.INSERT,
            RibbonPosition.START,
        ]);
        expect(service.getMenuByPositionKey(RibbonPosition.START).map((group) => group.key)).toEqual([
            RibbonStartGroup.FORMAT,
            RibbonStartGroup.HISTORY,
        ]);
        const items = service.getMenuByPositionKey(RibbonStartGroup.FORMAT);
        expect(items.map((item) => item.key)).toEqual(['bold', 'fontMenu']);
        expect(items[1].gridLayout).toEqual({ row: 2, column: 1, columnSpan: 2, showLabel: true, width: 120 });
    });
});
