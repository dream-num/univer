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

import type { IMenuButtonItem } from '../menu/menu';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MenuItemType } from '../menu/menu';
import { MenuManagerService } from '../menu/menu-manager.service';
import { ContextMenuGroup, ContextMenuPosition, MenuManagerPosition, RibbonPosition, RibbonStartGroup } from '../menu/types';
import { UIPartsService } from '../parts/parts.service';
import { DesktopRibbonService } from '../ribbon/ribbon.service';

describe('MenuManagerService', () => {
    it('should merge and append menu, then build tree and flat schemas', () => {
        const invoke = vi.fn((factory: any) => factory({}));
        const configService = {
            getConfig: vi.fn(() => ({
                customItem: {
                    tooltip: 'tooltip-from-config',
                },
            })),
        };
        const service = new MenuManagerService({ invoke } as any, configService as any);
        const changed = vi.fn();
        service.menuChanged$.subscribe(changed);

        const customFactory = () => ({
            id: 'customItem',
            type: MenuItemType.BUTTON,
            title: 'from-factory',
            tooltip: 'factory-tooltip',
        } as IMenuButtonItem);

        service.mergeMenu({
            [RibbonPosition.START]: {
                [RibbonStartGroup.HISTORY]: {
                    customItem: {
                        order: 1,
                        title: 'history-item',
                        menuItemFactory: customFactory,
                    },
                },
            },
        });

        service.appendRootMenu({
            customRoot: {
                order: 1,
                testGroup: {
                    order: 1,
                    customItem: {
                        order: 1,
                        menuItemFactory: customFactory,
                    },
                },
            },
        });

        service.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                contextualTab: {
                    order: 99,
                    contextual: true,
                    contextualGroup: {
                        order: 0,
                        customItem: {
                            order: 1,
                            menuItemFactory: customFactory,
                        },
                    },
                },
            },
        });

        const historyMenu = service.getMenuByPositionKey(RibbonStartGroup.HISTORY);
        const flatHistory = service.getFlatMenuByPositionKey(RibbonStartGroup.HISTORY);
        const customRoot = service.getMenuByPositionKey('customRoot');
        const ribbonMenu = service.getMenuByPositionKey(MenuManagerPosition.RIBBON);
        const mergedCustomItem = flatHistory.find((item) => item.item?.id === 'customItem');

        expect(changed).toHaveBeenCalled();
        expect(invoke).toHaveBeenCalled();
        expect(historyMenu.length).toBeGreaterThan(0);
        expect(flatHistory.length).toBeGreaterThanOrEqual(historyMenu.length);
        expect(mergedCustomItem?.item?.tooltip).toBe('tooltip-from-config');
        expect(customRoot.length).toBe(1);
        expect(ribbonMenu.find((item) => item.key === 'contextualTab')?.contextual).toBe(true);

        const complete = vi.fn();
        service.menuChanged$.subscribe({ complete });
        service.dispose();
        expect(complete).toHaveBeenCalledTimes(1);
    });

    it('sorts menu groups by order after independent merges', () => {
        const service = new MenuManagerService({ invoke: vi.fn((factory: any) => factory({})) } as any, { getConfig: vi.fn() } as any);

        service.mergeMenu({
            [ContextMenuPosition.PARAGRAPH]: {
                emptyParagraph: {
                    [ContextMenuGroup.LAYOUT]: {
                        order: 1,
                        layoutItem: {
                            order: 0,
                            menuItemFactory: () => ({
                                id: 'layoutItem',
                                type: MenuItemType.BUTTON,
                            } as IMenuButtonItem),
                        },
                    },
                },
            },
        });
        service.mergeMenu({
            [ContextMenuPosition.PARAGRAPH]: {
                emptyParagraph: {
                    [ContextMenuGroup.QUICK]: {
                        order: -1,
                        quickItem: {
                            order: 0,
                            menuItemFactory: () => ({
                                id: 'quickItem',
                                type: MenuItemType.BUTTON,
                            } as IMenuButtonItem),
                        },
                    },
                },
            },
        });

        expect(service.getMenuByPositionKey('emptyParagraph').map((item) => item.key)).toEqual([
            ContextMenuGroup.QUICK,
            ContextMenuGroup.LAYOUT,
        ]);
    });
});

