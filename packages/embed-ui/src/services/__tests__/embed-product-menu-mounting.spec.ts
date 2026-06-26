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

import type { Injector } from '@univerjs/core';
import {
    COMMAND_EXECUTION_INJECTOR_KEY,
    ICommandService,
    IConfigService,
    IUniverInstanceService,
    LocaleService,
    UniverInstanceType,
} from '@univerjs/core';
import { IMenuManagerService, IRibbonService, MenuManagerPosition, MenuManagerService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmbedProductMenuInjector, mountEmbedProductRibbonMenu } from '../embed-product-menu-mounting';

const mocks = vi.hoisted(() => {
    const render = vi.fn();
    const unmount = vi.fn();
    const createEmbedReactRoot = vi.fn(() => ({ render, unmount }));
    const disposeEmbedReactRoot = vi.fn((root: { unmount: () => void }) => root.unmount());

    return {
        render,
        unmount,
        createEmbedReactRoot,
        disposeEmbedReactRoot,
    };
});

vi.mock('../react-root-disposal', () => ({
    createEmbedReactRoot: mocks.createEmbedReactRoot,
    disposeEmbedReactRoot: mocks.disposeEmbedReactRoot,
}));

describe('embed product menu mounting', () => {
    beforeEach(() => {
        mocks.render.mockClear();
        mocks.unmount.mockClear();
        mocks.createEmbedReactRoot.mockClear();
        mocks.disposeEmbedReactRoot.mockClear();
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

        disposable?.dispose();

        expect(mocks.disposeEmbedReactRoot).toHaveBeenCalledTimes(1);
        expect(mocks.unmount).toHaveBeenCalledTimes(1);
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

        expect(scopedInjector.has(IUniverInstanceService)).toBe(true);
        expect(scopedInjector.has(ICommandService)).toBe(true);
        expect(scopedInjector.has(IMenuManagerService)).toBe(true);
        expect(scopedInjector.has(IRibbonService)).toBe(true);
        expect(scopedInjector.has(LocaleService)).toBe(true);

        const scopedInstanceService = scopedInjector.get(IUniverInstanceService) as IUniverInstanceService;
        const scopedCommandService = scopedInjector.get(ICommandService) as ICommandService;
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

        const activatedTabs: string[] = [];
        ribbonService.activatedTab$.subscribe((tab) => activatedTabs.push(tab));
        expect(activatedTabs[0]).toBe('insert');
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
        const rootMenuManager = injector.get(IMenuManagerService) as MenuManagerService;
        const createScopedSpy = vi.spyOn(rootMenuManager, 'createScoped');
        const { injector: scopedInjector } = createEmbedProductMenuInjector(injector as unknown as Injector, {
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(scopedInjector.get(ICommandService)).toBe(injector.commandService);
        expect(scopedInjector.get(IUniverInstanceService)).not.toBe(injector.instanceService);
        expect(scopedInjector.get(IMenuManagerService)).not.toBe(rootMenuManager);
        expect(createScopedSpy).toHaveBeenCalledTimes(1);
    });
});

function createInjector(options: { hasCreateScoped?: boolean } = {}) {
    const childUnit = { getUnitId: () => 'child-sheet' };
    const previousUnit = { getUnitId: () => 'previous-sheet' };
    const unitAdded$ = new Subject<unknown>();
    const unitDisposed$ = new Subject<unknown>();
    const configService = {};
    const rootMenuManager = options.hasCreateScoped
        ? new MenuManagerService({} as Injector, configService as IConfigService)
        : {
            menuChanged$: new Subject<void>(),
            mergeMenu: vi.fn(),
            appendRootMenu: vi.fn(),
            getMenuByPositionKey: vi.fn(() => []),
            getFlatMenuByPositionKey: vi.fn(() => []),
        };
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
    const map = new Map<unknown, unknown>([
        [IUniverInstanceService, instanceService],
        [ICommandService, commandService],
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
