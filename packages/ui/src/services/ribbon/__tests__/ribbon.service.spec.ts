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

import type { IMenuSchema, MenuSchemaType } from '../../menu/menu-manager.service';
import {
    ConfigService,
    ContextService,
    DesktopLogService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    toDisposable,
    Univer,
    UniverInstanceService,
} from '@univerjs/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { describe, expect, it, onTestFinished } from 'vitest';
import { MenuItemType } from '../../menu/menu';
import { IMenuManagerService, MenuManagerService } from '../../menu/menu-manager.service';
import { MenuManagerPosition, RibbonPosition } from '../../menu/types';
import { DesktopRibbonService, IRibbonService } from '../ribbon.service';

function createInjector(univerInstanceService?: { focused$: BehaviorSubject<string | null> }) {
    const injector = new Injector();
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add(univerInstanceService
        ? [IUniverInstanceService, univerInstanceService as never]
        : [IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
    injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
    onTestFinished(() => injector.dispose());
    return injector;
}

describe('DesktopRibbonService', () => {
    it('finishes global disposal when a later owner hides an active contextual tab', () => {
        const univer = new Univer({ locales: { [LocaleType.EN_US]: { title: 'Tools' } }, locale: LocaleType.EN_US, direction: 'ltr' });
        const injector = univer.__getInjector();
        injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
        injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
        const service = injector.get(IRibbonService);
        injector.get(IMenuManagerService).appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                tools: {
                    contextual: true,
                    group: {
                        command: {
                            menuItemFactory: (accessor) => ({ id: 'tools', type: MenuItemType.BUTTON, title: accessor.get(LocaleService).t('title') }),
                        },
                    },
                },
            },
        });
        service.showContextualTab('tools', { activate: true });
        injector.add(['contextual-tab-owner', { useValue: toDisposable(() => service.hideContextualTab('tools')) }]);
        injector.get('contextual-tab-owner');
        let completed = false;
        injector.onDispose(() => completed = true);

        expect(() => univer.dispose()).not.toThrow();
        expect(completed).toBe(true);
    });

    it('does not rebuild menus or acquire hidden subscriptions during or after disposal', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService) as DesktopRibbonService;
        const menu = injector.get(IMenuManagerService);
        let factories = 0;
        let subscriptions = 0;
        let unsubscriptions = 0;
        const hidden$ = new Observable<boolean>((subscriber) => {
            subscriptions += 1;
            subscriber.next(false);
            return () => unsubscriptions += 1;
        });
        menu.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                tools: {
                    contextual: true,
                    group: {
                        command: {
                            menuItemFactory: () => {
                                factories += 1;
                                return { id: 'tools', type: MenuItemType.BUTTON, hidden$ };
                            },
                        },
                    },
                },
            },
        });
        service.showContextualTab('tools');
        const factoryCount = factories;
        const subscription = service.ribbon$.subscribe((tabs) => {
            if (tabs.length === 0) {
                service.showContextualTab('tools');
            }
        });

        service.dispose();
        service.showContextualTab('tools', { activate: true });
        service.hideContextualTab('tools');
        service.hideAllContextualTabs();
        menu.updateMenuConfig({});
        service.dispose();

        expect(factories).toBe(factoryCount);
        expect(subscriptions).toBe(unsubscriptions);
        subscription.unsubscribe();
    });

    it('releases hidden subscriptions when disposed synchronously by a ribbon observer', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService) as DesktopRibbonService;
        let subscriptions = 0;
        let unsubscriptions = 0;
        const hidden$ = new Observable<boolean>((subscriber) => {
            subscriptions += 1;
            subscriber.next(false);
            return () => unsubscriptions += 1;
        });
        injector.get(IMenuManagerService).appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                tools: {
                    contextual: true,
                    group: {
                        command: {
                            menuItemFactory: () => ({ id: 'tools', type: MenuItemType.BUTTON, hidden$ }),
                        },
                    },
                },
            },
        });
        const subscription = service.ribbon$.subscribe((tabs) => {
            if (tabs.some((tab) => tab.key === 'tools')) {
                service.dispose();
            }
        });

        service.showContextualTab('tools');

        expect(subscriptions).toBeGreaterThan(0);
        expect(unsubscriptions).toBe(subscriptions);
        subscription.unsubscribe();
    });

    it('shows contextual ribbon tabs only when requested and restores the last regular tab when hidden', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const ribbons: string[][] = [];
        const activated: string[] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => ribbons.push(ribbon.map((item) => item.key)));
        const activeSub = service.activatedTab$.subscribe((tab) => activated.push(tab));

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                'chart-tools': {
                    order: 100,
                    title: 'chart',
                    contextual: true,
                    group: { order: 0, command: { order: 0, menuItemFactory: () => ({ id: 'chart-command' }) } },
                },
            },
        } as MenuSchemaType);
        service.setActivatedTab(RibbonPosition.INSERT);
        service.showContextualTab('chart-tools', { activate: true });
        service.hideContextualTab('chart-tools');

        expect(ribbons.at(-2)).toContain('chart-tools');
        expect(ribbons.at(-1)).not.toContain('chart-tools');
        expect(activated).toContain('chart-tools');

        ribbonSub.unsubscribe();
        activeSub.unsubscribe();
    });

    it('publishes collapsed group ids and fake toolbar visibility changes', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const collapsed: string[][] = [];
        const fakeToolbarVisible: boolean[] = [];
        const collapsedSub = service.collapsedIds$.subscribe((ids) => collapsed.push(ids));
        const fakeToolbarSub = service.fakeToolbarVisible$.subscribe((visible) => fakeToolbarVisible.push(visible));

        service.setCollapsedIds(['format']);
        service.setFakeToolbarVisible(true);

        expect(collapsed).toEqual([[], ['format']]);
        expect(fakeToolbarVisible).toEqual([false, true]);
        collapsedSub.unsubscribe();
        fakeToolbarSub.unsubscribe();
    });

    it('filters hidden ribbon commands and restores activation when contextual tabs disappear', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const hidden$ = new BehaviorSubject(false);
        const ribbons: IMenuSchema[][] = [];
        const activated: string[] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => ribbons.push(ribbon));
        const activeSub = service.activatedTab$.subscribe((tab) => activated.push(tab));

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.START]: {
                    order: 0,
                    [`${RibbonPosition.START}.visible-group`]: {
                        order: 0,
                        visibleCommand: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'visible-command', type: MenuItemType.BUTTON }),
                        },
                        hiddenCommand: {
                            order: 1,
                            menuItemFactory: () => ({ id: 'hidden-command', type: MenuItemType.BUTTON, hidden$ }),
                        },
                    },
                },
                'picture-tools': {
                    order: 99,
                    contextual: true,
                    [`${RibbonPosition.START}.picture-group`]: {
                        order: 0,
                        command: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'picture-command', type: MenuItemType.BUTTON }),
                        },
                    },
                },
            },
        } as MenuSchemaType);

        service.setActivatedTab(RibbonPosition.START);
        service.showContextualTab('picture-tools', { activate: true });
        hidden$.next(true);
        service.hideAllContextualTabs();
        service.hideAllContextualTabs();
        service.hideContextualTab('missing-tools');

        const startRibbon = ribbons.at(-1)!
            .find((group) => group.key === RibbonPosition.START);
        const commandKeys = startRibbon?.children?.flatMap((group) => group.children ?? []).map((child) => child.key);
        expect(commandKeys).toContain('visibleCommand');
        expect(commandKeys).not.toContain('hiddenCommand');
        expect(ribbons.at(-1)?.map((item) => item.key)).not.toContain('picture-tools');
        expect(activated.at(-1)).toBe(RibbonPosition.START);

        ribbonSub.unsubscribe();
        activeSub.unsubscribe();
    });

    it('does not republish the ribbon when hidden states emit unchanged values', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const hidden$ = new BehaviorSubject(false);
        const ribbons: IMenuSchema[][] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => ribbons.push(ribbon));

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.START]: {
                    order: 0,
                    [`${RibbonPosition.START}.stable-group`]: {
                        order: 0,
                        stableCommand: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'stable-command', type: MenuItemType.BUTTON, hidden$ }),
                        },
                    },
                },
            },
        } as MenuSchemaType);

        const publishCountAfterInitialHiddenState = ribbons.length;
        hidden$.next(false);

        expect(ribbons.length).toBe(publishCountAfterInitialHiddenState);

        hidden$.next(true);

        expect(ribbons.length).toBe(publishCountAfterInitialHiddenState + 1);

        ribbonSub.unsubscribe();
    });

    it('filters a hidden command even when another hidden state has not emitted', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const silentHidden$ = new Subject<boolean>();
        const hidden$ = new BehaviorSubject(true);
        let latestRibbon: IMenuSchema[] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => latestRibbon = ribbon);

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.START]: {
                    order: 0,
                    [`${RibbonPosition.START}.hidden-group`]: {
                        order: 0,
                        silentCommand: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'silent-command', type: MenuItemType.BUTTON, hidden$: silentHidden$ }),
                        },
                        hiddenCommand: {
                            order: 1,
                            menuItemFactory: () => ({ id: 'hidden-command', type: MenuItemType.BUTTON, hidden$ }),
                        },
                    },
                },
            },
        } as MenuSchemaType);

        const commandKeys = latestRibbon
            .find((group) => group.key === RibbonPosition.START)
            ?.children
            ?.flatMap((group) => group.children ?? [])
            .map((child) => child.key);
        expect(commandKeys).toContain('silentCommand');
        expect(commandKeys).not.toContain('hiddenCommand');

        ribbonSub.unsubscribe();
    });

    it('does not republish the ribbon when focus emits the same unit id', () => {
        const focused$ = new BehaviorSubject<string | null>('unit-1');
        const injector = createInjector({ focused$ });
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const ribbons: IMenuSchema[][] = [];
        const ribbonSub = service.ribbon$.subscribe((ribbon) => ribbons.push(ribbon));

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.START]: {
                    order: 0,
                    [`${RibbonPosition.START}.focus-group`]: {
                        order: 0,
                        focusCommand: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'focus-command', type: MenuItemType.BUTTON }),
                        },
                    },
                },
            },
        } as MenuSchemaType);

        const publishCountAfterMenuLoad = ribbons.length;
        focused$.next('unit-1');

        expect(ribbons.length).toBe(publishCountAfterMenuLoad);

        focused$.next('unit-2');

        expect(ribbons.length).toBe(publishCountAfterMenuLoad + 1);

        ribbonSub.unsubscribe();
    });

    it('keeps visibility independent when groups contain the same command', () => {
        const injector = createInjector();
        const service = injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        const docHidden$ = new BehaviorSubject(true);
        const slideHidden$ = new BehaviorSubject(false);
        let latestRibbon: IMenuSchema[] = [];
        const subscription = service.ribbon$.subscribe((ribbon) => latestRibbon = ribbon);
        onTestFinished(() => subscription.unsubscribe());

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.VIEW]: {
                    'doc-display': {
                        order: 0,
                        fullscreen: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'fullscreen', type: MenuItemType.BUTTON, hidden$: docHidden$ }),
                        },
                    },
                    'slide-display': {
                        order: 1,
                        fullscreen: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'fullscreen', type: MenuItemType.BUTTON, hidden$: slideHidden$ }),
                        },
                    },
                    'global-display': {
                        order: 2,
                        fullscreen: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'fullscreen', type: MenuItemType.BUTTON }),
                        },
                    },
                },
            },
        });

        expect(latestRibbon.find((tab) => tab.key === RibbonPosition.VIEW)?.children?.map((group) => group.key))
            .toEqual(['slide-display', 'global-display']);

        docHidden$.next(false);
        slideHidden$.next(true);

        expect(latestRibbon.find((tab) => tab.key === RibbonPosition.VIEW)?.children?.map((group) => group.key))
            .toEqual(['doc-display', 'global-display']);
    });

    it('unsubscribes hidden states that are no longer in the ribbon', () => {
        const injector = createInjector();
        injector.get(IRibbonService);
        const menuManagerService = injector.get(IMenuManagerService);
        let subscriptions = 0;
        let unsubscriptions = 0;
        const hidden$ = new Observable<boolean>(() => {
            subscriptions += 1;
            return () => {
                unsubscriptions += 1;
            };
        });
        const groupKey = `${RibbonPosition.START}.temporary-group`;

        menuManagerService.appendRootMenu({
            [MenuManagerPosition.RIBBON]: {
                [RibbonPosition.START]: {
                    [groupKey]: {
                        order: 0,
                        temporaryCommand: {
                            order: 0,
                            menuItemFactory: () => ({ id: 'temporary-command', type: MenuItemType.BUTTON, hidden$ }),
                        },
                    },
                },
            },
        } as MenuSchemaType);
        expect(subscriptions).toBe(1);

        menuManagerService.mergeMenu({
            [groupKey]: {
                replace: true,
                order: 0,
                visibleCommand: {
                    order: 0,
                    menuItemFactory: () => ({ id: 'visible-command', type: MenuItemType.BUTTON }),
                },
            },
        } as MenuSchemaType);

        expect(unsubscriptions).toBe(1);
    });
});
