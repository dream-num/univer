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
import { DocumentDataModel, SlideDataModel, UniverInstanceType, Workbook } from '@univerjs/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopLayoutService, FOCUSING_UNIVER } from '../layout/layout.service';
import { MenuItemType } from '../menu/menu';
import { MenuManagerService } from '../menu/menu-manager.service';
import { RibbonPosition, RibbonStartGroup } from '../menu/types';
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

        const historyMenu = service.getMenuByPositionKey(RibbonStartGroup.HISTORY);
        const flatHistory = service.getFlatMenuByPositionKey(RibbonStartGroup.HISTORY);
        const customRoot = service.getMenuByPositionKey('customRoot');
        const mergedCustomItem = flatHistory.find((item) => item.item?.id === 'customItem');

        expect(changed).toHaveBeenCalled();
        expect(invoke).toHaveBeenCalled();
        expect(historyMenu.length).toBeGreaterThan(0);
        expect(flatHistory.length).toBeGreaterThanOrEqual(historyMenu.length);
        expect(mergedCustomItem?.item?.tooltip).toBe('tooltip-from-config');
        expect(customRoot.length).toBe(1);

        const complete = vi.fn();
        service.menuChanged$.subscribe({ complete });
        service.dispose();
        expect(complete).toHaveBeenCalledTimes(1);
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

describe('DesktopLayoutService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register handlers/containers and update focus context', async () => {
        const contextService = {
            setContextValue: vi.fn(),
        };

        const workbook = Object.create(Workbook.prototype);
        workbook.getUnitId = vi.fn(() => 'sheet-1');

        const documentModel = Object.create(DocumentDataModel.prototype);
        documentModel.getUnitId = vi.fn(() => 'doc-1');

        const slideModel = Object.create(SlideDataModel.prototype);
        slideModel.getUnitId = vi.fn(() => 'slide-1');

        const instanceService = {
            getFocusedUnit: vi.fn(() => workbook),
        };

        const service = new DesktopLayoutService(contextService as any, instanceService as any);

        const root = document.createElement('div');
        const content = document.createElement('div');
        const outside = document.createElement('div');
        root.appendChild(content);
        document.body.appendChild(root);
        document.body.appendChild(outside);

        const sheetFocus = vi.fn();
        const docFocus = vi.fn();
        const slideFocus = vi.fn();

        const sheetDis = service.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, sheetFocus);
        service.registerFocusHandler(UniverInstanceType.UNIVER_DOC, docFocus);
        service.registerFocusHandler(UniverInstanceType.UNIVER_SLIDE, slideFocus);

        expect(() => service.registerFocusHandler(UniverInstanceType.UNIVER_SHEET, vi.fn())).toThrow();

        const rootDis = service.registerRootContainerElement(root);
        const contentDis = service.registerContentElement(content);
        const containerDis = service.registerContainerElement(outside);

        expect(service.rootContainerElement).toBe(root);
        expect(service.getContentElement()).toBe(content);
        expect(service.checkElementInCurrentContainers(content)).toBe(true);
        expect(service.checkElementInCurrentContainers(outside)).toBe(true);

        content.tabIndex = 0;
        content.focus();
        expect(service.checkContentIsFocused()).toBe(true);

        service.focus();
        expect(sheetFocus).toHaveBeenCalledWith('sheet-1');

        instanceService.getFocusedUnit.mockReturnValueOnce(documentModel);
        service.focus();
        expect(docFocus).toHaveBeenCalledWith('doc-1');

        instanceService.getFocusedUnit.mockReturnValueOnce(slideModel);
        service.focus();
        expect(slideFocus).toHaveBeenCalledWith('slide-1');

        instanceService.getFocusedUnit.mockReturnValueOnce(null);
        service.focus();

        const returningFocusTarget = document.createElement('button');
        returningFocusTarget.dataset.uComp = 'button';
        root.appendChild(returningFocusTarget);
        returningFocusTarget.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        await Promise.resolve();
        expect(sheetFocus).toHaveBeenCalledTimes(2);

        outside.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(service.isFocused).toBe(true);

        document.body.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(service.isFocused).toBe(false);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_UNIVER, false);

        expect(() => service.registerContentElement(content)).toThrow();
        expect(() => service.registerContainerElement(outside)).toThrow();
        expect(() => service.registerRootContainerElement(document.createElement('div'))).toThrow();

        sheetDis.dispose();
        containerDis.dispose();
        contentDis.dispose();
        rootDis.dispose();
        service.dispose();
    });
});
