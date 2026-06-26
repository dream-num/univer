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

import type { IAccessor, IExecutionOptions, IUndoRedoItem, UniverInstanceType } from '@univerjs/core';
import type { MenuManagerService } from '@univerjs/ui';
import type { IEmbedChildContainerContext } from '../types/embed-ui';
import {
    COMMAND_EXECUTION_INJECTOR_KEY,
    ICommandService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    toDisposable,
} from '@univerjs/core';
import { IContextMenuService, ILayoutService, IMenuManagerService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { EmbedInteractionBoundaryService } from './embed-interaction-boundary.service';
import {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from './embed-runtime-focus-coordinator.service';
import { EmbedUndoBridgeService } from './embed-undo-bridge.service';

export function createEmbedChildUnitScopedInjector(
    context: IEmbedChildContainerContext
): Injector | undefined {
    const instanceService = context.injector.get(IUniverInstanceService);
    const childUnit = instanceService.getUnit(context.childUnitId, context.childType);
    if (!childUnit) {
        return undefined;
    }

    const scopedCurrentChildUnit$ = new BehaviorSubject(childUnit);
    const scopedFocusedUnitId$ = new BehaviorSubject<string | null>(childUnit.getUnitId());
    const scopedInstanceService = new Proxy(instanceService, {
        get(target, property, receiver) {
            if (property === 'dispose') {
                return () => {};
            }
            if (property === 'getCurrentUnitOfType') {
                return (type: UniverInstanceType) => type === context.childType
                    ? scopedCurrentChildUnit$.getValue()
                    : target.getCurrentUnitOfType(type);
            }
            if (property === 'getCurrentTypeOfUnit$') {
                return (type: UniverInstanceType) => type === context.childType
                    ? scopedCurrentChildUnit$.asObservable()
                    : target.getCurrentTypeOfUnit$(type);
            }
            if (property === 'setCurrentUnitForType') {
                return (unitId: string) => {
                    if (unitId === context.childUnitId) {
                        scopedCurrentChildUnit$.next(childUnit);
                        return;
                    }

                    target.setCurrentUnitForType(unitId);
                };
            }
            if (property === 'getFocusedUnit') {
                return () => {
                    const focusedUnitId = scopedFocusedUnitId$.getValue();
                    if (focusedUnitId === null) {
                        return null;
                    }

                    return focusedUnitId === context.childUnitId ? childUnit : target.getFocusedUnit();
                };
            }
            if (property === 'focused$') {
                return scopedFocusedUnitId$.asObservable();
            }
            if (property === 'focusUnit') {
                return (unitId: string | null) => {
                    if (unitId === null || unitId === context.childUnitId) {
                        scopedFocusedUnitId$.next(unitId);
                        return;
                    }

                    target.focusUnit(unitId);
                };
            }
            return Reflect.get(target, property, receiver);
        },
    });

    let scopedInjector: Injector;
    const commandService = new Proxy(context.injector.get(ICommandService), {
        get(target, property, receiver) {
            if (property === 'dispose') {
                return () => {};
            }
            if (property === 'executeCommand') {
                return async (...args: Parameters<ICommandService['executeCommand']>) => {
                    const previous = instanceService.getCurrentUnitOfType(context.childType);
                    const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
                    try {
                        instanceService.setCurrentUnitForType(context.childUnitId);
                        instanceService.focusUnit(context.childUnitId);
                        return await target.executeCommand(args[0], args[1], withScopedExecutionInjector(args[2], scopedInjector));
                    } finally {
                        if (previous) {
                            instanceService.setCurrentUnitForType(previous.getUnitId());
                        }
                        restoreFocusAfterScopedCommand(context, instanceService, previousFocusedUnitId);
                    }
                };
            }
            if (property === 'syncExecuteCommand') {
                return (...args: Parameters<ICommandService['syncExecuteCommand']>) => {
                    const previous = instanceService.getCurrentUnitOfType(context.childType);
                    const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
                    try {
                        instanceService.setCurrentUnitForType(context.childUnitId);
                        instanceService.focusUnit(context.childUnitId);
                        return target.syncExecuteCommand(args[0], args[1], withScopedExecutionInjector(args[2], scopedInjector));
                    } finally {
                        if (previous) {
                            instanceService.setCurrentUnitForType(previous.getUnitId());
                        }
                        restoreFocusAfterScopedCommand(context, instanceService, previousFocusedUnitId);
                    }
                };
            }
            return Reflect.get(target, property, receiver);
        },
    });

    const scopedOverrides = new Map<unknown, unknown>([
        [IUniverInstanceService, scopedInstanceService],
        [ICommandService, commandService],
    ]);
    const scopedUndoRedoService = createScopedUndoRedoService(context.injector, context.childUnitId);
    if (scopedUndoRedoService) {
        scopedOverrides.set(IUndoRedoService, scopedUndoRedoService);
    }

    scopedInjector = createEmbedScopedInjector(context.injector, scopedOverrides);
    const scopedMenuManagerService = createScopedMenuManagerService(context.injector, scopedInjector);
    if (scopedMenuManagerService) {
        scopedInjector.add([IMenuManagerService, { useValue: scopedMenuManagerService }]);
    }
    const scopedContextMenuService = createScopedContextMenuService(context.injector, scopedInjector);
    if (scopedContextMenuService) {
        scopedInjector.add([IContextMenuService, { useValue: scopedContextMenuService }]);
    }
    const scopedLayoutService = createScopedLayoutService(context.injector, context);
    if (scopedLayoutService) {
        scopedInjector.add([ILayoutService, { useValue: scopedLayoutService }]);
    }

    return scopedInjector;
}

function withScopedExecutionInjector(
    options: IExecutionOptions | undefined,
    injector: Injector
): IExecutionOptions {
    const scopedOptions: IExecutionOptions = { ...options };
    scopedOptions[COMMAND_EXECUTION_INJECTOR_KEY] = injector;
    return scopedOptions;
}

function createScopedUndoRedoService(parentInjector: Injector, childUnitId: string): IUndoRedoService | undefined {
    if (!parentInjector.has(IUndoRedoService)) {
        return undefined;
    }

    const undoRedoService = parentInjector.get(IUndoRedoService);
    const undoBridgeService = parentInjector.has(EmbedUndoBridgeService)
        ? parentInjector.get(EmbedUndoBridgeService)
        : undefined;
    const instanceService = parentInjector.has(IUniverInstanceService)
        ? parentInjector.get(IUniverInstanceService)
        : undefined;

    const resolveStackUnitId = (unitId: string): string => undoBridgeService?.resolveStackUnitId(unitId) ?? unitId;
    const withResolvedStackFocus = <T>(factory: () => T): T => {
        if (!instanceService) {
            return factory();
        }

        const stackUnitId = resolveStackUnitId(childUnitId);
        if (stackUnitId === childUnitId) {
            return factory();
        }

        const previousFocusedUnitId = instanceService.getFocusedUnit()?.getUnitId() ?? null;
        try {
            instanceService.focusUnit(stackUnitId);
            return factory();
        } finally {
            instanceService.focusUnit(previousFocusedUnitId);
        }
    };

    return new Proxy(undoRedoService, {
        get(target, property, receiver) {
            if (property === 'pushUndoRedo') {
                return (item: IUndoRedoItem) => {
                    if (item.unitID === childUnitId && undoBridgeService) {
                        undoBridgeService.pushUndoRedoForChild(item);
                        return;
                    }

                    target.pushUndoRedo(item);
                };
            }
            if (property === '__tempBatchingUndoRedo') {
                return (unitId: string) => target.__tempBatchingUndoRedo(resolveStackUnitId(unitId));
            }
            if (property === 'clearUndoRedo') {
                return (unitId: string) => target.clearUndoRedo(resolveStackUnitId(unitId));
            }
            if (property === 'rollback') {
                return (id: string, unitId?: string) => target.rollback(id, resolveStackUnitId(unitId ?? childUnitId));
            }
            if (property === 'pitchTopUndoElement') {
                return () => withResolvedStackFocus(() => target.pitchTopUndoElement());
            }
            if (property === 'pitchTopRedoElement') {
                return () => withResolvedStackFocus(() => target.pitchTopRedoElement());
            }
            if (property === 'popUndoToRedo') {
                return () => withResolvedStackFocus(() => target.popUndoToRedo());
            }
            if (property === 'popRedoToUndo') {
                return () => withResolvedStackFocus(() => target.popRedoToUndo());
            }

            return Reflect.get(target, property, receiver);
        },
    });
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
    let childInjector: Injector | undefined;
    let scopedInjector: Injector;
    const getLocal = (identifier: unknown) => {
        if (localOverrides.has(identifier)) {
            return localOverrides.get(identifier);
        }

        const factory = localFactories.get(identifier);
        if (!factory) {
            return undefined;
        }

        const value = factory();
        localFactories.delete(identifier);
        localOverrides.set(identifier, value);
        return value;
    };
    const hasLocal = (identifier: unknown) => localOverrides.has(identifier) || localFactories.has(identifier);

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
            [Injector, { useValue: scopedInjector }],
        ]);
        return childInjector;
    };

    scopedInjector = {
        has: (identifier: Parameters<Injector['get']>[0]) => {
            if (identifier === Injector) {
                return true;
            }
            if (hasLocal(identifier)) {
                return true;
            }

            const child = getChildInjector();
            return child?.has(identifier) ?? parentInjector.has(identifier);
        },
        get: (identifier: Parameters<Injector['get']>[0]) => {
            if (identifier === Injector) {
                return scopedInjector;
            }
            if (hasLocal(identifier)) {
                return getLocal(identifier);
            }

            const child = getChildInjector();
            return child?.get(identifier) ?? parentInjector.get(identifier);
        },
        invoke: <T, P extends unknown[] = []>(factory: (accessor: IAccessor, ...args: P) => T, ...args: P): T => factory({
            has: (identifier) => {
                if (identifier === Injector) {
                    return true;
                }
                if (hasLocal(identifier)) {
                    return true;
                }

                const child = getChildInjector();
                return child?.has(identifier) ?? parentInjector.has(identifier);
            },
            get: (identifier) => {
                if (identifier === Injector) {
                    return scopedInjector as never;
                }
                if (hasLocal(identifier)) {
                    return getLocal(identifier) as never;
                }

                const child = getChildInjector();
                return (child?.get(identifier) ?? parentInjector.get(identifier)) as never;
            },
        } as IAccessor, ...args),
        add: (dependency: unknown) => {
            const localDependency = parseLocalDependency(dependency);
            if (localDependency) {
                const dependencyIdentifier = getDependencyIdentifierKey(localDependency.identifier);
                if (localDependencyIdentifiers.has(dependencyIdentifier)) {
                    return;
                }

                localDependencyIdentifiers.add(dependencyIdentifier);
                if (localDependency.kind === 'value') {
                    localFactories.delete(localDependency.identifier);
                    localOverrides.set(localDependency.identifier, localDependency.value);
                } else {
                    localOverrides.delete(localDependency.identifier);
                    localFactories.set(localDependency.identifier, localDependency.factory);
                }
                childInjector?.add(dependency as never);
                return;
            }

            const dependencyIdentifier = getDependencyIdentifierKey(getDependencyIdentifier(dependency));
            if (dependencyIdentifier != null) {
                if (localDependencyIdentifiers.has(dependencyIdentifier)) {
                    return;
                }

                localDependencyIdentifiers.add(dependencyIdentifier);
            }

            const child = getChildInjector();
            if (child) {
                child.add(dependency as never);
                return;
            }

            parentInjector.add(dependency as never);
        },
        createChild: (dependencies: unknown[] = []) => {
            const childScopedInjector = createEmbedScopedInjector(parentInjector, localOverrides, resolvedSharedRootInjector);
            dependencies.forEach((dependency) => {
                childScopedInjector.add(dependency as never);
            });

            return childScopedInjector;
        },
        createInstance: (...args: unknown[]) => {
            const child = getChildInjector();
            const createInstance = (child as unknown as { createInstance?: (...args: unknown[]) => unknown } | undefined)?.createInstance;
            if (child && typeof createInstance === 'function') {
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
            localFactories.clear();
        },
    } as unknown as Injector;

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
