import type { IAccessor, IExecutionOptions, IUndoRedoItem, IUndoRedoService as IUndoRedoServiceType, UniverInstanceType } from '@univerjs/core';
import type { IContextMenuService, IMenuManagerService } from '@univerjs/ui';
import type { EmbedChildContainerContext } from '../types/embed-ui';
import { COMMAND_EXECUTION_INJECTOR_KEY, ICommandService, Injector, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IContextMenuService as IContextMenuServiceIdentifier, IMenuManagerService as IMenuManagerServiceIdentifier, MenuManagerService } from '@univerjs/ui';
import { of } from 'rxjs';
import { EmbedUndoBridgeService } from './embed-undo-bridge.service';

export function createEmbedChildUnitScopedInjector(
    context: EmbedChildContainerContext
): Injector | undefined {
    const instanceService = context.injector.get(IUniverInstanceService);
    const childUnit = instanceService.getUnit(context.childUnitId, context.childType);
    if (!childUnit) {
        return undefined;
    }

    const scopedInstanceService = new Proxy(instanceService, {
        get(target, property, receiver) {
            if (property === 'dispose') {
                return () => {};
            }
            if (property === 'getCurrentUnitOfType') {
                return (type: UniverInstanceType) => type === context.childType
                    ? childUnit
                    : target.getCurrentUnitOfType(type);
            }
            if (property === 'getCurrentTypeOfUnit$') {
                return (type: UniverInstanceType) => type === context.childType
                    ? of(childUnit)
                    : target.getCurrentTypeOfUnit$(type);
            }
            if (property === 'getFocusedUnit') {
                return () => childUnit ?? target.getFocusedUnit();
            }
            if (property === 'focused$') {
                return of(childUnit.getUnitId());
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
                    try {
                        instanceService.setCurrentUnitForType(context.childUnitId);
                        return await target.executeCommand(args[0], args[1], withScopedExecutionInjector(args[2], scopedInjector));
                    } finally {
                        if (previous) {
                            instanceService.setCurrentUnitForType(previous.getUnitId());
                        }
                    }
                };
            }
            if (property === 'syncExecuteCommand') {
                return (...args: Parameters<ICommandService['syncExecuteCommand']>) => {
                    const previous = instanceService.getCurrentUnitOfType(context.childType);
                    try {
                        instanceService.setCurrentUnitForType(context.childUnitId);
                        return target.syncExecuteCommand(args[0], args[1], withScopedExecutionInjector(args[2], scopedInjector));
                    } finally {
                        if (previous) {
                            instanceService.setCurrentUnitForType(previous.getUnitId());
                        }
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
        scopedInjector.add([IMenuManagerServiceIdentifier, { useValue: scopedMenuManagerService }]);
    }
    const scopedContextMenuService = createScopedContextMenuService(context.injector, scopedInjector);
    if (scopedContextMenuService) {
        scopedInjector.add([IContextMenuServiceIdentifier, { useValue: scopedContextMenuService }]);
    }

    return scopedInjector;
}

function withScopedExecutionInjector(
    options: IExecutionOptions | undefined,
    injector: Injector
): IExecutionOptions {
    const scopedOptions: IExecutionOptions = { ...(options ?? {}) };
    scopedOptions[COMMAND_EXECUTION_INJECTOR_KEY] = injector;
    return scopedOptions;
}

function createScopedUndoRedoService(parentInjector: Injector, childUnitId: string): IUndoRedoServiceType | undefined {
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
    overrides: ReadonlyMap<unknown, unknown>
): Injector {
    const localOverrides = new Map(overrides);
    let childInjector: Injector | undefined;

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

    const scopedInjector = {
        has: (identifier: Parameters<Injector['get']>[0]) => {
            if (identifier === Injector) {
                return true;
            }
            if (localOverrides.has(identifier)) {
                return true;
            }

            const child = getChildInjector();
            return child?.has(identifier) ?? parentInjector.has(identifier);
        },
        get: (identifier: Parameters<Injector['get']>[0]) => {
            if (identifier === Injector) {
                return scopedInjector;
            }
            if (localOverrides.has(identifier)) {
                return localOverrides.get(identifier);
            }

            const child = getChildInjector();
            return child?.get(identifier) ?? parentInjector.get(identifier);
        },
        invoke: <T, P extends unknown[] = []>(factory: (accessor: IAccessor, ...args: P) => T, ...args: P): T => factory({
            has: (identifier) => {
                if (identifier === Injector) {
                    return true;
                }
                if (localOverrides.has(identifier)) {
                    return true;
                }

                const child = getChildInjector();
                return child?.has(identifier) ?? parentInjector.has(identifier);
            },
            get: (identifier) => {
                if (identifier === Injector) {
                    return scopedInjector as never;
                }
                if (localOverrides.has(identifier)) {
                    return localOverrides.get(identifier) as never;
                }

                const child = getChildInjector();
                return (child?.get(identifier) ?? parentInjector.get(identifier)) as never;
            },
        } as IAccessor, ...args),
        add: (dependency: unknown) => {
            const valueDependency = parseValueDependency(dependency);
            if (valueDependency) {
                localOverrides.set(valueDependency.identifier, valueDependency.value);
                childInjector?.add(dependency as never);
                return;
            }

            const child = getChildInjector();
            if (child) {
                child.add(dependency as never);
                return;
            }

            parentInjector.add(dependency as never);
        },
        createChild: (dependencies: unknown[] = []) => {
            const childScopedInjector = createEmbedScopedInjector(parentInjector, localOverrides);
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
            childInjector?.dispose();
            childInjector = undefined;
        },
    };

    return scopedInjector as Injector;
}

function createValueDependencies(overrides: ReadonlyMap<unknown, unknown>): unknown[] {
    return Array.from(overrides, ([identifier, value]) => [identifier, { useValue: value }]);
}

function parseValueDependency(dependency: unknown): { identifier: unknown; value: unknown } | undefined {
    if (!Array.isArray(dependency) || dependency.length < 2) {
        return undefined;
    }

    const [identifier, dependencyItem] = dependency as [unknown, { useValue?: unknown }];
    if (!dependencyItem || typeof dependencyItem !== 'object' || !('useValue' in dependencyItem)) {
        return undefined;
    }

    return {
        identifier,
        value: dependencyItem.useValue,
    };
}

function createScopedMenuManagerService(parentInjector: Injector, scopedInjector: Injector): IMenuManagerService | undefined {
    if (!parentInjector.has(IMenuManagerServiceIdentifier)) {
        return undefined;
    }

    const menuManagerService = parentInjector.get(IMenuManagerServiceIdentifier);
    const createScoped = (menuManagerService as MenuManagerService).createScoped;

    return typeof createScoped === 'function'
        ? createScoped.call(menuManagerService, scopedInjector)
        : menuManagerService;
}

function createScopedContextMenuService(parentInjector: Injector, scopedInjector: Injector): IContextMenuService | undefined {
    if (!parentInjector.has(IContextMenuServiceIdentifier)) {
        return undefined;
    }

    const contextMenuService = parentInjector.get(IContextMenuServiceIdentifier);
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
        triggerContextMenu: (event, menuType, context) => contextMenuService.triggerContextMenu(event, menuType, {
            ...context,
            injector: context?.injector ?? scopedInjector,
        }),
        hideContextMenu: () => contextMenuService.hideContextMenu(),
        registerContextMenuHandler: (handler) => contextMenuService.registerContextMenuHandler(handler),
    };
}