describe('DesktopRibbonService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should update states and filter hidden ribbon items', () => {
        const hidden$ = new BehaviorSubject(false);
        let ribbonData: any[] = [
            {
                key: 'group',
                order: 0,
                children: [
                    {
                        key: 'item',
                        order: 0,
                        children: [
                            {
                                key: 'child',
                                order: 0,
                                item: {
                                    id: 'id-1',
                                    type: MenuItemType.BUTTON,
                                    hidden$,
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        const menuChanged$ = new Subject<void>();
        const focused$ = new Subject<any>();
        const menuManagerService = {
            menuChanged$,
            getMenuByPositionKey: vi.fn(() => ribbonData),
        };
        const univerInstanceService = {
            focused$,
        };

        const service = new DesktopRibbonService(menuManagerService as any, univerInstanceService as any);

        let activatedTab = '';
        let collapsedIds: string[] = [];
        let fakeToolbarVisible = false;
        let currentRibbon: any[] = [];

        service.activatedTab$.subscribe((v) => (activatedTab = v));
        service.collapsedIds$.subscribe((v) => (collapsedIds = v));
        service.fakeToolbarVisible$.subscribe((v) => (fakeToolbarVisible = v));
        service.ribbon$.subscribe((v) => (currentRibbon = v));

        service.setActivatedTab(RibbonPosition.INSERT);
        service.setCollapsedIds(['x', 'y']);
        service.setFakeToolbarVisible(true);
        menuChanged$.next();

        expect(activatedTab).toBe(RibbonPosition.INSERT);
        expect(collapsedIds).toEqual(['x', 'y']);
        expect(fakeToolbarVisible).toBe(true);
        expect(currentRibbon.length).toBe(1);

        hidden$.next(true);
        focused$.next('unit');
        expect(currentRibbon).toEqual([]);

        ribbonData = [
            {
                key: 'plain',
                order: 0,
                children: [],
            },
        ];
        menuChanged$.next();
        expect(currentRibbon[0].key).toBe('plain');

        service.dispose();
    });

    it('should show, activate, and restore contextual ribbon tabs', () => {
        const ribbonData: any[] = [
            {
                key: RibbonPosition.START,
                order: 0,
                children: [
                    {
                        key: RibbonStartGroup.HISTORY,
                        order: 0,
                        children: [
                            {
                                key: 'home-child',
                                order: 0,
                                item: {
                                    id: 'home-child',
                                    type: MenuItemType.BUTTON,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                key: RibbonPosition.INSERT,
                order: 1,
                children: [
                    {
                        key: 'insert-group',
                        order: 0,
                        children: [
                            {
                                key: 'insert-child',
                                order: 0,
                                item: {
                                    id: 'insert-child',
                                    type: MenuItemType.BUTTON,
                                },
                            },
                        ],
                    },
                ],
            },
            {
                key: 'contextual.shape',
                order: 100,
                contextual: true,
                children: [
                    {
                        key: 'contextual-group',
                        order: 0,
                        children: [
                            {
                                key: 'contextual-child',
                                order: 0,
                                item: {
                                    id: 'contextual-child',
                                    type: MenuItemType.BUTTON,
                                },
                            },
                        ],
                    },
                ],
            },
        ];

        const menuChanged$ = new Subject<void>();
        const focused$ = new Subject<any>();
        const menuManagerService = {
            menuChanged$,
            getMenuByPositionKey: vi.fn(() => ribbonData),
        };
        const univerInstanceService = {
            focused$,
        };

        const service = new DesktopRibbonService(menuManagerService as any, univerInstanceService as any);

        let activatedTab = '';
        let currentRibbon: any[] = [];

        service.activatedTab$.subscribe((v) => (activatedTab = v));
        service.ribbon$.subscribe((v) => (currentRibbon = v));

        expect(currentRibbon.map((item) => item.key)).toEqual([RibbonPosition.START, RibbonPosition.INSERT]);

        service.setActivatedTab(RibbonPosition.INSERT);
        service.showContextualTab('contextual.shape', { activate: true });

        expect(currentRibbon.map((item) => item.key)).toEqual([
            RibbonPosition.START,
            RibbonPosition.INSERT,
            'contextual.shape',
        ]);
        expect(activatedTab).toBe('contextual.shape');

        service.hideContextualTab('contextual.shape');

        expect(currentRibbon.map((item) => item.key)).toEqual([RibbonPosition.START, RibbonPosition.INSERT]);
        expect(activatedTab).toBe(RibbonPosition.INSERT);

        service.showContextualTab('contextual.shape');
        expect(activatedTab).toBe(RibbonPosition.INSERT);

        service.setActivatedTab('contextual.shape');
        service.hideAllContextualTabs();

        expect(currentRibbon.map((item) => item.key)).toEqual([RibbonPosition.START, RibbonPosition.INSERT]);
        expect(activatedTab).toBe(RibbonPosition.INSERT);

        service.dispose();
    });
});

describe('UIPartsService', () => {
    it('should register components and manage visibility', () => {
        const service = new UIPartsService();
        const registered: string[] = [];
        service.componentRegistered$.subscribe((part) => registered.push(part));

        const Comp = () => null;
        const dis = service.registerComponent('toolbar', () => Comp);

        expect(service.getComponents('toolbar').size).toBe(1);

        service.setUIVisible('toolbar', false);
        expect(service.isUIVisible('toolbar')).toBe(false);
        expect(service.isUIVisible('never-set')).toBe(true);

        dis.dispose();
        expect(service.getComponents('toolbar').size).toBe(0);
        expect(registered.length).toBeGreaterThanOrEqual(2);

        service.dispose();
    });
});
