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

import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedChildContainerContext } from '../types/embed-ui';
import { COMMAND_EXECUTION_INJECTOR_KEY, ICommandService, Injector, IUndoRedoService, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { IContextMenuService, IMenuManagerService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { createEmbedChildUnitScopedInjector, createEmbedScopedInjector } from './embed-child-unit-scoped-injector';
import { EmbedUndoBridgeService } from './embed-undo-bridge.service';

interface IScopedInstanceService {
    getCurrentUnitOfType: (type: UniverInstanceType) => unknown;
    getCurrentTypeOfUnit$: (type: UniverInstanceType) => BehaviorSubject<unknown>;
    setCurrentUnitForType: (unitId: string) => void;
    getFocusedUnit: () => unknown;
    focusUnit: (unitId: string | null) => void;
}

interface IScopedCommandService {
    executeCommand: (id: string, params?: object) => Promise<boolean>;
    syncExecuteCommand: (id: string, params?: object) => boolean;
}

interface IScopedUndoRedoService {
    pushUndoRedo: (item: { unitID: string }) => void;
    __tempBatchingUndoRedo: (unitId: string) => string;
    clearUndoRedo: (unitId: string) => void;
    rollback: (id: string, unitId?: string) => string;
    pitchTopUndoElement: () => string;
    pitchTopRedoElement: () => string;
    popUndoToRedo: () => string;
    popRedoToUndo: () => string;
}

describe('embed child unit scoped injector', () => {
    it('scopes instance, command, undo redo, menu, and context menu services to the child unit', async () => {
        const childUnit = createUnit('child-sheet');
        const previousUnit = createUnit('previous-sheet');
        const focusedUnit = createUnit('focused-host');
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
            getCurrentUnitOfType: vi.fn(() => previousUnit),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(previousUnit)),
            setCurrentUnitForType: vi.fn(),
            getFocusedUnit: vi.fn(() => focusedUnit),
            focused$: new Subject<string | null>(),
            focusUnit: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(async () => true),
            syncExecuteCommand: vi.fn(() => true),
        };
        const undoRedoService = {
            pushUndoRedo: vi.fn(),
            __tempBatchingUndoRedo: vi.fn((unitId: string) => `batch:${unitId}`),
            clearUndoRedo: vi.fn(),
            rollback: vi.fn((id: string, unitId: string) => `rollback:${id}:${unitId}`),
            pitchTopUndoElement: vi.fn(() => 'undo'),
            pitchTopRedoElement: vi.fn(() => 'redo'),
            popUndoToRedo: vi.fn(() => 'undo-to-redo'),
            popRedoToUndo: vi.fn(() => 'redo-to-undo'),
        };
        const undoBridgeService = {
            resolveStackUnitId: vi.fn((unitId: string) => unitId === 'child-sheet' ? 'host-stack' : unitId),
            pushUndoRedoForChild: vi.fn(),
        };
        const scopedMenuManager = { scoped: true };
        const menuManagerService = {
            createScoped: vi.fn(() => scopedMenuManager),
        };
        const contextMenuService = {
            disabled: false,
            visible: false,
            enable: vi.fn(),
            disable: vi.fn(),
            triggerContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
            registerContextMenuHandler: vi.fn(),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [EmbedUndoBridgeService, undoBridgeService],
            [IMenuManagerService, menuManagerService],
            [IContextMenuService, contextMenuService],
        ]);

        const scopedInjector = createEmbedChildUnitScopedInjector(createChildContext(parentInjector as unknown as Injector));

        expect(scopedInjector).toBeDefined();
        expect(scopedInjector?.get(IMenuManagerService)).toBe(scopedMenuManager);
        expect(scopedInjector?.get(IContextMenuService)).not.toBe(contextMenuService);

        const scopedInstanceService = scopedInjector?.get(IUniverInstanceService) as unknown as IScopedInstanceService;
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(childUnit);
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)).toBe(previousUnit);
        const scopedUnits: unknown[] = [];
        scopedInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit: unknown) => scopedUnits.push(unit));
        scopedInstanceService.setCurrentUnitForType('child-sheet');
        scopedInstanceService.setCurrentUnitForType('other');
        expect(scopedUnits).toEqual([childUnit, childUnit]);
        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('other');
        expect(scopedInstanceService.getFocusedUnit()).toBe(childUnit);
        scopedInstanceService.focusUnit(null);
        expect(scopedInstanceService.getFocusedUnit()).toBeNull();
        scopedInstanceService.focusUnit('other');
        expect(instanceService.focusUnit).toHaveBeenCalledWith('other');

        const scopedCommandService = scopedInjector?.get(ICommandService) as unknown as IScopedCommandService;
        await expect(scopedCommandService.executeCommand('cmd.async', { value: 1 })).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith(
            'cmd.async',
            { value: 1 },
            expect.objectContaining({ [COMMAND_EXECUTION_INJECTOR_KEY]: scopedInjector })
        );
        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-sheet');
        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('previous-sheet');
        expect(scopedCommandService.syncExecuteCommand('cmd.sync')).toBe(true);

        const scopedUndoRedoService = scopedInjector?.get(IUndoRedoService) as unknown as IScopedUndoRedoService;
        scopedUndoRedoService.pushUndoRedo({ unitID: 'child-sheet' } as never);
        scopedUndoRedoService.pushUndoRedo({ unitID: 'other' } as never);
        expect(undoBridgeService.pushUndoRedoForChild).toHaveBeenCalledWith({ unitID: 'child-sheet' });
        expect(undoRedoService.pushUndoRedo).toHaveBeenCalledWith({ unitID: 'other' });
        expect(scopedUndoRedoService.__tempBatchingUndoRedo('child-sheet')).toBe('batch:host-stack');
        scopedUndoRedoService.clearUndoRedo('child-sheet');
        expect(undoRedoService.clearUndoRedo).toHaveBeenCalledWith('host-stack');
        expect(scopedUndoRedoService.rollback('r1')).toBe('rollback:r1:host-stack');
        expect(scopedUndoRedoService.pitchTopUndoElement()).toBe('undo');
        expect(scopedUndoRedoService.pitchTopRedoElement()).toBe('redo');
        expect(scopedUndoRedoService.popUndoToRedo()).toBe('undo-to-redo');
        expect(scopedUndoRedoService.popRedoToUndo()).toBe('redo-to-undo');
        expect(instanceService.focusUnit).toHaveBeenCalledWith('host-stack');
        expect(instanceService.focusUnit).toHaveBeenCalledWith('focused-host');

        const scopedContextMenuService = scopedInjector?.get(IContextMenuService) as typeof contextMenuService;
        scopedContextMenuService.disabled = true;
        expect(contextMenuService.disabled).toBe(true);
        scopedContextMenuService.enable();
        scopedContextMenuService.disable();
        scopedContextMenuService.hideContextMenu();
        scopedContextMenuService.registerContextMenuHandler(vi.fn());
        scopedContextMenuService.triggerContextMenu({} as never, 'menu', {});
        expect(contextMenuService.triggerContextMenu).toHaveBeenCalledWith({}, 'menu', {
            injector: scopedInjector,
        });
    });

    it('returns undefined when the child unit cannot be resolved', () => {
        const parentInjector = createParentInjector([
            [IUniverInstanceService, { getUnit: vi.fn(() => null) }],
            [ICommandService, {}],
        ]);

        expect(createEmbedChildUnitScopedInjector(createChildContext(parentInjector as unknown as Injector))).toBeUndefined();
    });

    it('supports standalone scoped injector overrides, child creation, and disposal pruning', () => {
        const overrideToken = Symbol('override');
        const parentToken = Symbol('parent');
        const childToken = Symbol('child');
        const sharedInstance = { shared: true };
        const ownedInstance = { owned: true };
        const childDispose = vi.fn();
        const childAdd = vi.fn();
        const childInjector = {
            children: [],
            resolvedDependencyCollection: {
                resolvedDependencies: new Map<unknown, unknown[]>([
                    [overrideToken, [sharedInstance, ownedInstance]],
                ]),
            },
            has: vi.fn((token: unknown) => token === childToken),
            get: vi.fn((token: unknown) => token === childToken ? 'child-value' : undefined),
            add: childAdd,
            createInstance: vi.fn((Ctor: new (value: string) => unknown, value: string) => new Ctor(`child:${value}`)),
            dispose: childDispose,
        };
        const parentInjector = {
            resolvedDependencyCollection: {
                resolvedDependencies: new Map<unknown, unknown[]>([
                    [overrideToken, [sharedInstance]],
                ]),
            },
            has: vi.fn((token: unknown) => token === parentToken),
            get: vi.fn((token: unknown) => token === parentToken ? 'parent-value' : undefined),
            add: vi.fn(),
            createChild: vi.fn(() => childInjector),
            createInstance: vi.fn((Ctor: new (value: string) => unknown, value: string) => new Ctor(`parent:${value}`)),
        };

        class Sample {
            constructor(readonly value: string) {}
        }

        const scopedInjector = createEmbedScopedInjector(
            parentInjector as unknown as Injector,
            new Map([[overrideToken, 'override-value']])
        );

        expect(scopedInjector.has(Injector)).toBe(true);
        expect(scopedInjector.get(Injector)).toBe(scopedInjector);
        expect(scopedInjector.get(overrideToken as never)).toBe('override-value');
        expect(scopedInjector.get(parentToken as never)).toBe('parent-value');
        expect(scopedInjector.get(childToken as never)).toBe('child-value');
        scopedInjector.add([Symbol('local'), { useValue: 'local-value' }] as never);
        scopedInjector.add(['non-value'] as never);
        expect(childAdd).toHaveBeenCalledWith(['non-value']);
        expect(scopedInjector.createInstance(Sample as never, 'x' as never)).toMatchObject({ value: 'child:x' });

        const nested = scopedInjector.createChild([[Symbol('nested'), { useValue: 'nested-value' }]] as never);
        expect(nested.get(overrideToken as never)).toBe('override-value');

        scopedInjector.dispose();
        expect(childDispose).toHaveBeenCalled();
        expect(childInjector.resolvedDependencyCollection.resolvedDependencies.get(overrideToken)).toEqual([ownedInstance]);
    });
});

function createParentInjector(entries: Array<[unknown, unknown]>) {
    const map = new Map(entries);
    return {
        has: vi.fn((token: unknown) => map.has(token)),
        get: vi.fn((token: unknown) => {
            if (!map.has(token)) {
                throw new Error(`unexpected token: ${String(token)}`);
            }

            return map.get(token);
        }),
        add: vi.fn((dependency: [unknown, { useValue: unknown }]) => {
            map.set(dependency[0], dependency[1].useValue);
        }),
    };
}

function createChildContext(injector: Injector): IEmbedChildContainerContext {
    const descriptor = createDescriptor();
    const root = document.createElement('div');
    return {
        descriptor,
        layout: 'doc-width-scale',
        injector,
        hostElement: root,
        container: root,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {} as never,
        runtimeScope: {} as never,
    };
}

function createUnit(unitId: string) {
    return {
        getUnitId: () => unitId,
    };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId ?? 'child-sheet',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
