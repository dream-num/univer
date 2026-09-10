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

/**
 * @vitest-environment jsdom
 */

import type { ComponentType } from 'react';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { act, cleanup, render } from '@testing-library/react';
import { ICommandService, Injector, LocaleService } from '@univerjs/core';
import { connectInjector } from '@wendellhu/redi/react-bindings';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager } from '../../../../common/component-manager';
import { IconManager } from '../../../../common/icon-manager';
import { ILayoutService } from '../../../../services/layout/layout.service';
import { MenuItemType } from '../../../../services/menu/menu';
import { RibbonPosition } from '../../../../services/menu/types';
import { IRibbonOverrideService } from '../../../../services/ribbon/ribbon-override.service';
import { IRibbonService } from '../../../../services/ribbon/ribbon.service';
import { IShortcutService } from '../../../../services/shortcut/shortcut.service';
import { Ribbon } from '../Ribbon';

describe('Ribbon override chrome', () => {
    let observeCount = 0;

    beforeEach(() => {
        observeCount = 0;
        vi.stubGlobal('ResizeObserver', class {
            observe() {
                observeCount += 1;
            }

            disconnect() {}
        });
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('renders a title-only placeholder without the empty toolbar row', () => {
        const injector = new Injector([
            [ComponentManager],
            [LocaleService, { useValue: { t: (key: string) => key } }],
            [IRibbonService, { useValue: createEmptyRibbonService() }],
            [IRibbonOverrideService, {
                useValue: {
                    override$: of({
                        id: 'embed-1',
                        ribbonService: createEmptyRibbonService(),
                        placeholderTitle: 'Bases',
                        hideToolbar: true,
                    }),
                    getOverride: () => ({
                        id: 'embed-1',
                        ribbonService: createEmptyRibbonService(),
                        placeholderTitle: 'Bases',
                        hideToolbar: true,
                    }),
                    activate: () => {},
                    clear: () => {},
                },
            }],
        ]);

        const ConnectedRibbon = connectInjector(Ribbon, injector) as ComponentType<{ ribbonType: 'classic' }>;
        const { container, getByText } = render(<ConnectedRibbon ribbonType="classic" />);

        expect(getByText('Bases')).toBeTruthy();
        expect(container.querySelectorAll('[data-embed-ribbon-override="true"]')).toHaveLength(1);
        expect(observeCount).toBe(0);
    });

    it('uses the start group in simple mode when another ribbon tab is active', () => {
        const ribbon: IMenuSchema[] = [{
            key: RibbonPosition.START,
            title: 'Start',
            order: 0,
            children: [],
        }];
        const injector = new Injector([
            [ComponentManager],
            [LocaleService, { useValue: { t: (key: string) => key } }],
            [IRibbonService, { useValue: createRibbonService(ribbon, RibbonPosition.INSERT) }],
            [IRibbonOverrideService, {
                useValue: {
                    override$: of(null),
                    getOverride: () => null,
                    activate: () => {},
                    clear: () => {},
                },
            }],
        ]);

        const ConnectedRibbon = connectInjector(Ribbon, injector) as ComponentType<{ ribbonType: 'simple' }>;
        const { getByRole } = render(<ConnectedRibbon ribbonType="simple" />);

        expect(getByRole('toolbar', { name: RibbonPosition.START })).toBeTruthy();
    });

    it('collapses newly activated tab items before paint', () => {
        const resizeCallbacks: ResizeObserverCallback[] = [];
        vi.stubGlobal('ResizeObserver', class {
            constructor(callback: ResizeObserverCallback) {
                resizeCallbacks.push(callback);
            }

            observe() {}
            disconnect() {}
        });
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            if (this.dataset.uComp === 'ribbon-toolbar') {
                return { width: 120 } as DOMRect;
            }

            const fakeToolbar = this.closest('div[aria-hidden="true"]');
            const width = fakeToolbar?.classList.contains('univer-hidden') ? 0 : 50;

            return { width } as DOMRect;
        });

        const ribbon$ = new BehaviorSubject<IMenuSchema[]>([
            {
                key: RibbonPosition.START,
                order: 0,
                children: [{
                    key: 'start-group',
                    order: 0,
                    children: [{
                        key: 'start-item',
                        order: 0,
                        item: { id: 'start-item', type: MenuItemType.BUTTON, title: 'Start item' },
                    }],
                }],
            },
            {
                key: 'shape-format',
                order: 1,
                children: [{
                    key: 'shape-group',
                    order: 1,
                    children: [{
                        key: 'shape-item',
                        order: 0,
                        item: { id: 'shape-item', type: MenuItemType.BUTTON, title: 'Shape item' },
                    }, {
                        key: 'shape-item-2',
                        order: 1,
                        item: { id: 'shape-item-2', type: MenuItemType.BUTTON, title: 'Shape item 2' },
                    }],
                }],
            },
        ]);
        const activatedTab$ = new BehaviorSubject<string>(RibbonPosition.START);
        const collapsedIds$ = new BehaviorSubject<string[]>([]);
        const fakeToolbarVisible$ = new BehaviorSubject(false);
        const ribbonService = {
            ribbon$,
            activatedTab$,
            collapsedIds$,
            fakeToolbarVisible$,
            setActivatedTab: (tab: string) => activatedTab$.next(tab),
            showContextualTab: () => {},
            hideContextualTab: () => {},
            hideAllContextualTabs: () => {},
            setCollapsedIds: (ids: string[]) => collapsedIds$.next(ids),
            setFakeToolbarVisible: (visible: boolean) => fakeToolbarVisible$.next(visible),
        };
        const injector = new Injector([
            [ComponentManager],
            [IconManager, { useValue: { get: () => null } }],
            [ICommandService, { useValue: { executeCommand: () => {} } }],
            [ILayoutService, { useValue: { focus: () => {} } }],
            [LocaleService, { useValue: { t: (key: string) => key } }],
            [IRibbonService, { useValue: ribbonService }],
            [IRibbonOverrideService, {
                useValue: {
                    override$: of(null),
                    getOverride: () => null,
                    activate: () => {},
                    clear: () => {},
                },
            }],
            [IShortcutService, {
                useValue: {
                    shortcutChanged$: new Subject<void>(),
                    getShortcutDisplayOfCommand: () => null,
                },
            }],
        ]);
        const ConnectedRibbon = connectInjector(Ribbon, injector) as ComponentType<{ ribbonType: 'classic' }>;
        render(<ConnectedRibbon ribbonType="classic" />);

        act(() => resizeCallbacks[0]([{ contentRect: { width: 120 } } as ResizeObserverEntry], {} as ResizeObserver));
        expect(collapsedIds$.getValue()).toEqual([]);

        act(() => activatedTab$.next('shape-format'));

        expect(collapsedIds$.getValue()).toEqual(['shape-item-2']);
    });
});

function createEmptyRibbonService() {
    return createRibbonService([], '');
}

function createRibbonService(ribbon: IMenuSchema[], activatedTab: string) {
    return {
        ribbon$: of(ribbon),
        activatedTab$: of(activatedTab),
        collapsedIds$: of([]),
        fakeToolbarVisible$: of(false),
        setActivatedTab: () => {},
        showContextualTab: () => {},
        hideContextualTab: () => {},
        hideAllContextualTabs: () => {},
        setCollapsedIds: () => {},
        setFakeToolbarVisible: () => {},
    };
}
