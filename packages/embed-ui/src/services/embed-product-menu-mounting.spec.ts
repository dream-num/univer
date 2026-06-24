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

import type { ICommandService, Injector, IUniverInstanceService } from '@univerjs/core';
import { COMMAND_EXECUTION_INJECTOR_KEY, ICommandService as ICommandServiceIdentifier, IConfigService, IUniverInstanceService as IUniverInstanceServiceIdentifier, LocaleService, UniverInstanceType } from '@univerjs/core';
import { IMenuManagerService, IRibbonService, MenuManagerPosition } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from './embed-product-menu-mounting';

const mocks = vi.hoisted(() => {
    const render = vi.fn();
    const unmount = vi.fn();
    const createEmbedReactRoot = vi.fn(() => ({ render, unmount }));
    const disposeEmbedReactRoot = vi.fn((root: { unmount: () => void }) => root.unmount());

    class FakeMenuManagerService {
        static instances: FakeMenuManagerService[] = [];

        readonly mergeMenu = vi.fn();
        readonly dispose = vi.fn();
        readonly createScoped = vi.fn(() => new FakeMenuManagerService());

        constructor(
            readonly injector?: unknown,
            readonly configService?: unknown
        ) {
            FakeMenuManagerService.instances.push(this);
        }
    }

    class FakeDesktopRibbonService {
        static instances: FakeDesktopRibbonService[] = [];

        readonly ribbon$ = new BehaviorSubject([
            { key: 'start', title: 'Start' },
            { key: 'insert' },
        ]);

        readonly activatedTab$ = new BehaviorSubject<string | undefined>(undefined);
        readonly collapsedIds$ = new BehaviorSubject<string[]>([]);
        readonly fakeToolbarVisible$ = new BehaviorSubject(false);
        readonly setActivatedTab = vi.fn((tab: string) => this.activatedTab$.next(tab));
        readonly showContextualTab = vi.fn();
        readonly hideContextualTab = vi.fn();
        readonly hideAllContextualTabs = vi.fn();
        readonly setCollapsedIds = vi.fn((ids: string[]) => this.collapsedIds$.next(ids));
        readonly setFakeToolbarVisible = vi.fn((visible: boolean) => this.fakeToolbarVisible$.next(visible));
        readonly dispose = vi.fn();

        constructor(
            readonly menuManager: unknown,
            readonly instanceService: unknown
        ) {
            FakeDesktopRibbonService.instances.push(this);
        }
    }

    return {
        render,
        unmount,
        createEmbedReactRoot,
        disposeEmbedReactRoot,
        FakeMenuManagerService,
        FakeDesktopRibbonService,
    };
});

vi.mock('./react-root-disposal', () => ({
    createEmbedReactRoot: mocks.createEmbedReactRoot,
    disposeEmbedReactRoot: mocks.disposeEmbedReactRoot,
}));

vi.mock('@univerjs/ui', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/ui')>();
    return {
        ...actual,
        DesktopRibbonService: mocks.FakeDesktopRibbonService,
        MenuManagerService: mocks.FakeMenuManagerService,
        Ribbon: function Ribbon() {
            return null;
        },
    };
});

