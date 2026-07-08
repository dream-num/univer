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

import type { DependencyIdentifier, IAccessor, IDisposable, IExecutionOptions, Injector } from '@univerjs/core';
import type { IMenuSchema, MenuSchemaType } from '@univerjs/ui';
import type { IEmbedProductMenuMountContext } from '../types/embed-ui';
import { COMMAND_EXECUTION_INJECTOR_KEY, FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT, ICommandService, IConfigService, IContextService, IUniverInstanceService, LocaleService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { DesktopRibbonService, IMenuManagerService, IRibbonService, MenuManagerPosition, MenuManagerService, Ribbon } from '@univerjs/ui';
import { createElement } from 'react';
import { map, merge, of } from 'rxjs';
import { EmbedRuntimeProviders } from '../components/EmbedRuntimeProviders';
import { EmbedRuntimeFocusCoordinator } from './embed-runtime-focus-coordinator.service';
import { createEmbedReactRoot, disposeEmbedReactRoot } from './react-root-disposal';

export function mountEmbedProductRibbonMenu(context: IEmbedProductMenuMountContext): IDisposable | undefined {
    const { container, portalContainer, injector, childType, childUnitId, embedId, menuSchema, menuTitlePrefix, activeRibbonTab, headerMenu = false, toolbarOnly, ribbonHeaderClassName, scopedActionServiceTokens } = context;
    if (menuSchema != null && typeof menuSchema !== 'object') {
        return undefined;
    }

    const scoped = createEmbedProductMenuInjector(injector as Injector, {
        childType,
        childUnitId,
        embedId,
        menuSchema,
        menuTitlePrefix,
        activeRibbonTab,
        scopedActionServiceTokens,
    });
    const root = createEmbedReactRoot(container);
    root.render(createElement(
        EmbedRuntimeProviders,
        { injector: scoped.injector as Injector, mountContainer: portalContainer ?? container, embedId },
        createElement(Ribbon, { ribbonType: 'classic', headerMenu, toolbarOnly, headerClassName: ribbonHeaderClassName })
    ));

    return toDisposable(() => {
        disposeEmbedReactRoot(root);
        scoped.disposable.dispose();
    });
}

export function createEmbedProductMenuInjector(
    injector: Injector,
    params: {
        childType: UniverInstanceType;
        childUnitId?: string;
        embedId?: string;
        menuSchema?: unknown;
        menuTitlePrefix?: string;
        activeRibbonTab?: string;
        scopedActionServiceTokens?: readonly DependencyIdentifier<unknown>[];
    }
): { injector: Pick<Injector, 'invoke' | 'get' | 'has'>; ribbonService: IRibbonService; disposable: IDisposable } {
    const { childType, childUnitId, embedId, menuSchema, menuTitlePrefix, activeRibbonTab, scopedActionServiceTokens } = params;
    const instanceService = injector.get(IUniverInstanceService);
    const scopedInstanceService = createScopedEmbedProductInstanceService(instanceService, childType, childUnitId);
    const actionServiceTokenSet = new Set<DependencyIdentifier<unknown>>(scopedActionServiceTokens ?? []);
    const scopedActionServices = new WeakMap<object, unknown>();
    let scopedInjector: Pick<Injector, 'invoke' | 'get' | 'has'>;
    const commandService = createScopedEmbedProductCommandService(
        injector.get(ICommandService),
        instanceService,
        childType,
        childUnitId,
        embedId,
        () => scopedInjector
    );
    const contextService = childUnitId && injector.has(IContextService)
        ? createScopedEmbedProductContextService(injector.get(IContextService), childType)
        : undefined;
    let menuManager: IMenuManagerService;
    let menuManagerDisposable: IDisposable | undefined;
    const ribbonServiceRef: { current?: DesktopRibbonService } = {};
    let exposedRibbonService: IRibbonService;
    const hasDependency = (identifier: Parameters<Injector['get']>[0]) => {
        if (
            identifier === IUniverInstanceService ||
            identifier === ICommandService ||
            (identifier === IContextService && contextService) ||
            identifier === IMenuManagerService ||
            identifier === IRibbonService
        ) {
            return true;
        }

        return injector.has(identifier);
    };
    const getDependency = (identifier: Parameters<Injector['get']>[0]) => {
        if (identifier === IUniverInstanceService) {
            return scopedInstanceService;
        }
        if (identifier === ICommandService) {
            return commandService;
        }
        if (identifier === IContextService && contextService) {
            return contextService;
        }
        if (identifier === IMenuManagerService) {
            return menuManager;
        }
        if (identifier === IRibbonService) {
            return exposedRibbonService;
        }

        const dependency = injector.get(identifier);
        if (childUnitId && actionServiceTokenSet.has(identifier as DependencyIdentifier<unknown>)) {
            return createScopedEmbedProductActionService(
                dependency,
                instanceService,
                childType,
                childUnitId,
                embedId,
                () => scopedInjector,
                scopedActionServices
            );
        }

        return dependency;
    };
    scopedInjector = {
        has: hasDependency,
        get: getDependency,
        invoke: <T, P extends unknown[] = []>(factory: (accessor: IAccessor, ...args: P) => T, ...args: P): T => factory({
            has: hasDependency,
            get: getDependency,
        } as IAccessor, ...args),
    } as Pick<Injector, 'invoke' | 'get' | 'has'>;

    if (menuSchema && typeof menuSchema === 'object') {
        const localMenuManager = new MenuManagerService(scopedInjector as Injector, injector.get(IConfigService));
        localMenuManager.mergeMenu(prefixRibbonMenuTitles(menuSchema, menuTitlePrefix, injector) as MenuSchemaType);
        menuManager = localMenuManager;
        menuManagerDisposable = localMenuManager;
    } else {
        const rootMenuManager = injector.get(IMenuManagerService);
        const createScoped = (rootMenuManager as MenuManagerService).createScoped;
        menuManager = typeof createScoped === 'function'
            ? createScoped.call(rootMenuManager, scopedInjector as Injector)
            : rootMenuManager;
    }
    const ribbonService = new DesktopRibbonService(menuManager, scopedInstanceService);
    ribbonServiceRef.current = ribbonService;
    if (activeRibbonTab) {
        ribbonService.setActivatedTab(activeRibbonTab);
    }
    exposedRibbonService = menuTitlePrefix
        ? createPrefixedRibbonService(ribbonService, menuTitlePrefix, injector)
        : ribbonService;

    return {
        injector: scopedInjector,
        ribbonService: exposedRibbonService,
        disposable: toDisposable(() => {
            ribbonServiceRef.current?.dispose();
            menuManagerDisposable?.dispose();
        }),
    };
}

function createPrefixedRibbonService(ribbonService: IRibbonService, prefix: string, injector: Injector): IRibbonService {
    let localeService: LocaleService | undefined;
    try {
        localeService = injector.get(LocaleService);
    } catch {
        localeService = undefined;
    }

    return {
        ribbon$: ribbonService.ribbon$.pipe(map((ribbon) => ribbon.map((group) => prefixRibbonGroupTitle(group, prefix, localeService)))),
        activatedTab$: ribbonService.activatedTab$,
        collapsedIds$: ribbonService.collapsedIds$,
        fakeToolbarVisible$: ribbonService.fakeToolbarVisible$,
        setActivatedTab: (tab: string) => ribbonService.setActivatedTab(tab),
        showContextualTab: (tab: string, options?: { activate?: boolean }) => ribbonService.showContextualTab(tab, options),
        hideContextualTab: (tab: string) => ribbonService.hideContextualTab(tab),
        hideAllContextualTabs: () => ribbonService.hideAllContextualTabs(),
        setCollapsedIds: (ids: string[]) => ribbonService.setCollapsedIds(ids),
        setFakeToolbarVisible: (visible: boolean) => ribbonService.setFakeToolbarVisible(visible),
    };
}

function prefixRibbonGroupTitle(group: IMenuSchema, prefix: string, localeService: LocaleService | undefined): IMenuSchema {
    const rawTitle = group.title || group.key;
    const title = localeService?.t(rawTitle) ?? rawTitle;
    return {
        ...group,
        title: `${prefix} - ${title}`,
    };
}

function prefixRibbonMenuTitles(menuSchema: unknown, prefix: string | undefined, injector: Injector): unknown {
    if (!prefix || !menuSchema || typeof menuSchema !== 'object') {
        return menuSchema;
    }

    const cloned = cloneMenuSchema(menuSchema);
    const ribbon = (cloned as Record<string, unknown>)[MenuManagerPosition.RIBBON];
    if (!ribbon || typeof ribbon !== 'object') {
        return cloned;
    }

    let localeService: LocaleService | undefined;
    try {
        localeService = injector.get(LocaleService);
    } catch {
        localeService = undefined;
    }

    Object.values(ribbon as Record<string, unknown>).forEach((group) => {
        if (!group || typeof group !== 'object') {
            return;
        }

        const schema = group as { title?: string };
        const rawTitle = schema.title;
        if (!rawTitle) {
            return;
        }

        const title = localeService?.t(rawTitle) ?? rawTitle;
        schema.title = `${prefix} - ${title}`;
    });

    return cloned;
}

function cloneMenuSchema(value: unknown): unknown {
    if (!value || typeof value !== 'object') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => cloneMenuSchema(item));
    }

    return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, cloneMenuSchema(child)])
    );
}

