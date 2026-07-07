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
import type { IEmbedChildContainerContext } from '../../types/embed-ui';
import {
    COMMAND_EXECUTION_INJECTOR_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_COMMON_DRAWINGS,
    FOCUSING_DOC,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_SHAPE_TEXT_EDITOR,
    FOCUSING_SHEET,
    FOCUSING_SLIDE,
    FOCUSING_UNIT,
    FORMULA_EDITOR_ACTIVATED,
    ICommandService,
    IConfigService,
    IContextService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    UniverInstanceType,
} from '@univerjs/core';
import { CreateEmbedCommand } from '@univerjs/embed';
import { ICanvasPopupService, IContextMenuService, ILayoutService, IMenuManagerService, IRibbonService, ISidebarService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { createEmbedChildUnitScopedInjector, createEmbedScopedConfigInjector, createEmbedScopedInjector } from '../embed-child-unit-scoped-injector';
import { EmbedInteractionBoundaryService } from '../embed-interaction-boundary.service';
import {
    EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE,
    EmbedRuntimeFocusCoordinator,
} from '../embed-runtime-focus-coordinator.service';
import { EmbedUndoBridgeService } from '../embed-undo-bridge.service';

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
        const scopedMenuManager = {
            scoped: true,
            menuChanged$: new Subject<void>(),
            getMenuByPositionKey: vi.fn(() => []),
        };
        const menuManagerService = {
            menuChanged$: new Subject<void>(),
            createScoped: vi.fn(() => scopedMenuManager),
            getMenuByPositionKey: vi.fn(() => []),
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
        const layoutService = {
            isFocused: false,
            rootContainerElement: document.createElement('div'),
            focus: vi.fn(),
            registerFocusHandler: vi.fn(),
            registerRootContainerElement: vi.fn(),
            registerContentElement: vi.fn(),
            registerContainerElement: vi.fn(),
            getContentElement: vi.fn(() => document.body),
            checkElementInCurrentContainers: vi.fn(() => false),
            checkContentIsFocused: vi.fn(() => false),
        };
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const runtimeFocusCoordinator = new EmbedRuntimeFocusCoordinator();
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
            [IUndoRedoService, undoRedoService],
            [EmbedUndoBridgeService, undoBridgeService],
            [EmbedInteractionBoundaryService, interactionBoundaryService],
            [EmbedRuntimeFocusCoordinator, runtimeFocusCoordinator],
            [IMenuManagerService, menuManagerService],
            [IContextMenuService, contextMenuService],
            [ILayoutService, layoutService],
        ]);

        const childContext = createTabChildContext(parentInjector as unknown as Injector);
        const scopedInjector = createEmbedChildUnitScopedInjector(childContext);

        expect(scopedInjector).toBeDefined();
        expect(scopedInjector?.get(EmbedInteractionBoundaryService)).toBe(interactionBoundaryService);
        expect(scopedInjector?.get(EmbedRuntimeFocusCoordinator)).toBe(runtimeFocusCoordinator);
        expect(scopedInjector?.get(IMenuManagerService)).toBe(scopedMenuManager);
        expect(scopedInjector?.get(IRibbonService)).toBeDefined();
        expect(scopedInjector?.get(IContextMenuService)).not.toBe(contextMenuService);
        const scopedLayoutService = scopedInjector?.get(ILayoutService);
        expect(scopedLayoutService?.rootContainerElement).toBe(childContext.renderScope.rootElement);
        expect(scopedLayoutService?.getContentElement()).toBe(childContext.renderScope.contentRoot);
        const childEditorContainer = document.createElement('div');
        const childEditorInput = document.createElement('div');
        childEditorInput.dataset.uComp = 'editor';
        childEditorContainer.appendChild(childEditorInput);
        scopedLayoutService?.rootContainerElement?.appendChild(childEditorContainer);
        const editorRegistration = scopedLayoutService?.registerContainerElement(childEditorContainer);
        expect(scopedLayoutService?.checkElementInCurrentContainers(childEditorContainer)).toBe(true);
        expect(interactionBoundaryService.contains('embed-1', childEditorContainer)).toBe(true);
        expect(runtimeFocusCoordinator.containsElement('embed-1', childEditorContainer)).toBe(true);
        expect(runtimeFocusCoordinator.containsElement('embed-1', childEditorInput)).toBe(true);
        expect(childEditorContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(childEditorInput.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(layoutService.registerContainerElement).not.toHaveBeenCalledWith(childEditorContainer);
        editorRegistration?.dispose();
        expect(interactionBoundaryService.contains('embed-1', childEditorContainer)).toBe(false);
        expect(runtimeFocusCoordinator.containsElement('embed-1', childEditorContainer)).toBe(false);
        expect(childEditorContainer.hasAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe(false);
        expect(childEditorInput.hasAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe(false);

        const scopedInstanceService = scopedInjector?.get(IUniverInstanceService) as unknown as IScopedInstanceService;
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(childUnit);
        expect(scopedInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC)).toBe(previousUnit);
        const scopedUnits: unknown[] = [];
        scopedInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET).subscribe((unit: unknown) => scopedUnits.push(unit));
        scopedInstanceService.setCurrentUnitForType('child-sheet');
        scopedInstanceService.setCurrentUnitForType('other');
        expect(scopedUnits).toEqual([childUnit]);
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
        await expect(scopedCommandService.executeCommand(CreateEmbedCommand.id, { embedId: 'nested' })).resolves.toBe(true);
        expect(commandService.executeCommand).toHaveBeenLastCalledWith(
            CreateEmbedCommand.id,
            { embedId: 'nested', parentEmbedId: 'embed-1' },
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

    it('focuses the parent instance on the child unit while tab-peer child scoped commands run', async () => {
        const childUnit = createUnit('child-sheet');
        const hostUnit = createUnit('host-doc');
        let currentSheetUnit = hostUnit;
        let focusedUnit: ReturnType<typeof createUnit> | null = hostUnit;
        const focusedDuringCommand: Array<string | null> = [];
        const currentDuringCommand: string[] = [];
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
            getCurrentUnitOfType: vi.fn((_type?: UniverInstanceType) => currentSheetUnit),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(currentSheetUnit)),
            setCurrentUnitForType: vi.fn((unitId: string) => {
                currentSheetUnit = unitId === childUnit.getUnitId() ? childUnit : hostUnit;
            }),
            getFocusedUnit: vi.fn(() => focusedUnit),
            focused$: new Subject<string | null>(),
            focusUnit: vi.fn((unitId: string | null) => {
                focusedUnit = unitId === childUnit.getUnitId()
                    ? childUnit
                    : unitId === hostUnit.getUnitId()
                        ? hostUnit
                        : null;
            }),
        };
        const commandService = {
            executeCommand: vi.fn(async (_id: string, _params?: object, options?: Record<PropertyKey, unknown>) => {
                const executionInjector = options?.[COMMAND_EXECUTION_INJECTOR_KEY] as Injector | undefined;
                const scopedInstanceService = executionInjector?.get(IUniverInstanceService) as IScopedInstanceService | undefined;
                focusedDuringCommand.push(instanceService.getFocusedUnit()?.getUnitId() ?? null);
                currentDuringCommand.push(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET).getUnitId());
                focusedDuringCommand.push((scopedInstanceService?.getFocusedUnit() as ReturnType<typeof createUnit> | null | undefined)?.getUnitId() ?? null);
                return true;
            }),
            syncExecuteCommand: vi.fn((_id: string, _params?: object, options?: Record<PropertyKey, unknown>) => {
                const executionInjector = options?.[COMMAND_EXECUTION_INJECTOR_KEY] as Injector | undefined;
                const scopedInstanceService = executionInjector?.get(IUniverInstanceService) as IScopedInstanceService | undefined;
                focusedDuringCommand.push(instanceService.getFocusedUnit()?.getUnitId() ?? null);
                currentDuringCommand.push(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET).getUnitId());
                focusedDuringCommand.push((scopedInstanceService?.getFocusedUnit() as ReturnType<typeof createUnit> | null | undefined)?.getUnitId() ?? null);
                return true;
            }),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
        ]);
        const scopedInjector = createEmbedChildUnitScopedInjector(createTabChildContext(parentInjector as unknown as Injector));
        const scopedCommandService = scopedInjector?.get(ICommandService) as unknown as IScopedCommandService;

        await scopedCommandService.executeCommand('cmd.async');
        scopedCommandService.syncExecuteCommand('cmd.sync');

        expect(currentDuringCommand).toEqual(['child-sheet', 'child-sheet']);
        expect(focusedDuringCommand).toEqual(['child-sheet', 'child-sheet', 'child-sheet', 'child-sheet']);
        expect(instanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).toHaveBeenLastCalledWith('host-doc');
        expect(instanceService.getFocusedUnit()).toBe(hostUnit);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(hostUnit);
    });

    it('focuses the parent instance on the child unit while doc-flow child scoped commands run', async () => {
        const childUnit = createUnit('child-sheet');
        const hostUnit = createUnit('host-doc');
        let currentSheetUnit = hostUnit;
        let focusedUnit: ReturnType<typeof createUnit> | null = hostUnit;
        const focusedDuringCommand: Array<string | null> = [];
        const currentDuringCommand: string[] = [];
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
            getCurrentUnitOfType: vi.fn((_type?: UniverInstanceType) => currentSheetUnit),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(currentSheetUnit)),
            setCurrentUnitForType: vi.fn((unitId: string) => {
                currentSheetUnit = unitId === childUnit.getUnitId() ? childUnit : hostUnit;
            }),
            getFocusedUnit: vi.fn(() => focusedUnit),
            focused$: new Subject<string | null>(),
            focusUnit: vi.fn((unitId: string | null) => {
                focusedUnit = unitId === childUnit.getUnitId()
                    ? childUnit
                    : unitId === hostUnit.getUnitId()
                        ? hostUnit
                        : null;
            }),
        };
        const commandService = {
            executeCommand: vi.fn(async (_id: string, _params?: object, options?: Record<PropertyKey, unknown>) => {
                const executionInjector = options?.[COMMAND_EXECUTION_INJECTOR_KEY] as Injector | undefined;
                const scopedInstanceService = executionInjector?.get(IUniverInstanceService) as IScopedInstanceService | undefined;
                focusedDuringCommand.push(instanceService.getFocusedUnit()?.getUnitId() ?? null);
                currentDuringCommand.push(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET).getUnitId());
                focusedDuringCommand.push((scopedInstanceService?.getFocusedUnit() as ReturnType<typeof createUnit> | null | undefined)?.getUnitId() ?? null);
                currentDuringCommand.push((scopedInstanceService?.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET) as ReturnType<typeof createUnit> | undefined)?.getUnitId() ?? '');
                return true;
            }),
            syncExecuteCommand: vi.fn(() => true),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
        ]);
        const scopedInjector = createEmbedChildUnitScopedInjector(createChildContext(parentInjector as unknown as Injector));
        const scopedCommandService = scopedInjector?.get(ICommandService) as unknown as IScopedCommandService;

        await scopedCommandService.executeCommand('cmd.async');

        expect(currentDuringCommand).toEqual(['child-sheet', 'child-sheet']);
        expect(focusedDuringCommand).toEqual(['child-sheet', 'child-sheet']);
        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).toHaveBeenLastCalledWith('host-doc');
        expect(instanceService.getFocusedUnit()).toBe(hostUnit);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(hostUnit);
    });

    it('keeps parent focus untouched while floating child scoped commands run', async () => {
        const childUnit = createUnit('child-sheet');
        const hostUnit = createUnit('host-sheet');
        let currentSheetUnit = hostUnit;
        let focusedUnit: ReturnType<typeof createUnit> | null = hostUnit;
        const focusedDuringCommand: Array<string | null> = [];
        const currentDuringCommand: string[] = [];
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
            getCurrentUnitOfType: vi.fn((_type?: UniverInstanceType) => currentSheetUnit),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(currentSheetUnit)),
            setCurrentUnitForType: vi.fn((unitId: string) => {
                currentSheetUnit = unitId === childUnit.getUnitId() ? childUnit : hostUnit;
            }),
            getFocusedUnit: vi.fn(() => focusedUnit),
            focused$: new Subject<string | null>(),
            focusUnit: vi.fn((unitId: string | null) => {
                focusedUnit = unitId === childUnit.getUnitId()
                    ? childUnit
                    : unitId === hostUnit.getUnitId()
                        ? hostUnit
                        : null;
            }),
        };
        const commandService = {
            executeCommand: vi.fn(async (_id: string, _params?: object, options?: Record<PropertyKey, unknown>) => {
                const executionInjector = options?.[COMMAND_EXECUTION_INJECTOR_KEY] as Injector | undefined;
                const scopedInstanceService = executionInjector?.get(IUniverInstanceService) as IScopedInstanceService | undefined;
                focusedDuringCommand.push(instanceService.getFocusedUnit()?.getUnitId() ?? null);
                currentDuringCommand.push(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET).getUnitId());
                focusedDuringCommand.push((scopedInstanceService?.getFocusedUnit() as ReturnType<typeof createUnit> | null | undefined)?.getUnitId() ?? null);
                currentDuringCommand.push((scopedInstanceService?.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET) as ReturnType<typeof createUnit> | undefined)?.getUnitId() ?? '');
                return true;
            }),
            syncExecuteCommand: vi.fn(() => true),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
        ]);
        const scopedInjector = createEmbedChildUnitScopedInjector(createFloatingChildContext(parentInjector as unknown as Injector));
        const scopedCommandService = scopedInjector?.get(ICommandService) as unknown as IScopedCommandService;

        await scopedCommandService.executeCommand('cmd.async');

        expect(currentDuringCommand).toEqual(['host-sheet', 'child-sheet']);
        expect(focusedDuringCommand).toEqual(['host-sheet', 'child-sheet']);
        expect(instanceService.setCurrentUnitForType).not.toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).not.toHaveBeenCalledWith('child-sheet');
        expect(instanceService.getFocusedUnit()).toBe(hostUnit);
        expect(instanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)).toBe(hostUnit);
    });

    it('keeps child runtime focus context local while passing non-focus context through', () => {
        const childUnit = createUnit('child-sheet');
        const parentContextChanges: Record<string, boolean>[] = [];
        const scopedContextChanges: Record<string, boolean>[] = [];
        const contextService = {
            contextChanged$: new Subject<Record<string, boolean>>(),
            getContextValue: vi.fn((key: string) => key === 'HOST_CONTEXT'),
            setContextValue: vi.fn((key: string, value: boolean) => {
                parentContextChanges.push({ [key]: value });
            }),
            subscribeContextValue$: vi.fn((key: string) => new BehaviorSubject(key === 'HOST_CONTEXT')),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, {
                getUnit: vi.fn(() => childUnit),
                getCurrentUnitOfType: vi.fn(() => childUnit),
                getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(childUnit)),
                setCurrentUnitForType: vi.fn(),
                getFocusedUnit: vi.fn(() => childUnit),
                focused$: new Subject<string | null>(),
                focusUnit: vi.fn(),
            }],
            [ICommandService, {
                executeCommand: vi.fn(async () => true),
                syncExecuteCommand: vi.fn(() => true),
            }],
            [IContextService, contextService],
        ]);
        const scopedInjector = createEmbedChildUnitScopedInjector(createFloatingChildContext(parentInjector as unknown as Injector));
        const scopedContextService = scopedInjector?.get(IContextService) as IContextService;

        scopedContextService.contextChanged$.subscribe((change) => scopedContextChanges.push(change));
        expect(scopedContextService.getContextValue(FOCUSING_UNIT)).toBe(true);
        expect(scopedContextService.getContextValue(FOCUSING_SHEET)).toBe(true);
        expect(scopedContextService.getContextValue(FOCUSING_DOC)).toBe(false);
        expect(scopedContextService.getContextValue(FOCUSING_SLIDE)).toBe(false);
        expect(scopedContextService.getContextValue(FOCUSING_FX_BAR_EDITOR)).toBe(false);
        expect(scopedContextService.getContextValue('HOST_CONTEXT')).toBe(true);

        const fxValues: boolean[] = [];
        scopedContextService.subscribeContextValue$(FOCUSING_FX_BAR_EDITOR).subscribe((value) => fxValues.push(value)).unsubscribe();
        scopedContextService.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
        scopedContextService.setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        scopedContextService.setContextValue(FOCUSING_SHAPE_TEXT_EDITOR, true);
        scopedContextService.setContextValue(EDITOR_ACTIVATED, true);
        scopedContextService.setContextValue(FORMULA_EDITOR_ACTIVATED, true);
        scopedContextService.setContextValue('HOST_CONTEXT', false);

        expect(scopedContextService.getContextValue(FOCUSING_FX_BAR_EDITOR)).toBe(true);
        expect(parentContextChanges).toEqual([{ HOST_CONTEXT: false }]);
        expect(contextService.setContextValue).toHaveBeenCalledTimes(1);
        expect(fxValues).toEqual([false]);
        expect(scopedContextChanges).toEqual([
            { [FOCUSING_FX_BAR_EDITOR]: true },
            { [FOCUSING_COMMON_DRAWINGS]: true },
            { [FOCUSING_SHAPE_TEXT_EDITOR]: true },
            { [EDITOR_ACTIVATED]: true },
            { [FORMULA_EDITOR_ACTIVATED]: true },
        ]);
    });

    it('keeps parent focus on the child after a scoped command when the child owns an active interaction lease', async () => {
        const childUnit = createUnit('child-sheet');
        const hostUnit = createUnit('host-doc');
        let currentSheetUnit = hostUnit;
        let focusedUnit: ReturnType<typeof createUnit> | null = hostUnit;
        const instanceService = {
            getUnit: vi.fn(() => childUnit),
            getCurrentUnitOfType: vi.fn(() => currentSheetUnit),
            getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(currentSheetUnit)),
            setCurrentUnitForType: vi.fn((unitId: string) => {
                currentSheetUnit = unitId === childUnit.getUnitId() ? childUnit : hostUnit;
            }),
            getFocusedUnit: vi.fn(() => focusedUnit),
            focused$: new Subject<string | null>(),
            focusUnit: vi.fn((unitId: string | null) => {
                focusedUnit = unitId === childUnit.getUnitId()
                    ? childUnit
                    : unitId === hostUnit.getUnitId()
                        ? hostUnit
                        : null;
            }),
        };
        const commandService = {
            executeCommand: vi.fn(async () => true),
            syncExecuteCommand: vi.fn(() => true),
        };
        const runtimeFocusCoordinator = new EmbedRuntimeFocusCoordinator();
        const parentInjector = createParentInjector([
            [IUniverInstanceService, instanceService],
            [ICommandService, commandService],
            [EmbedRuntimeFocusCoordinator, runtimeFocusCoordinator],
        ]);
        const scopedInjector = createEmbedChildUnitScopedInjector(createTabChildContext(parentInjector as unknown as Injector));
        const scopedCommandService = scopedInjector?.get(ICommandService) as unknown as IScopedCommandService;

        const lease = runtimeFocusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-editor',
            owner: 'sheet-cell-editor',
        });
        await scopedCommandService.executeCommand('cmd.async');

        expect(instanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).not.toHaveBeenLastCalledWith('host-doc');
        expect(instanceService.getFocusedUnit()).toBe(childUnit);

        lease.dispose();
    });

    it('falls back to the render scope root while the runtime scope is being created', () => {
        const childUnit = createUnit('child-sheet');
        const parentInjector = createParentInjector([
            [IUniverInstanceService, {
                getUnit: vi.fn(() => childUnit),
                getCurrentUnitOfType: vi.fn(() => childUnit),
                getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(childUnit)),
                setCurrentUnitForType: vi.fn(),
                getFocusedUnit: vi.fn(() => childUnit),
                focusUnit: vi.fn(),
            }],
            [ICommandService, {
                executeCommand: vi.fn(async () => true),
                syncExecuteCommand: vi.fn(() => true),
            }],
            [ILayoutService, {
                isFocused: false,
                rootContainerElement: document.body,
                focus: vi.fn(),
                registerFocusHandler: vi.fn(),
                registerRootContainerElement: vi.fn(),
                registerContentElement: vi.fn(),
                registerContainerElement: vi.fn(),
                getContentElement: vi.fn(() => document.body),
                checkElementInCurrentContainers: vi.fn(() => false),
                checkContentIsFocused: vi.fn(() => false),
            }],
        ]);
        const childContext = createChildContext(parentInjector as unknown as Injector) as unknown as {
            runtimeScope?: unknown;
        };
        delete childContext.runtimeScope;

        const scopedInjector = createEmbedChildUnitScopedInjector(childContext as never);
        const scopedLayoutService = scopedInjector?.get(ILayoutService);

        expect(scopedLayoutService?.rootContainerElement).toBe((childContext as IEmbedChildContainerContext).renderScope.rootElement);
        expect(scopedLayoutService?.getContentElement()).toBe((childContext as IEmbedChildContainerContext).renderScope.contentRoot);
    });

    it('keeps fullscreen context menu, canvas popup, and sidebar services local to the child runtime', () => {
        const childUnit = createUnit('child-sheet');
        const parentContextMenuService = {
            disabled: false,
            visible: false,
            enable: vi.fn(),
            disable: vi.fn(),
            triggerContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
            registerContextMenuHandler: vi.fn(),
        };
        const parentPopupService = {
            addPopup: vi.fn(),
            removePopup: vi.fn(),
            removeAll: vi.fn(),
            popups$: new BehaviorSubject([]),
            popups: [],
            activePopupId: null,
        };
        const parentSidebarService = {
            visible: false,
            options: {},
            sidebarOptions$: new Subject(),
            scrollEvent$: new Subject(),
            open: vi.fn(),
            close: vi.fn(),
            setWidth: vi.fn(),
            getContainer: vi.fn(),
            setContainer: vi.fn(),
        };
        const parentInjector = createParentInjector([
            [IUniverInstanceService, {
                getUnit: vi.fn(() => childUnit),
                getCurrentUnitOfType: vi.fn(() => childUnit),
                getCurrentTypeOfUnit$: vi.fn(() => new BehaviorSubject(childUnit)),
                setCurrentUnitForType: vi.fn(),
                getFocusedUnit: vi.fn(() => childUnit),
                focused$: new Subject<string | null>(),
                focusUnit: vi.fn(),
            }],
            [ICommandService, {
                executeCommand: vi.fn(async () => true),
                syncExecuteCommand: vi.fn(() => true),
            }],
            [IContextMenuService, parentContextMenuService],
            [ICanvasPopupService, parentPopupService],
            [ISidebarService, parentSidebarService],
        ]);
        const childContext = createChildContext(parentInjector as unknown as Injector);
        childContext.renderScope.fullscreen = true;
        const scopedInjector = createEmbedChildUnitScopedInjector(childContext);

        const scopedContextMenuService = scopedInjector?.get(IContextMenuService) as typeof parentContextMenuService;
        const contextHandler = {
            handleContextMenu: vi.fn(),
            hideContextMenu: vi.fn(),
            get visible() {
                return false;
            },
        };
        scopedContextMenuService.registerContextMenuHandler(contextHandler);
        scopedContextMenuService.triggerContextMenu({ stopPropagation: vi.fn() } as never, 'menu', {
            injector: parentInjector as unknown as Injector,
        });
        expect(contextHandler.handleContextMenu).toHaveBeenCalledWith(expect.any(Object), 'menu', {
            injector: scopedInjector,
        });
        expect(parentContextMenuService.triggerContextMenu).not.toHaveBeenCalled();
        expect(parentContextMenuService.registerContextMenuHandler).not.toHaveBeenCalled();

        const scopedPopupService = scopedInjector?.get(ICanvasPopupService) as typeof parentPopupService;
        const popupId = scopedPopupService.addPopup({
            anchorRect$: new BehaviorSubject({ left: 0, right: 1, top: 0, bottom: 1 }),
            canvasElement: document.createElement('canvas'),
            componentKey: 'embed-test-popup',
            unitId: 'child-sheet',
            subUnitId: 'sheet-1',
        } as never);
        expect(scopedPopupService.popups).toHaveLength(1);
        scopedPopupService.removePopup(popupId);
        expect(scopedPopupService.popups).toHaveLength(0);
        expect(parentPopupService.addPopup).not.toHaveBeenCalled();

        const scopedSidebarService = scopedInjector?.get(ISidebarService) as unknown as {
            visible: boolean;
            options: { id?: string };
            open: (params: { id: string }) => { dispose: () => void };
        };
        const sidebarDisposable = scopedSidebarService.open({ id: 'fullscreen-sidebar' });
        expect(scopedSidebarService.visible).toBe(true);
        expect(scopedSidebarService.options.id).toBe('fullscreen-sidebar');
        sidebarDisposable.dispose();
        expect(scopedSidebarService.visible).toBe(false);
        expect(parentSidebarService.open).not.toHaveBeenCalled();
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

    it('reuses parent services instead of registering duplicate scoped dependencies', () => {
        const sharedToken = Symbol('shared');
        const localToken = Symbol('local');
        const childInjector = {
            has: vi.fn((token: unknown) => token === sharedToken || token === localToken),
            get: vi.fn((token: unknown) => {
                if (token === sharedToken) return 'child-shared';
                if (token === localToken) return 'child-local';
                return undefined;
            }),
            add: vi.fn(),
            createInstance: vi.fn(),
            dispose: vi.fn(),
        };
        const parentInjector = {
            has: vi.fn((token: unknown) => token === sharedToken),
            get: vi.fn((token: unknown) => token === sharedToken ? 'parent-shared' : undefined),
            add: vi.fn(),
            createChild: vi.fn(() => childInjector),
            createInstance: vi.fn(),
        };
        const scopedInjector = createEmbedScopedInjector(parentInjector as unknown as Injector, new Map());

        expect(scopedInjector.get(sharedToken as never)).toBe('parent-shared');
        expect(scopedInjector.get(localToken as never)).toBe('child-local');

        scopedInjector.add([sharedToken, { useValue: 'local-shared' }] as never);
        expect(scopedInjector.get(sharedToken as never)).toBe('parent-shared');
        expect(childInjector.add).not.toHaveBeenCalledWith([sharedToken, { useValue: 'local-shared' }]);
    });

    it('supports explicit scoped config overrides without allowing generic service replacement', () => {
        const configService = {
            getConfig: vi.fn((id: string | symbol) => id === 'docs-ui.config'
                ? { fitToWidth: { mode: 'none', paddingX: 20 } }
                : { id }),
            setConfig: vi.fn(),
            deleteConfig: vi.fn(),
            subscribeConfigValue$: vi.fn(),
        };
        const parentInjector = createParentInjector([
            [IConfigService, configService],
        ]);
        const scopedInjector = createEmbedScopedConfigInjector(parentInjector as unknown as Injector, new Map([
            ['docs-ui.config', (config) => ({
                ...(config as object),
                fitToWidth: { mode: 'fit-width', paddingX: 0 },
            })],
        ]));

        expect(scopedInjector).toBeDefined();
        expect(scopedInjector?.get(IConfigService).getConfig('docs-ui.config')).toEqual({
            fitToWidth: { mode: 'fit-width', paddingX: 0 },
        });
        expect(scopedInjector?.get(IConfigService).getConfig('other')).toEqual({ id: 'other' });
        expect((parentInjector.get(IConfigService) as IConfigService).getConfig('docs-ui.config')).toEqual({
            fitToWidth: { mode: 'none', paddingX: 20 },
        });

        scopedInjector?.add([IConfigService, { useValue: { getConfig: () => ({ broken: true }) } }] as never);
        expect(scopedInjector?.get(IConfigService).getConfig('docs-ui.config')).toEqual({
            fitToWidth: { mode: 'fit-width', paddingX: 0 },
        });
    });

    it('deduplicates identifier decorators by stable name when adding local dependencies', () => {
        const childAdd = vi.fn();
        const factory = vi.fn(() => 'local-render-module');
        const childInjector = {
            has: vi.fn(() => false),
            get: vi.fn(() => undefined),
            add: childAdd,
            createInstance: vi.fn(),
            dispose: vi.fn(),
        };
        const parentInjector = {
            has: vi.fn(() => false),
            get: vi.fn(() => undefined),
            add: vi.fn(),
            createChild: vi.fn(() => childInjector),
            createInstance: vi.fn(),
        };
        const scopedInjector = createEmbedScopedInjector(parentInjector as unknown as Injector, new Map());
        const tokenA = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        const tokenB = Object.assign(() => undefined, { decoratorName: 'univer.sheet.selection-render-service' });
        const firstDep = [tokenA, { useFactory: factory }];
        const duplicateDep = [tokenB, { useClass: class SecondRenderModule {} }];

        scopedInjector.add(firstDep as never);
        scopedInjector.add(duplicateDep as never);

        expect(childAdd).not.toHaveBeenCalled();
        expect(scopedInjector.get(tokenA as never)).toBe('local-render-module');
        expect(scopedInjector.get(tokenA as never)).toBe('local-render-module');
        expect(factory).toHaveBeenCalledTimes(1);
        expect(childInjector.get).not.toHaveBeenCalledWith(tokenA);
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
    const contentRoot = document.createElement('div');
    root.appendChild(contentRoot);
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
        renderScope: {
            rootElement: root,
            contentRoot,
        } as never,
        runtimeScope: {} as never,
    };
}

function createFloatingChildContext(injector: Injector): IEmbedChildContainerContext {
    const descriptor = createDescriptor({
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        hostUnitId: 'host-sheet',
        hostAnchorId: 'drawing-1',
        sourceMeta: {
            floating: {
                enabled: true,
                layout: 'scroll-contained',
                fullscreen: true,
            },
            tab: false,
        },
    });
    const root = document.createElement('div');
    const contentRoot = document.createElement('div');
    root.appendChild(contentRoot);
    return {
        descriptor,
        layout: 'scroll-contained',
        injector,
        hostElement: root,
        container: root,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {
            rootElement: root,
            contentRoot,
        } as never,
        runtimeScope: {} as never,
    };
}

function createTabChildContext(injector: Injector): IEmbedChildContainerContext {
    const descriptor = createDescriptor({
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        hostUnitId: 'host-sheet',
        hostAnchorId: 'sheet-tab-1',
        sourceMeta: {
            floating: false,
            tab: {
                enabled: true,
            },
        },
    });
    const root = document.createElement('div');
    const contentRoot = document.createElement('div');
    root.appendChild(contentRoot);
    return {
        descriptor,
        layout: 'tab-peer',
        injector,
        hostElement: root,
        container: root,
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {
            rootElement: root,
            contentRoot,
        } as never,
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
            unitType: UniverInstanceType.UNIVER_SHEET,
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