describe('embed product menu mounting', () => {
    beforeEach(() => {
        mocks.render.mockClear();
        mocks.unmount.mockClear();
        mocks.createEmbedReactRoot.mockClear();
        mocks.disposeEmbedReactRoot.mockClear();
        mocks.FakeMenuManagerService.instances = [];
        mocks.FakeDesktopRibbonService.instances = [];
    });

    it('mounts and disposes a ribbon menu with a scoped injector', () => {
        const injector = createInjector();
        const container = document.createElement('div');

        expect(mountEmbedProductRibbonMenu({
            container,
            injector: injector as unknown as Injector,
            childType: UniverInstanceType.UNIVER_SHEET,
            menuSchema: 'invalid',
        })).toBeUndefined();

        const disposable = mountEmbedProductRibbonMenu({
            container,
            injector: injector as unknown as Injector,
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'child-sheet',
            menuSchema: { [MenuManagerPosition.RIBBON]: { start: { title: 'Start' } } },
            activeRibbonTab: 'start',
            toolbarOnly: true,
        });

        expect(disposable).toBeDefined();
        expect(mocks.createEmbedReactRoot).toHaveBeenCalledWith(container);
        expect(mocks.render).toHaveBeenCalledTimes(1);
        expect(mocks.FakeDesktopRibbonService.instances[0].setActivatedTab).toHaveBeenCalledWith('start');

        disposable?.dispose();

        expect(mocks.disposeEmbedReactRoot).toHaveBeenCalledTimes(1);
        expect(mocks.unmount).toHaveBeenCalledTimes(1);
        expect(mocks.FakeDesktopRibbonService.instances[0].dispose).toHaveBeenCalledTimes(1);
        expect(mocks.FakeMenuManagerService.instances[0].dispose).toHaveBeenCalledTimes(1);
    });

    it('scopes product menu unit lookup and command execution to the child unit', async () => {
        const injector = createInjector();
        const { injector: scopedInjector, ribbonService, disposable } = createEmbedProductMenuInjector(injector as unknown as Injector, {
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'child-sheet',
            menuSchema: {
                [MenuManagerPosition.RIBBON]: {
                    start: { title: 'Start' },
                    insert: {},
                },
            },
            activeRibbonTab: 'insert',
        });

        expect(scopedInjector.has(IUniverInstanceServiceIdentifier)).toBe(true);
        expect(scopedInjector.has(ICommandServiceIdentifier)).toBe(true);
        expect(scopedInjector.has(IMenuManagerService)).toBe(true);
        expect(scopedInjector.has(IRibbonService)).toBe(true);
        expect(scopedInjector.has(LocaleService)).toBe(true);

        const scopedInstanceService = scopedInjector.get(IUniverInstanceServiceIdentifier) as IUniverInstanceService;
        const scopedCommandService = scopedInjector.get(ICommandServiceIdentifier) as ICommandService;
        const childUnit = injector.units.get('child-sheet')!;
        const previousUnit = injector.units.get('previous-sheet')!;

        expect(scopedInstanceService.getFocusedUnit()).toBe(childUnit);
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(childUnit);
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)).toBeNull();

        const currentUnits: unknown[] = [];
        scopedInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit) => currentUnits.push(unit));
        injector.unitAdded$.next(childUnit);
        injector.unitDisposed$.next(childUnit);
        expect(currentUnits).toEqual([childUnit, childUnit, childUnit]);

        const ribbonTitles: string[][] = [];
        ribbonService.ribbon$.subscribe((groups) => ribbonTitles.push(groups.map((group) => group.title ?? '')));
        expect(ribbonTitles[0]).toEqual(['Start', '']);
        ribbonService.setCollapsedIds(['a']);
        ribbonService.setFakeToolbarVisible(true);
        ribbonService.showContextualTab('ctx', { activate: true });
        ribbonService.hideContextualTab('ctx');
        ribbonService.hideAllContextualTabs();

        await scopedCommandService.executeCommand('command.async', { a: 1 });
        scopedCommandService.syncExecuteCommand('command.sync', { b: 1 });
        scopedCommandService.syncExecuteCommand('command.keep', undefined, {
            [COMMAND_EXECUTION_INJECTOR_KEY]: 'existing' as unknown as Injector,
        });

        expect(injector.instanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(1, 'child-sheet');
        expect(injector.instanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(2, previousUnit.getUnitId());
        expect(injector.instanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(3, 'child-sheet');
        expect(injector.instanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(4, previousUnit.getUnitId());
        expect(injector.commandService.executeCommand).toHaveBeenCalledWith(
            'command.async',
            { a: 1 },
            expect.objectContaining({ [COMMAND_EXECUTION_INJECTOR_KEY]: scopedInjector })
        );
        expect(injector.commandService.syncExecuteCommand).toHaveBeenCalledWith(
            'command.sync',
            { b: 1 },
            expect.objectContaining({ [COMMAND_EXECUTION_INJECTOR_KEY]: scopedInjector })
        );
        expect(injector.commandService.syncExecuteCommand).toHaveBeenCalledWith(
            'command.keep',
            undefined,
            { [COMMAND_EXECUTION_INJECTOR_KEY]: 'existing' }
        );

        disposable.dispose();
    });

    it('falls back to the root services when there is no child unit scope', () => {
        const injector = createInjector({ hasCreateScoped: true });
        const { injector: scopedInjector } = createEmbedProductMenuInjector(injector as unknown as Injector, {
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(scopedInjector.get(ICommandServiceIdentifier)).toBe(injector.commandService);
        expect(scopedInjector.get(IUniverInstanceServiceIdentifier)).not.toBe(injector.instanceService);
        expect(mocks.FakeMenuManagerService.instances).toHaveLength(2);
        expect(mocks.FakeMenuManagerService.instances[0].createScoped).toHaveBeenCalledTimes(1);
    });
});

function createInjector(options: { hasCreateScoped?: boolean } = {}) {
    const childUnit = { getUnitId: () => 'child-sheet' };
    const previousUnit = { getUnitId: () => 'previous-sheet' };
    const unitAdded$ = new Subject<unknown>();
    const unitDisposed$ = new Subject<unknown>();
    const rootMenuManager = options.hasCreateScoped
        ? new mocks.FakeMenuManagerService()
        : { dispose: vi.fn() };
    const commandService = {
        executeCommand: vi.fn(async () => true),
        syncExecuteCommand: vi.fn(() => true),
    };
    const instanceService = {
        focused$: new BehaviorSubject(previousUnit),
        get focused() {
            return previousUnit;
        },
        getUnit: vi.fn((unitId: string) => unitId === 'child-sheet' ? childUnit : null),
        getFocusedUnit: vi.fn(() => previousUnit),
        getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => type === UniverInstanceType.UNIVER_SHEET ? previousUnit : null),
        getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(previousUnit)),
        getTypeOfUnitAdded$: vi.fn(() => unitAdded$),
        getTypeOfUnitDisposed$: vi.fn(() => unitDisposed$),
        setCurrentUnitForType: vi.fn(),
    };
    const localeService = {
        t: vi.fn((key: string) => `translated(${key})`),
    };
    const configService = {};
    const map = new Map<unknown, unknown>([
        [IUniverInstanceServiceIdentifier, instanceService],
        [ICommandServiceIdentifier, commandService],
        [IMenuManagerService, rootMenuManager],
        [IConfigService, configService],
        [LocaleService, localeService],
    ]);

    return {
        unitAdded$,
        unitDisposed$,
        units: new Map([
            ['child-sheet', childUnit],
            ['previous-sheet', previousUnit],
        ]),
        commandService,
        instanceService,
        has: vi.fn((token: unknown) => map.has(token)),
        get: vi.fn((token: unknown) => {
            if (!map.has(token)) {
                throw new Error(`unexpected token: ${String(token)}`);
            }

            return map.get(token);
        }),
    };
}