function createScopedEmbedProductInstanceService(
    instanceService: IUniverInstanceService,
    childType: UniverInstanceType,
    childUnitId?: string
): IUniverInstanceService {
    const getChildUnit = () => childUnitId ? instanceService.getUnit(childUnitId, childType) : null;
    const scopedFocused$ = childUnitId
        ? merge(
            of(childUnitId),
            instanceService.getTypeOfUnitAdded$(childType).pipe(map(() => childUnitId)),
            instanceService.getTypeOfUnitDisposed$(childType).pipe(map(() => childUnitId))
        )
        : instanceService.focused$;

    const scopedInstanceService = Object.create(instanceService) as IUniverInstanceService & { focused?: unknown };
    Object.defineProperty(scopedInstanceService, 'focused$', {
        value: scopedFocused$,
        configurable: true,
    });
    Object.defineProperty(scopedInstanceService, 'focused', {
        get: () => getChildUnit() ?? instanceService.getFocusedUnit(),
        configurable: true,
    });
    scopedInstanceService.getCurrentUnitOfType = ((type: UniverInstanceType) => type === childType && childUnitId
        ? getChildUnit()
        : instanceService.getCurrentUnitOfType(type)) as IUniverInstanceService['getCurrentUnitOfType'];
    scopedInstanceService.getCurrentTypeOfUnit$ = ((type: UniverInstanceType) => {
        if (type !== childType || !childUnitId) {
            return instanceService.getCurrentTypeOfUnit$(type);
        }

        return merge(
            of(undefined),
            instanceService.getTypeOfUnitAdded$(childType),
            instanceService.getTypeOfUnitDisposed$(childType)
        ).pipe(map(() => getChildUnit()));
    }) as IUniverInstanceService['getCurrentTypeOfUnit$'];
    scopedInstanceService.getFocusedUnit = () => getChildUnit() ?? instanceService.getFocusedUnit();
    return scopedInstanceService;
}

