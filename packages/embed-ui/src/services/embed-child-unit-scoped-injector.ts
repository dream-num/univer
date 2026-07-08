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

import type { IAccessor, IConfigService as IConfigServiceType, IDisposable, IExecutionOptions, UnitModel } from '@univerjs/core';
import type { ICreateEmbedCommandParams } from '@univerjs/embed';
import type { MenuManagerService } from '@univerjs/ui';
import type { IEmbedChildContainerContext } from '../types/embed-ui';
import {
    COMMAND_EXECUTION_INJECTOR_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_DOC,
    FOCUSING_SHEET,
    FOCUSING_SLIDE,
    FOCUSING_UNIT,
    FORMULA_EDITOR_ACTIVATED,
    ICommandService,
    IConfigService,
    IContextService,
    Injector,
    IUniverInstanceService,
    LookUp,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { CreateEmbedCommand } from '@univerjs/embed';
import {
    CanvasPopupService,
    ContextMenuService,
    DesktopRibbonService,
    DesktopSidebarService,
    ICanvasPopupService,
    IContextMenuService,
    ILayoutService,
    IMenuManagerService,
    IRibbonService,
    ISidebarService,
} from '@univerjs/ui';
import { BehaviorSubject, EMPTY, filter, map, merge, Observable, Subject } from 'rxjs';
import { EmbedInteractionBoundaryService } from './embed-interaction-boundary.service';
import {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from './embed-runtime-focus-coordinator.service';
import { EmbedRuntimePolicyService } from './embed-runtime-policy.service';

const EMBED_SCOPED_LOCAL_IDENTIFIER_KEYS = new Set([
    'identifier:univer.menu-manager-service',
    'identifier:univer.ribbon-service',
    'identifier:ui.contextmenu.service',
    'identifier:ui.popup.service',
    'identifier:ui.sidebar.service',
    'identifier:ui.layout-service',
    'identifier:univer.sheet.selection-render-service',
]);

export type IEmbedScopedConfigOverrides = ReadonlyMap<string | symbol, (config: unknown) => unknown>;

export function createEmbedChildUnitScopedInjector(
    context: IEmbedChildContainerContext
): Injector | undefined {
    const instanceService = context.injector.get(IUniverInstanceService);
    const childUnit = instanceService.getUnit(context.childUnitId, context.childType);
    if (!childUnit) {
        return undefined;
    }

    const scopedCurrentChildUnit$ = new BehaviorSubject<EmbedScopedUnit>(childUnit);
    const scopedFocusedUnitId$ = new BehaviorSubject<string | null>(childUnit.getUnitId());
    const scopedInstanceService = createScopedEmbedInstanceService(
        instanceService,
        context,
        childUnit,
        scopedCurrentChildUnit$,
        scopedFocusedUnitId$
    );

    let scopedInjector: Injector;
    const shouldSyncParentFocusDuringCommand = shouldSyncParentFocusForScopedCommand(context);
    const commandService = createScopedEmbedCommandService(
        context.injector.get(ICommandService),
        context,
        instanceService,
        shouldSyncParentFocusDuringCommand,
        () => scopedInjector
    );

    const scopedOverrides = new Map<unknown, unknown>([
        [IUniverInstanceService, scopedInstanceService],
        [ICommandService, commandService],
    ]);
    if (context.injector.has(EmbedRuntimePolicyService)) {
        scopedOverrides.set(EmbedRuntimePolicyService, context.injector.get(EmbedRuntimePolicyService));
    }
    const scopedContextService = createScopedRuntimeContextService(context.injector, context.childType);
    if (scopedContextService) {
        scopedOverrides.set(IContextService, scopedContextService);
    }

    scopedInjector = createEmbedScopedInjector(context.injector, scopedOverrides);
    const ownedScopedServices: IDisposable[] = [];
    const scopedMenuManagerService = createScopedMenuManagerService(context.injector, scopedInjector);
    if (scopedMenuManagerService) {
        scopedInjector.add([IMenuManagerService, { useValue: scopedMenuManagerService }]);
        const scopedRibbonService = new DesktopRibbonService(scopedMenuManagerService, scopedInstanceService as IUniverInstanceService);
        scopedInjector.add([IRibbonService, { useValue: scopedRibbonService }]);
        ownedScopedServices.push(scopedRibbonService);
    }
    if (context.renderScope.fullscreen) {
        const fullscreenContextMenuService = createFullscreenContextMenuService(scopedInjector);
        const fullscreenPopupService = new CanvasPopupService();
        const fullscreenSidebarService = new DesktopSidebarService();
        scopedInjector.add([IContextMenuService, { useValue: fullscreenContextMenuService }]);
        scopedInjector.add([ICanvasPopupService, { useValue: fullscreenPopupService }]);
        scopedInjector.add([ISidebarService, { useValue: fullscreenSidebarService }]);
        ownedScopedServices.push(fullscreenContextMenuService, fullscreenPopupService, fullscreenSidebarService);
    } else {
        const scopedContextMenuService = createScopedContextMenuService(context.injector, scopedInjector);
        if (scopedContextMenuService) {
            scopedInjector.add([IContextMenuService, { useValue: scopedContextMenuService }]);
        }
    }
    const scopedLayoutService = createScopedLayoutService(context.injector, context);
    if (scopedLayoutService) {
        scopedInjector.add([ILayoutService, { useValue: scopedLayoutService }]);
    }
    if (ownedScopedServices.length) {
        const disposeScopedInjector = scopedInjector.dispose.bind(scopedInjector);
        let disposed = false;
        scopedInjector.dispose = () => {
            if (disposed) {
                return;
            }
            disposed = true;
            ownedScopedServices.forEach((service) => service.dispose());
            disposeScopedInjector();
        };
    }

    return scopedInjector;
}

export function createEmbedScopedConfigInjector(
    parentInjector: Injector,
    configOverrides: IEmbedScopedConfigOverrides
): Injector | undefined {
    if (!parentInjector.has(IConfigService)) {
        return undefined;
    }

    const configService = parentInjector.get<IConfigServiceType>(IConfigService);
    return createEmbedScopedInjector(parentInjector, new Map([
        [IConfigService, createEmbedScopedConfigService(configService, configOverrides)],
    ]));
}

type EmbedScopedUnit = UnitModel<object, UniverInstanceType>;

function createScopedEmbedInstanceService(
    instanceService: IUniverInstanceService,
    context: IEmbedChildContainerContext,
    childUnit: EmbedScopedUnit,
    scopedCurrentChildUnit$: BehaviorSubject<EmbedScopedUnit>,
    scopedFocusedUnitId$: BehaviorSubject<string | null>
): IUniverInstanceService {
    const scopedInstanceService = Object.create(instanceService) as IUniverInstanceService;
    (scopedInstanceService as IUniverInstanceService & { dispose: () => void }).dispose = () => {};
    scopedInstanceService.getCurrentUnitOfType = ((type: UniverInstanceType) => type === context.childType
        ? scopedCurrentChildUnit$.getValue()
        : instanceService.getCurrentUnitOfType(type)) as IUniverInstanceService['getCurrentUnitOfType'];
    scopedInstanceService.getCurrentTypeOfUnit$ = ((type: UniverInstanceType) => type === context.childType
        ? scopedCurrentChildUnit$.asObservable()
        : instanceService.getCurrentTypeOfUnit$(type)) as IUniverInstanceService['getCurrentTypeOfUnit$'];
    scopedInstanceService.setCurrentUnitForType = (unitId: string) => {
        if (unitId === context.childUnitId) {
            if (scopedCurrentChildUnit$.getValue() !== childUnit) {
                scopedCurrentChildUnit$.next(childUnit);
            }
            return;
        }

        instanceService.setCurrentUnitForType(unitId);
    };
    scopedInstanceService.getFocusedUnit = () => {
        const focusedUnitId = scopedFocusedUnitId$.getValue();
        if (focusedUnitId === null) {
            return null;
        }

        return focusedUnitId === context.childUnitId ? childUnit : instanceService.getFocusedUnit();
    };
    scopedInstanceService.focused$ = scopedFocusedUnitId$.asObservable();
    scopedInstanceService.focusUnit = (unitId: string | null) => {
        if (unitId === null || unitId === context.childUnitId) {
            if (scopedFocusedUnitId$.getValue() !== unitId) {
                scopedFocusedUnitId$.next(unitId);
            }
            return;
        }

        instanceService.focusUnit(unitId);
    };
    return scopedInstanceService;
}

function createScopedEmbedCommandService(
    commandService: ICommandService,
    context: IEmbedChildContainerContext,
    instanceService: IUniverInstanceService,
    shouldSyncParentFocusDuringCommand: boolean,
    getScopedInjector: () => Injector
): ICommandService {
    const scopedCommandService = Object.create(commandService) as ICommandService;
    (scopedCommandService as ICommandService & { dispose: () => void }).dispose = () => {};
    scopedCommandService.executeCommand = (async (...args: Parameters<ICommandService['executeCommand']>) => {
        const execute = () => commandService.executeCommand(
            args[0],
            withNestedCreateEmbedGuard(context, args[0], args[1]),
            withScopedExecutionInjector(args[2], getScopedInjector())
        );
        if (!shouldSyncParentFocusDuringCommand) {
            return await execute();
        }

        const previous = instanceService.getCurrentUnitOfType(context.childType);
        const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
        try {
            instanceService.setCurrentUnitForType(context.childUnitId);
            instanceService.focusUnit(context.childUnitId);
            return await execute();
        } finally {
            if (previous) {
                instanceService.setCurrentUnitForType(previous.getUnitId());
            }
            restoreFocusAfterScopedCommand(context, instanceService, previousFocusedUnitId);
        }
    }) as ICommandService['executeCommand'];
    scopedCommandService.syncExecuteCommand = ((...args: Parameters<ICommandService['syncExecuteCommand']>) => {
        const execute = () => commandService.syncExecuteCommand(
            args[0],
            withNestedCreateEmbedGuard(context, args[0], args[1]),
            withScopedExecutionInjector(args[2], getScopedInjector())
        );
        if (!shouldSyncParentFocusDuringCommand) {
            return execute();
        }

        const previous = instanceService.getCurrentUnitOfType(context.childType);
        const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
        try {
            instanceService.setCurrentUnitForType(context.childUnitId);
            instanceService.focusUnit(context.childUnitId);
            return execute();
        } finally {
            if (previous) {
                instanceService.setCurrentUnitForType(previous.getUnitId());
            }
            restoreFocusAfterScopedCommand(context, instanceService, previousFocusedUnitId);
        }
    }) as ICommandService['syncExecuteCommand'];
    return scopedCommandService;
}

function shouldSyncParentFocusForScopedCommand(context: IEmbedChildContainerContext): boolean {
    if (context.renderScope.fullscreen) {
        return true;
    }

    if (context.descriptor.entry === 'docs-custom-block') {
        return true;
    }

    return isTabPeerRuntime(context);
}

function isTabPeerRuntime(context: IEmbedChildContainerContext): boolean {
    return context.descriptor.entry === 'sheets-sheet-tab' ||
        context.descriptor.entry === 'bases-table-list-block' ||
        context.descriptor.entry === 'slides-page-list-block' ||
        context.layout === 'tab-peer' ||
        Boolean(context.descriptor.sourceMeta?.tab);
}

function createScopedRuntimeContextService(
    injector: Pick<Injector, 'get' | 'has'>,
    childType: UniverInstanceType
): IContextService | undefined {
    if (!injector.has(IContextService)) {
        return undefined;
    }

    const contextService = injector.get(IContextService);
    const scopedContextValues = createInitialScopedRuntimeContextValues(childType);
    const scopedContextChanged$ = new Subject<Record<string, boolean>>();
    const parentContextChanged$ = (contextService.contextChanged$ ?? EMPTY).pipe(
        map((change) => Object.fromEntries(
            Object.entries(change).filter(([key]) => !isScopedRuntimeContextKey(key))
        )),
        filter((change) => Object.keys(change).length > 0)
    );
    const contextChanged$ = merge(parentContextChanged$, scopedContextChanged$);

    const scopedContextService = Object.create(contextService) as IContextService;
    Object.defineProperty(scopedContextService, 'contextChanged$', {
        value: contextChanged$,
        configurable: true,
    });
    scopedContextService.getContextValue = (key: string) => isScopedRuntimeContextKey(key)
        ? getScopedRuntimeContextValue(scopedContextValues, key)
        : contextService.getContextValue(key);
    scopedContextService.setContextValue = (key: string, value: boolean) => {
        if (!isScopedRuntimeContextKey(key)) {
            contextService.setContextValue(key, value);
            return;
        }

        scopedContextValues.set(key, value);
        scopedContextChanged$.next({ [key]: value });
    };
    scopedContextService.subscribeContextValue$ = (key: string) => {
        if (!isScopedRuntimeContextKey(key)) {
            return contextService.subscribeContextValue$(key);
        }

        return new Observable<boolean>((observer) => {
            const subscription = scopedContextChanged$
                .pipe(filter((change) => typeof change[key] !== 'undefined'))
                .subscribe((change) => observer.next(change[key]));
            observer.next(getScopedRuntimeContextValue(scopedContextValues, key));

            return () => subscription.unsubscribe();
        });
    };
    return scopedContextService;
}

function createInitialScopedRuntimeContextValues(childType: UniverInstanceType): Map<string, boolean> {
    return new Map([
        [FOCUSING_UNIT, true],
        [FOCUSING_SHEET, childType === UniverInstanceType.UNIVER_SHEET],
        [FOCUSING_DOC, childType === UniverInstanceType.UNIVER_DOC],
        [FOCUSING_SLIDE, childType === UniverInstanceType.UNIVER_SLIDE],
    ]);
}

function getScopedRuntimeContextValue(scopedContextValues: Map<string, boolean>, key: string): boolean {
    return scopedContextValues.get(key) ?? false;
}

function isScopedRuntimeContextKey(key: string): boolean {
    return key.startsWith('FOCUSING_') ||
        key === EDITOR_ACTIVATED ||
        key === FORMULA_EDITOR_ACTIVATED;
}

function createEmbedScopedConfigService(
    configService: IConfigServiceType,
    configOverrides: IEmbedScopedConfigOverrides
): IConfigServiceType {
    const scopedConfigService = Object.create(configService) as IConfigServiceType;
    scopedConfigService.getConfig = (<T>(id: string | symbol): T => {
        const config = configService.getConfig<T>(id);
        const override = configOverrides.get(id);
        return (override ? override(config) : config) as T;
    }) as IConfigServiceType['getConfig'];
    return scopedConfigService;
}

function withScopedExecutionInjector(
    options: IExecutionOptions | undefined,
    injector: Injector
): IExecutionOptions {
    const scopedOptions: IExecutionOptions = { ...options };
    scopedOptions[COMMAND_EXECUTION_INJECTOR_KEY] = injector;
    return scopedOptions;
}

function withNestedCreateEmbedGuard(
    context: IEmbedChildContainerContext,
    commandId: string,
    params: object | undefined
): object | undefined {
    if (commandId !== CreateEmbedCommand.id || !params || typeof params !== 'object') {
        return params;
    }

    const createParams = params as ICreateEmbedCommandParams;
    if (createParams.parentEmbedId) {
        return createParams;
    }

    return {
        ...createParams,
        parentEmbedId: context.embedId,
    };
}

export function createEmbedScopedInjector(
    parentInjector: Injector,
    overrides: ReadonlyMap<unknown, unknown>,
    sharedRootInjector: Injector = parentInjector
): Injector {
    const resolvedSharedRootInjector = getEmbedSharedRootInjector(parentInjector) ?? sharedRootInjector;
    const localOverrides = new Map(overrides);
    const localFactories = new Map<unknown, () => unknown>();
    const localDependencyIdentifiers = new Set<unknown>();
    const localDependencyIdentifierAliases = new Map<unknown, unknown>();
    let childInjector: Injector | undefined;
    localOverrides.forEach((_value, identifier) => {
        registerLocalDependencyIdentifier(identifier);
    });

    function registerLocalDependencyIdentifier(identifier: unknown): unknown {
        const dependencyIdentifier = getDependencyIdentifierKey(identifier);
        localDependencyIdentifiers.add(dependencyIdentifier);
        if (!localDependencyIdentifierAliases.has(dependencyIdentifier)) {
            localDependencyIdentifierAliases.set(dependencyIdentifier, identifier);
        }
        return dependencyIdentifier;
    }

    const resolveLocalIdentifier = (identifier: unknown): unknown => {
        if (localOverrides.has(identifier) || localFactories.has(identifier)) {
            return identifier;
        }

        return localDependencyIdentifierAliases.get(getDependencyIdentifierKey(identifier)) ?? identifier;
    };
    const getLocal = (identifier: unknown) => {
        const localIdentifier = resolveLocalIdentifier(identifier);
        if (localOverrides.has(localIdentifier)) {
            return localOverrides.get(localIdentifier);
        }

        const factory = localFactories.get(localIdentifier);
        if (!factory) {
            return undefined;
        }

        const value = factory();
        localFactories.delete(localIdentifier);
        localOverrides.set(localIdentifier, value);
        syncResolvedLocalToChildInjector(childInjector, localIdentifier, value);
        if (localIdentifier !== identifier) {
            syncResolvedLocalToChildInjector(childInjector, identifier, value);
        }
        return value;
    };
    const hasLocal = (identifier: unknown) => {
        const localIdentifier = resolveLocalIdentifier(identifier);
        return localOverrides.has(localIdentifier) || localFactories.has(localIdentifier);
    };
    const hasLocalDependencyIdentifier = (identifier: unknown) =>
        localDependencyIdentifiers.has(getDependencyIdentifierKey(identifier));
    const shouldKeepScopedLocalDependency = (identifier: unknown) =>
        EMBED_SCOPED_LOCAL_IDENTIFIER_KEYS.has(getDependencyIdentifierKey(identifier) as string);
    const shouldResolveFromParent = (identifier: unknown) =>
        !hasLocalDependencyIdentifier(identifier) && parentInjector.has(identifier as never);

    const getChildInjector = (): Injector | undefined => {
        if (childInjector) {
            return childInjector;
        }

        const createChild = (parentInjector as unknown as { createChild?: (dependencies?: unknown[]) => Injector }).createChild;
        if (typeof createChild !== 'function') {
            return undefined;
        }

        childInjector = createChild.call(parentInjector, [
            ...createValueDependencies(localOverrides),
            [Injector, { useFactory: () => childInjector }],
        ]);
        return childInjector;
    };

    const scopedInjector: Injector = {
        has: (identifier: Parameters<Injector['get']>[0]) => {
            if (identifier === Injector) {
                return true;
            }
            if (hasLocal(identifier)) {
                return true;
            }
            if (shouldResolveFromParent(identifier)) {
                return true;
            }

            const child = getChildInjector();
            return child?.has(identifier) ?? parentInjector.has(identifier);
        },
        get: (identifier: Parameters<Injector['get']>[0], ...args: unknown[]) => {
            if (identifier === Injector) {
                return scopedInjector;
            }
            if (hasLookup(args, LookUp.SELF)) {
                const child = getChildInjector();
                syncLocalToChildInjector(child, identifier);
                const resolved = getResolvedDependencyFromInjector(child, identifier);
                if (resolved.resolved) {
                    return resolved.value;
                }
                return child
                    ? getFromInjector(child, identifier, args)
                    : getFromInjector(parentInjector, identifier, args);
            }
            if (hasLocal(identifier)) {
                return getLocal(identifier);
            }
            if (hasLookup(args, LookUp.SKIP_SELF)) {
                return getFromInjector(parentInjector, identifier, withoutLookup(args, LookUp.SKIP_SELF));
            }
            if (shouldResolveFromParent(identifier)) {
                return getFromInjector(parentInjector, identifier, args);
            }

            const child = getChildInjector();
            return child
                ? getFromInjector(child, identifier, args)
                : getFromInjector(parentInjector, identifier, args);
        },
        invoke: <T, P extends unknown[] = []>(factory: (accessor: IAccessor, ...args: P) => T, ...args: P): T => factory({
            has: (identifier) => {
                if (identifier === Injector) {
                    return true;
                }
                if (hasLocal(identifier)) {
                    return true;
                }
                if (shouldResolveFromParent(identifier)) {
                    return true;
                }

                const child = getChildInjector();
                return child?.has(identifier) ?? parentInjector.has(identifier);
            },
            get: (identifier, ...args: unknown[]) => {
                if (identifier === Injector) {
                    return scopedInjector as never;
                }
                if (hasLookup(args, LookUp.SELF)) {
                    const child = getChildInjector();
                    syncLocalToChildInjector(child, identifier);
                    const resolved = getResolvedDependencyFromInjector(child, identifier);
                    if (resolved.resolved) {
                        return resolved.value as never;
                    }
                    return (child
                        ? getFromInjector(child, identifier, args)
                        : getFromInjector(parentInjector, identifier, args)) as never;
                }
                if (hasLocal(identifier)) {
                    return getLocal(identifier) as never;
                }
                if (hasLookup(args, LookUp.SKIP_SELF)) {
                    return getFromInjector(parentInjector, identifier, withoutLookup(args, LookUp.SKIP_SELF)) as never;
                }
                if (shouldResolveFromParent(identifier)) {
                    return getFromInjector(parentInjector, identifier, args) as never;
                }

                const child = getChildInjector();
                return (child
                    ? getFromInjector(child, identifier, args)
                    : getFromInjector(parentInjector, identifier, args)) as never;
            },
        } as IAccessor, ...args),
        add: (dependency: unknown) => {
            const localDependency = parseLocalDependency(dependency);
            if (localDependency) {
                if (
                    localDependency.kind !== 'factory' &&
                    shouldResolveFromParent(localDependency.identifier) &&
                    !shouldKeepScopedLocalDependency(localDependency.identifier)
                ) {
                    return;
                }

                const dependencyIdentifier = getDependencyIdentifierKey(localDependency.identifier);
                if (localDependencyIdentifiers.has(dependencyIdentifier)) {
                    return;
                }

                registerLocalDependencyIdentifier(localDependency.identifier);
                if (localDependency.kind === 'value') {
                    localFactories.delete(localDependency.identifier);
                    localOverrides.set(localDependency.identifier, localDependency.value);
                } else {
                    const child = getChildInjector();
                    if (child) {
                        if (!injectorHasOwnDependency(child, localDependency.identifier)) {
                            child.add(dependency as never);
                        }
                    } else {
                        localOverrides.delete(localDependency.identifier);
                        localFactories.set(localDependency.identifier, localDependency.factory);
                    }
                }
                return;
            }

            const dependencyIdentifier = getDependencyIdentifierKey(getDependencyIdentifier(dependency));
            if (dependencyIdentifier != null) {
                if (localDependencyIdentifiers.has(dependencyIdentifier)) {
                    return;
                }

                registerLocalDependencyIdentifier(getDependencyIdentifier(dependency));
            }

            const child = getChildInjector();
            if (child) {
                child.add(dependency as never);
                return;
            }

            parentInjector.add(dependency as never);
        },
        createChild: (dependencies: unknown[] = []) => {
            const childLocalOverrides = new Map(localOverrides);
            const childDependencies: unknown[] = [];
            dependencies.forEach((dependency) => {
                const localDependency = parseLocalDependency(dependency);
                if (localDependency?.kind === 'value') {
                    childLocalOverrides.set(localDependency.identifier, localDependency.value);
                    return;
                }

                childDependencies.push(dependency);
            });
            const childScopedInjector = createEmbedScopedInjector(parentInjector, childLocalOverrides, resolvedSharedRootInjector);
            childDependencies.forEach((dependency) => {
                childScopedInjector.add(dependency as never);
            });

            return childScopedInjector;
        },
        createInstance: (...args: unknown[]) => {
            const child = getChildInjector();
            const createInstance = (child as unknown as { createInstance?: (...args: unknown[]) => unknown } | undefined)?.createInstance;
            if (child && typeof createInstance === 'function') {
                syncConstructorLocalDependenciesToChildInjector(child, args[0]);
                return createInstance.apply(child, args);
            }

            const parentCreateInstance = (parentInjector as unknown as { createInstance?: (...args: unknown[]) => unknown }).createInstance;
            if (typeof parentCreateInstance === 'function') {
                return parentCreateInstance.apply(parentInjector, args);
            }

            const [Ctor, ...rest] = args as [new (...ctorArgs: unknown[]) => unknown, ...unknown[]];
            return new Ctor(...rest);
        },
        dispose: () => {
            if (childInjector) {
                disposeChildInjectorWithoutSharedResolved(childInjector, resolvedSharedRootInjector, localOverrides.values());
            }
            childInjector = undefined;
            localDependencyIdentifiers.clear();
            localDependencyIdentifierAliases.clear();
            localFactories.clear();
        },
    } as unknown as Injector;

    function syncLocalToChildInjector(child: Injector | undefined, identifier: unknown): void {
        if (!child || !hasLocal(identifier)) {
            return;
        }

        syncResolvedLocalToChildInjector(child, identifier, getLocal(identifier));
    }

    function syncConstructorLocalDependenciesToChildInjector(child: Injector, ctor: unknown): void {
        getDeclaredDependencyIdentifiers(ctor).forEach((identifier) => syncLocalToChildInjector(child, identifier));
    }

    (scopedInjector as { __embedSharedRootInjector?: Injector }).__embedSharedRootInjector = resolvedSharedRootInjector;

    return scopedInjector;
}

function restoreFocusAfterScopedCommand(
    context: IEmbedChildContainerContext,
    instanceService: IUniverInstanceService,
    previousFocusedUnitId: string | null
): void {
    const runtimeFocusCoordinator = context.injector.has(EmbedRuntimeFocusCoordinator)
        ? context.injector.get(EmbedRuntimeFocusCoordinator)
        : undefined;

    instanceService.focusUnit(
        runtimeFocusCoordinator?.hasChildInteractionLease(context.embedId)
            ? context.childUnitId
            : previousFocusedUnitId
    );
}

function getDependencyIdentifier(dependency: unknown): unknown {
    return Array.isArray(dependency) ? dependency[0] : dependency;
}

function getDependencyIdentifierKey(identifier: unknown): unknown {
    const decoratorName = (identifier as { decoratorName?: unknown } | undefined)?.decoratorName;
    if (typeof decoratorName === 'string' && decoratorName) {
        return `identifier:${decoratorName}`;
    }

    return identifier;
}

function hasLookup(args: readonly unknown[], lookup: LookUp): boolean {
    return args.includes(lookup);
}

function withoutLookup(args: readonly unknown[], lookup: LookUp): unknown[] {
    return args.filter((arg) => arg !== lookup);
}

function getFromInjector(injector: Injector, identifier: unknown, args: readonly unknown[]): unknown {
    return (injector.get as (...getArgs: unknown[]) => unknown)(identifier, ...args);
}

function getResolvedDependencyFromInjector(injector: Injector | undefined, identifier: unknown): { resolved: true; value: unknown } | { resolved: false } {
    const resolvedDependencies = (injector as unknown as {
        resolvedDependencyCollection?: {
            resolvedDependencies?: Map<unknown, unknown[]>;
        };
    } | undefined)?.resolvedDependencyCollection?.resolvedDependencies;
    if (!resolvedDependencies) {
        return { resolved: false };
    }

    const exact = getSingleResolvedDependencyFromItems(resolvedDependencies.get(identifier));
    if (exact.resolved) {
        return exact;
    }

    const key = getDependencyIdentifierKey(identifier);
    for (const [resolvedIdentifier, items] of resolvedDependencies) {
        if (resolvedIdentifier === identifier || getDependencyIdentifierKey(resolvedIdentifier) !== key) {
            continue;
        }

        const resolved = getSingleResolvedDependencyFromItems(items);
        if (resolved.resolved) {
            return resolved;
        }
    }

    return { resolved: false };
}

function getSingleResolvedDependencyFromItems(items: unknown[] | undefined): { resolved: true; value: unknown } | { resolved: false } {
    if (!items || items.length !== 1) {
        return { resolved: false };
    }

    return { resolved: true, value: items[0] };
}

function syncResolvedLocalToChildInjector(childInjector: Injector | undefined, identifier: unknown, value: unknown): void {
    if (!childInjector || injectorHasOwnDependency(childInjector, identifier)) {
        return;
    }

    childInjector.add([identifier, { useValue: value }] as never);
}

function getDeclaredDependencyIdentifiers(ctor: unknown): unknown[] {
    if (!ctor || (typeof ctor !== 'function' && typeof ctor !== 'object')) {
        return [];
    }

    for (const symbol of Object.getOwnPropertySymbols(ctor)) {
        const value = (ctor as Record<symbol, unknown>)[symbol];
        if (!Array.isArray(value)) {
            continue;
        }

        const identifiers = value
            .map((descriptor) => (descriptor as { identifier?: unknown } | undefined)?.identifier)
            .filter((identifier) => identifier !== undefined);
        if (identifiers.length) {
            return identifiers;
        }
    }

    return [];
}

function injectorHasOwnDependency(injector: Injector, identifier: unknown): boolean {
    const rawInjector = injector as unknown as {
        dependencyCollection?: { has?: (id: unknown) => boolean };
        resolvedDependencyCollection?: { has?: (id: unknown) => boolean };
    };

    return Boolean(
        rawInjector.dependencyCollection?.has?.(identifier) ||
        rawInjector.resolvedDependencyCollection?.has?.(identifier)
    );
}

function getEmbedSharedRootInjector(injector: Injector): Injector | undefined {
    return (injector as { __embedSharedRootInjector?: Injector }).__embedSharedRootInjector;
}

function disposeChildInjectorWithoutSharedResolved(
    childInjector: Injector,
    parentInjector: Injector,
    extraSharedInstances: Iterable<unknown> = []
): void {
    const sharedInstances = collectResolvedInstances(parentInjector);
    for (const item of extraSharedInstances) {
        sharedInstances.add(item);
    }
    pruneSharedResolvedInstances(childInjector, sharedInstances);
    childInjector.dispose();
}

function collectResolvedInstances(injector: Injector): Set<unknown> {
    const instances = new Set<unknown>();
    const resolvedDependencies = getResolvedDependencies(injector);
    if (!resolvedDependencies) {
        return instances;
    }

    resolvedDependencies.forEach((items) => {
        if (!Array.isArray(items)) {
            return;
        }

        items.forEach((item) => instances.add(item));
    });

    return instances;
}

function pruneSharedResolvedInstances(injector: Injector, sharedInstances: ReadonlySet<unknown>, visited = new Set<unknown>()): void {
    if (visited.has(injector)) {
        return;
    }
    visited.add(injector);

    const children = (injector as unknown as { children?: Injector[] }).children;
    children?.forEach((child) => pruneSharedResolvedInstances(child, sharedInstances, visited));

    const resolvedDependencies = getResolvedDependencies(injector);
    if (!resolvedDependencies) {
        return;
    }

    resolvedDependencies.forEach((items, identifier) => {
        if (!Array.isArray(items)) {
            return;
        }

        const ownedItems = items.filter((item) => !sharedInstances.has(item));
        if (ownedItems.length === items.length) {
            return;
        }

        if (ownedItems.length === 0) {
            resolvedDependencies.delete(identifier);
            return;
        }

        resolvedDependencies.set(identifier, ownedItems);
    });
}

function getResolvedDependencies(injector: Injector): Map<unknown, unknown[]> | undefined {
    return (injector as unknown as {
        resolvedDependencyCollection?: {
            resolvedDependencies?: Map<unknown, unknown[]>;
        };
    }).resolvedDependencyCollection?.resolvedDependencies;
}

function createValueDependencies(overrides: ReadonlyMap<unknown, unknown>): unknown[] {
    return Array.from(overrides, ([identifier, value]) => [identifier, { useValue: value }]);
}

function parseLocalDependency(dependency: unknown): { kind: 'factory'; identifier: unknown; factory: () => unknown } | { kind: 'value'; identifier: unknown; value: unknown } | undefined {
    if (!Array.isArray(dependency) || dependency.length < 2) {
        return undefined;
    }

    const [identifier, dependencyItem] = dependency as [unknown, { useFactory?: () => unknown; useValue?: unknown }];
    if (!dependencyItem || typeof dependencyItem !== 'object') {
        return undefined;
    }

    if ('useValue' in dependencyItem) {
        return {
            kind: 'value',
            identifier,
            value: dependencyItem.useValue,
        };
    }

    if (typeof dependencyItem.useFactory === 'function') {
        return {
            kind: 'factory',
            identifier,
            factory: dependencyItem.useFactory,
        };
    }

    return undefined;
}

function createScopedMenuManagerService(parentInjector: Injector, scopedInjector: Injector): IMenuManagerService | undefined {
    if (!parentInjector.has(IMenuManagerService)) {
        return undefined;
    }

    const menuManagerService = parentInjector.get(IMenuManagerService);
    const createScoped = (menuManagerService as MenuManagerService).createScoped;

    return typeof createScoped === 'function'
        ? createScoped.call(menuManagerService, scopedInjector)
        : menuManagerService;
}

function createScopedContextMenuService(parentInjector: Injector, scopedInjector: Injector): IContextMenuService | undefined {
    if (!parentInjector.has(IContextMenuService)) {
        return undefined;
    }

    const contextMenuService = parentInjector.get(IContextMenuService);
    const triggerContextMenu: IContextMenuService['triggerContextMenu'] = (event, menuType, context) => {
        contextMenuService.triggerContextMenu(event, menuType, {
            ...context,
            injector: context?.injector ?? scopedInjector,
        });
    };

    return {
        get disabled() {
            return contextMenuService.disabled;
        },
        set disabled(value: boolean) {
            contextMenuService.disabled = value;
        },
        get visible() {
            return contextMenuService.visible;
        },
        enable: () => contextMenuService.enable(),
        disable: () => contextMenuService.disable(),
        triggerContextMenu,
        hideContextMenu: () => contextMenuService.hideContextMenu(),
        registerContextMenuHandler: (handler) => contextMenuService.registerContextMenuHandler(handler),
    };
}

function createFullscreenContextMenuService(scopedInjector: Injector): IContextMenuService & IDisposable {
    const contextMenuService = new ContextMenuService();
    const triggerContextMenu: IContextMenuService['triggerContextMenu'] = (event, menuType, context) => {
        contextMenuService.triggerContextMenu(event, menuType, {
            ...context,
            injector: scopedInjector,
        });
    };

    return {
        get disabled() {
            return contextMenuService.disabled;
        },
        set disabled(value: boolean) {
            contextMenuService.disabled = value;
        },
        get visible() {
            return contextMenuService.visible;
        },
        enable: () => contextMenuService.enable(),
        disable: () => contextMenuService.disable(),
        triggerContextMenu,
        hideContextMenu: () => contextMenuService.hideContextMenu(),
        registerContextMenuHandler: (handler) => contextMenuService.registerContextMenuHandler(handler),
        dispose: () => contextMenuService.dispose(),
    };
}

function createScopedLayoutService(parentInjector: Injector, context: IEmbedChildContainerContext): ILayoutService | undefined {
    if (!parentInjector.has(ILayoutService)) {
        return undefined;
    }

    const layoutService = parentInjector.get(ILayoutService);
    const interactionBoundaryService = parentInjector.has(EmbedInteractionBoundaryService)
        ? parentInjector.get(EmbedInteractionBoundaryService)
        : undefined;
    const runtimeFocusCoordinator = parentInjector.has(EmbedRuntimeFocusCoordinator)
        ? parentInjector.get(EmbedRuntimeFocusCoordinator)
        : undefined;
    const rootElement = context.runtimeScope?.roots?.root ?? context.renderScope.rootElement;
    const contentElement = context.runtimeScope?.roots?.content ?? context.renderScope.contentRoot ?? rootElement;
    const localContainers = new Set<HTMLElement>([rootElement, contentElement]);
    const registerLocalContainer = (container: HTMLElement, options?: { registerChildInteraction?: boolean }) => {
        localContainers.add(container);
        const roleAttributeDisposable = options?.registerChildInteraction
            ? markChildEditorRuntimeFocusTree(container)
            : undefined;
        const boundaryDisposable = options?.registerChildInteraction
            ? interactionBoundaryService?.registerOwnedElement(context.embedId, container)
            : undefined;
        const focusDisposable = options?.registerChildInteraction
            ? runtimeFocusCoordinator?.registerElement({
                embedId: context.embedId,
                role: 'child-editor',
                element: container,
            })
            : undefined;

        return toDisposable(() => {
            focusDisposable?.dispose();
            boundaryDisposable?.dispose();
            roleAttributeDisposable?.dispose();
            localContainers.delete(container);
        });
    };
    const containsLocalContainer = (element: HTMLElement | null | undefined) => {
        if (!element) {
            return false;
        }

        return [...localContainers].some((container) => container === element || container.contains(element));
    };

    return {
        get isFocused() {
            return layoutService.isFocused;
        },
        get rootContainerElement() {
            return rootElement;
        },
        focus: () => layoutService.focus(),
        registerFocusHandler: (type, handler) => layoutService.registerFocusHandler(type, handler),
        registerRootContainerElement: registerLocalContainer,
        registerContentElement: registerLocalContainer,
        registerContainerElement: (container) => registerLocalContainer(container, { registerChildInteraction: true }),
        getContentElement: () => contentElement,
        checkElementInCurrentContainers: (element) =>
            containsLocalContainer(element) ||
            interactionBoundaryService?.contains(context.embedId, element) ||
            layoutService.checkElementInCurrentContainers(element),
        checkContentIsFocused: () =>
            containsLocalContainer(contentElement.ownerDocument.activeElement as HTMLElement | null) ||
            runtimeFocusCoordinator?.hasChildInteractionLease(context.embedId) ||
            layoutService.checkContentIsFocused(),
    };
}

function markChildEditorRuntimeFocusTree(container: HTMLElement) {
    const previousValues = new Map<HTMLElement, string | null>();
    const mark = (element: HTMLElement) => {
        previousValues.set(element, element.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE));
        element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, 'child-editor');
    };

    mark(container);
    container.querySelectorAll<HTMLElement>('*').forEach(mark);

    return toDisposable(() => {
        previousValues.forEach((previousValue, element) => {
            if (previousValue == null) {
                element.removeAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE);
                return;
            }

            element.setAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, previousValue);
        });
    });
}