function createScopedEmbedProductContextService(
    contextService: IContextService,
    childType: UniverInstanceType
): IContextService {
    const scopedContextService = Object.create(contextService) as IContextService;
    scopedContextService.getContextValue = (key: string) => {
        const value = getScopedEmbedProductFocusContextValue(key, childType);
        return value ?? contextService.getContextValue(key);
    };
    scopedContextService.subscribeContextValue$ = (key: string) => {
        const value = getScopedEmbedProductFocusContextValue(key, childType);
        return value == null ? contextService.subscribeContextValue$(key) : of(value);
    };
    return scopedContextService;
}

function getScopedEmbedProductFocusContextValue(key: string, childType: UniverInstanceType): boolean | undefined {
    if (key === FOCUSING_UNIT) {
        return true;
    }

    if (key === FOCUSING_SHEET || key === FOCUSING_DOC || key === FOCUSING_SLIDE) {
        return key === getFocusContextKeyByUnitType(childType);
    }

    return undefined;
}

function getFocusContextKeyByUnitType(childType: UniverInstanceType): string | undefined {
    if (childType === UniverInstanceType.UNIVER_SHEET) {
        return FOCUSING_SHEET;
    }
    if (childType === UniverInstanceType.UNIVER_DOC) {
        return FOCUSING_DOC;
    }
    if (childType === UniverInstanceType.UNIVER_SLIDE) {
        return FOCUSING_SLIDE;
    }

    return undefined;
}

function createScopedEmbedProductCommandService(
    commandService: ICommandService,
    instanceService: IUniverInstanceService,
    childType: UniverInstanceType,
    childUnitId?: string,
    embedId?: string,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined
): ICommandService {
    if (!childUnitId) {
        return commandService;
    }

    const scopedCommandService = Object.create(commandService) as ICommandService;
    scopedCommandService.executeCommand = (async (...args: Parameters<ICommandService['executeCommand']>) => {
        const previous = instanceService.getCurrentUnitOfType(childType);
        try {
            instanceService.setCurrentUnitForType(childUnitId);
            return await commandService.executeCommand(args[0], args[1], withEmbedProductMenuExecutionInjector(args[2], getScopedInjector));
        } finally {
            restoreEmbedProductMenuCurrentUnit(instanceService, childUnitId, previous, embedId, getScopedInjector);
        }
    }) as ICommandService['executeCommand'];
    scopedCommandService.syncExecuteCommand = ((...args: Parameters<ICommandService['syncExecuteCommand']>) => {
        const previous = instanceService.getCurrentUnitOfType(childType);
        try {
            instanceService.setCurrentUnitForType(childUnitId);
            return commandService.syncExecuteCommand(args[0], args[1], withEmbedProductMenuExecutionInjector(args[2], getScopedInjector));
        } finally {
            restoreEmbedProductMenuCurrentUnit(instanceService, childUnitId, previous, embedId, getScopedInjector);
        }
    }) as ICommandService['syncExecuteCommand'];
    return scopedCommandService;
}

function createScopedEmbedProductActionService<T>(
    service: T,
    instanceService: IUniverInstanceService,
    childType: UniverInstanceType,
    childUnitId: string,
    embedId?: string,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined,
    scopedActionServices?: WeakMap<object, unknown>
): T {
    if ((typeof service !== 'object' && typeof service !== 'function') || service == null) {
        return service;
    }

    const target = service as object;
    const cached = scopedActionServices?.get(target);
    if (cached) {
        return cached as T;
    }

    const scopedService = Object.create(Object.getPrototypeOf(target)) as T & Record<string, unknown>;
    Object.assign(scopedService as object, target);
    copyScopedActionServiceMethods(target, scopedService, instanceService, childType, childUnitId, embedId, getScopedInjector);
    scopedActionServices?.set(target, scopedService);

    return scopedService;
}

function copyScopedActionServiceMethods<T>(
    target: object,
    scopedService: T & Record<string, unknown>,
    instanceService: IUniverInstanceService,
    childType: UniverInstanceType,
    childUnitId: string,
    embedId?: string,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined
): void {
    const copyMethod = (methodName: string) => {
        if (methodName === 'constructor') {
            return;
        }

        const value = (target as Record<string, unknown>)[methodName];
        if (typeof value !== 'function') {
            return;
        }

        const scopedRecord = scopedService as Record<string, unknown>;
        scopedRecord[methodName] = (...args: unknown[]) => runWithEmbedProductMenuChildUnit(
            instanceService,
            childType,
            childUnitId,
            embedId,
            getScopedInjector,
            () => value.apply(target, args)
        );
    };

    Object.keys(target).forEach(copyMethod);
    const prototype = Object.getPrototypeOf(target);
    if (prototype && prototype !== Object.prototype) {
        Object.getOwnPropertyNames(prototype).forEach(copyMethod);
    }
}

function runWithEmbedProductMenuChildUnit<T>(
    instanceService: IUniverInstanceService,
    childType: UniverInstanceType,
    childUnitId: string,
    embedId: string | undefined,
    getScopedInjector: (() => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined) | undefined,
    runner: () => T
): T {
    const previous = instanceService.getCurrentUnitOfType(childType);
    let result: T;
    try {
        instanceService.setCurrentUnitForType(childUnitId);
        result = runner();
    } catch (error) {
        restoreEmbedProductMenuCurrentUnit(instanceService, childUnitId, previous, embedId, getScopedInjector);
        throw error;
    }

    if (isPromiseLike(result)) {
        return result.finally(() => {
            restoreEmbedProductMenuCurrentUnit(instanceService, childUnitId, previous, embedId, getScopedInjector);
        }) as T;
    }

    restoreEmbedProductMenuCurrentUnit(instanceService, childUnitId, previous, embedId, getScopedInjector);

    return result;
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
    return Boolean(value && typeof (value as { finally?: unknown }).finally === 'function');
}

function restoreEmbedProductMenuCurrentUnit(
    instanceService: IUniverInstanceService,
    childUnitId: string,
    previous: ReturnType<IUniverInstanceService['getCurrentUnitOfType']>,
    embedId?: string,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined
): void {
    if (shouldKeepEmbedProductMenuChildUnit(embedId, getScopedInjector)) {
        instanceService.setCurrentUnitForType(childUnitId);
        instanceService.focusUnit?.(childUnitId);
        return;
    }

    if (previous) {
        instanceService.setCurrentUnitForType(previous.getUnitId());
    }
}

function shouldKeepEmbedProductMenuChildUnit(
    embedId?: string,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined
): boolean {
    const injector = getScopedInjector?.();
    if (!embedId || !injector?.has(EmbedRuntimeFocusCoordinator)) {
        return false;
    }

    return injector.get(EmbedRuntimeFocusCoordinator).hasChildInteractionLease(embedId);
}

function withEmbedProductMenuExecutionInjector(
    options: IExecutionOptions | undefined,
    getScopedInjector?: () => Pick<Injector, 'invoke' | 'get' | 'has'> | undefined
): IExecutionOptions | undefined {
    const scopedInjector = getScopedInjector?.();
    if (!scopedInjector || options?.[COMMAND_EXECUTION_INJECTOR_KEY]) {
        return options;
    }

    return {
        ...options,
        [COMMAND_EXECUTION_INJECTOR_KEY]: scopedInjector as Injector,
    };
}
