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

import type { Nullable } from '@univerjs/core';
import type { ComponentType } from 'react';
import type { Root } from 'react-dom/client';
import type { ICellEditorState, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';
import type { ICellEditorBoundingClientRect, ICellEditorManagerParam } from '../../services/editor/cell-editor-manager.service';
import {
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    ICommandService,
    IContextService,
    Injector,
    IUniverInstanceService,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { ComponentManager, connectInjector, ILayoutService, ISidebarService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { BehaviorSubject, of } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY } from '../../common/keys';
import { IEditorBridgeService } from '../../services/editor-bridge.service';
import { ICellEditorManagerService } from '../../services/editor/cell-editor-manager.service';
import { SheetCellEditorResizeService } from '../../services/editor/cell-editor-resize.service';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator, ISheetEmbedInteractionBoundaryService, ISheetEmbedRuntimeFocusCoordinator } from '../../services/sheet-embed-integration.service';
import { EditorContainer, shouldRefocusCellEditorAfterPointerDown } from './EditorContainer';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let latestFormulaEditorProps: {
    disableSelectionOnClick?: boolean;
    onFormulaSelectingChange?: (isSelecting: number, isFocusing: boolean) => void;
} | undefined;

class TestCellEditorManagerService {
    private readonly _state$ = new BehaviorSubject<Nullable<ICellEditorManagerParam>>({
        show: true,
        startX: 0,
        startY: 0,
        endX: 120,
        endY: 32,
    });

    readonly state$ = this._state$.asObservable();
    readonly rect$ = new BehaviorSubject<Nullable<ICellEditorBoundingClientRect>>(null).asObservable();
    readonly focus$ = new BehaviorSubject(false).asObservable();
    setRect = vi.fn();
    getRect = vi.fn(() => null);
    setFocus = vi.fn();
    getState = vi.fn(() => this._state$.getValue());
    setState(param: ICellEditorManagerParam): void {
        this._state$.next(param);
    }

    dispose(): void {
        this._state$.complete();
    }
}

class TestEditorBridgeService {
    private readonly _visible$ = new BehaviorSubject<IEditorBridgeServiceVisibleParam>({
        visible: true,
        eventType: DeviceInputEventType.Dblclick,
        unitId: 'sheet-1',
    });

    readonly visible$ = this._visible$.asObservable();
    readonly currentEditCellState$ = new BehaviorSubject<Nullable<ICellEditorState>>({
        unitId: 'sheet-1',
        sheetId: 'sheet-1',
        row: 0,
        column: 0,
        editorUnitId: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
        documentLayoutObject: {} as never,
    }).asObservable();

    readonly currentEditCellLayout$ = new BehaviorSubject(null).asObservable();
    readonly currentEditCell$ = new BehaviorSubject(null).asObservable();
    readonly forceKeepVisible$ = new BehaviorSubject(false).asObservable();
    readonly helpFunctionVisible$ = new BehaviorSubject(true);

    changeVisible(param: IEditorBridgeServiceVisibleParam): void {
        this._visible$.next(param);
    }

    isVisible(): IEditorBridgeServiceVisibleParam {
        return this._visible$.getValue();
    }

    refreshEditCellState(): void {}
    refreshEditCellPosition(): void {}
    setEditCell(): void {}
    getEditCellState(): null { return null; }
    getEditCellLayout(): null { return null; }
    getEditLocation(): null { return null; }
    updateEditLocation(): void {}
    getLatestEditCellState(): null { return null; }
    changeEditorDirty(): void {}
    getEditorDirty(): boolean { return false; }
    enableForceKeepVisible = vi.fn();
    disableForceKeepVisible = vi.fn();
    isForceKeepVisible(): boolean { return false; }
    getCurrentEditorId(): string { return DOCS_NORMAL_EDITOR_UNIT_ID_KEY; }
    dispose(): void {}
}

function createTestBed(options: { docSelectionIsFocusing?: boolean; focusedUnitId?: string | null; sheetUnitIds?: string[] } = {}) {
    const injector = new Injector();
    const componentManager = new ComponentManager();
    const focusCoordinator = new EmbedRuntimeFocusCoordinator();
    const interactionBoundaryService = new EmbedInteractionBoundaryService();
    const editorBridgeService = new TestEditorBridgeService();
    const cellEditorResizeService = {
        resizeCellEditor: vi.fn(),
        fitTextSize: vi.fn(),
    };
    const docSelectionRenderService = {
        isFocusing: options.docSelectionIsFocusing ?? true,
        focus: vi.fn(),
    };

    latestFormulaEditorProps = undefined;
    componentManager.register(EMBEDDING_FORMULA_EDITOR_COMPONENT_KEY, (props: {
        disableSelectionOnClick?: boolean;
        onFormulaSelectingChange?: (isSelecting: number, isFocusing: boolean) => void;
    }) => {
        latestFormulaEditorProps = props;
        return <div data-testid="formula-editor" />;
    });
    injector.add([Injector, injector]);
    injector.add([ComponentManager, componentManager]);
    injector.add([IEditorBridgeService, { useValue: editorBridgeService as never }]);
    injector.add([ICellEditorManagerService, { useClass: TestCellEditorManagerService as never }]);
    injector.add([IEditorService, {
        useValue: {
            getEditor: () => ({
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 120, height: 32 }),
                render: { with: () => docSelectionRenderService },
            }),
        } as never,
    }]);
    injector.add([ICommandService, { useValue: { executeCommand: vi.fn(), syncExecuteCommand: vi.fn() } as never }]);
    injector.add([IUniverInstanceService, {
        useValue: {
            getFocusedUnit: () => options.focusedUnitId == null
                ? null
                : { getUnitId: () => options.focusedUnitId },
            getUnit: (unitId: string, type?: UniverInstanceType) => (
                (type == null || type === UniverInstanceType.UNIVER_SHEET) &&
                    (options.sheetUnitIds ?? ['child-sheet', 'scoped-child-sheet', 'sheet-1']).includes(unitId)
                    ? { getUnitId: () => unitId }
                    : null
            ),
        } as never,
    }]);
    injector.add([IContextService, {
        useValue: {
            subscribeContextValue$: () => of(false),
            setContextValue: vi.fn(),
            getContextValue: vi.fn(),
        } as never,
    }]);
    injector.add([ThemeService, {
        useValue: {
            darkMode: false,
            darkMode$: of(false),
            getColorFromTheme: () => '#fff',
        } as never,
    }]);
    injector.add([SheetCellEditorResizeService, { useValue: cellEditorResizeService as never }]);
    injector.add([ILayoutService, { useValue: { focus: vi.fn() } as never }]);
    injector.add([ISidebarService, { useValue: { getContainer: () => null } as never }]);
    injector.add([ISheetEmbedRuntimeFocusCoordinator, { useValue: focusCoordinator }]);
    injector.add([ISheetEmbedInteractionBoundaryService, { useValue: interactionBoundaryService }]);

    return { injector, editorBridgeService, focusCoordinator, interactionBoundaryService, docSelectionRenderService, cellEditorResizeService };
}

function renderEditorContainer(root: Root, injector: Injector): void {
    const ConnectedTestRoot = connectInjector(EditorContainer, injector) as ComponentType;
    root.render(<ConnectedTestRoot />);
}

describe('EditorContainer embed focus lease', () => {
    let root: Root | undefined;
    let container: HTMLElement | undefined;

    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        document.getElementById(`univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`)?.remove();
        document.getElementById(`__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`)?.remove();
        vi.useRealTimers();
        root = undefined;
        container = undefined;
    });

    it('holds a child-editor lease while the embedded sheet cell editor is visible', async () => {
        const { injector, editorBridgeService, focusCoordinator, interactionBoundaryService } = createTestBed();
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        container = document.createElement('div');
        container.setAttribute('data-embed-float-dom', 'true');
        container.setAttribute('data-embed-id', 'embed-1');
        container.setAttribute('data-embed-host-unit-id', 'host-doc');
        container.setAttribute('data-embed-child-unit-id', 'child-sheet');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(injector.has(ISheetEmbedRuntimeFocusCoordinator)).toBe(true);
        expect(container.querySelector('.univer-absolute')?.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}]`)?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(selectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(internalEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(selectionContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(focusCoordinator.containsElement('embed-1', internalEditor)).toBe(true);
        expect(interactionBoundaryService.contains('embed-1', internalEditor)).toBe(true);
        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(true);
        expect(focusCoordinator.isChildUnitInActiveSession(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).toBe(true);
        expect(focusCoordinator.hasHostPreservingChildFocusLeaseForHost('host-doc')).toBe(true);
        expect(focusCoordinator.hasHostPreservingChildFocusLeaseForHost('other-host')).toBe(false);

        await act(async () => {
            editorBridgeService.changeVisible({
                visible: false,
                eventType: DeviceInputEventType.PointerUp,
                unitId: 'sheet-1',
            });
            await Promise.resolve();
        });

        expect(focusCoordinator.hasChildInteractionLease('embed-1')).toBe(false);
        expect(focusCoordinator.isChildUnitInActiveSession(DOCS_NORMAL_EDITOR_UNIT_ID_KEY)).toBe(false);
        expect(selectionContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);
        selectionContainer.remove();
    });

    it('claims the app-shell cell editor portal from the registered child runtime scope', async () => {
        const { injector, focusCoordinator, interactionBoundaryService } = createTestBed({
            focusedUnitId: 'host-doc',
        });
        const runtimeScope = focusCoordinator.registerRuntimeScope({
            embedId: 'embed-1',
            hostUnitId: 'host-doc',
            childUnitId: 'scoped-child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        const activeSession = focusCoordinator.acquireLease({
            embedId: 'embed-1',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'scoped-child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(selectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(internalEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(selectionContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(focusCoordinator.containsElement('embed-1', internalEditor)).toBe(true);
        expect(interactionBoundaryService.contains('embed-1', internalEditor)).toBe(true);
        expect(focusCoordinator.hasHostPreservingChildFocusLeaseForHost('host-doc')).toBe(true);

        activeSession.dispose();
        runtimeScope.dispose();
        selectionContainer.remove();
    });

    it('claims the app-shell cell editor portal when the active child session arrives after mount', async () => {
        const { injector, focusCoordinator, interactionBoundaryService } = createTestBed({
            focusedUnitId: 'host-doc',
        });
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(selectionContainer.hasAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe(false);

        let runtimeScope: ReturnType<EmbedRuntimeFocusCoordinator['registerRuntimeScope']>;
        let activeSession: ReturnType<EmbedRuntimeFocusCoordinator['acquireLease']>;

        await act(async () => {
            runtimeScope = focusCoordinator.registerRuntimeScope({
                embedId: 'embed-1',
                hostUnitId: 'host-doc',
                childUnitId: 'scoped-child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
            });
            activeSession = focusCoordinator.acquireLease({
                embedId: 'embed-1',
                role: 'child-session',
                owner: 'doc-block-stage2-runtime',
                hostUnitId: 'host-doc',
                childUnitId: 'scoped-child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
            });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(selectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(internalEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(selectionContainer.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(focusCoordinator.containsElement('embed-1', internalEditor)).toBe(true);
        expect(interactionBoundaryService.contains('embed-1', internalEditor)).toBe(true);

        activeSession!.dispose();
        runtimeScope!.dispose();
        selectionContainer.remove();
    });

    it('focuses the hidden sheet editor when a sheet doc-block session becomes active before the cell editor is visible', async () => {
        const { injector, editorBridgeService, focusCoordinator } = createTestBed({
            focusedUnitId: 'host-doc',
            sheetUnitIds: ['scoped-child-sheet'],
        });
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        internalEditor.tabIndex = -1;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        const hostCanvas = document.createElement('canvas');
        hostCanvas.tabIndex = -1;
        document.body.appendChild(hostCanvas);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        editorBridgeService.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.PointerUp,
            unitId: 'scoped-child-sheet',
        });
        hostCanvas.focus();

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        let runtimeScope: ReturnType<EmbedRuntimeFocusCoordinator['registerRuntimeScope']>;
        let activeSession: ReturnType<EmbedRuntimeFocusCoordinator['acquireLease']>;

        await act(async () => {
            runtimeScope = focusCoordinator.registerRuntimeScope({
                embedId: 'embed-1',
                hostUnitId: 'host-doc',
                childUnitId: 'scoped-child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
            });
            activeSession = focusCoordinator.acquireLease({
                embedId: 'embed-1',
                role: 'child-session',
                owner: 'doc-block-stage2-runtime',
                hostUnitId: 'host-doc',
                childUnitId: 'scoped-child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
            });
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(document.activeElement).toBe(internalEditor);

        activeSession!.dispose();
        runtimeScope!.dispose();
        selectionContainer.remove();
        hostCanvas.remove();
    });

    it('does not focus the hidden sheet editor for an active base doc-block session', async () => {
        const { injector, editorBridgeService, focusCoordinator } = createTestBed({
            focusedUnitId: 'host-doc',
            sheetUnitIds: ['scoped-child-base'],
        });
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        internalEditor.tabIndex = -1;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        const hostCanvas = document.createElement('canvas');
        hostCanvas.tabIndex = -1;
        document.body.appendChild(hostCanvas);
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        editorBridgeService.changeVisible({
            visible: false,
            eventType: DeviceInputEventType.PointerUp,
            unitId: 'scoped-child-base',
        });
        hostCanvas.focus();

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        const runtimeScope = focusCoordinator.registerRuntimeScope({
            embedId: 'embed-base',
            hostUnitId: 'host-doc',
            childUnitId: 'scoped-child-base',
            childType: UniverInstanceType.UNIVER_BASE,
        });
        const activeSession = focusCoordinator.acquireLease({
            embedId: 'embed-base',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'scoped-child-base',
            childType: UniverInstanceType.UNIVER_BASE,
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(document.activeElement).toBe(hostCanvas);

        activeSession.dispose();
        runtimeScope.dispose();
        selectionContainer.remove();
        hostCanvas.remove();
    });

    it('does not let a stale sheet editor container reclaim the shared app-shell portal from another active embed session', async () => {
        const { injector, focusCoordinator } = createTestBed({
            focusedUnitId: 'host-doc',
        });
        const sheetScope = focusCoordinator.registerRuntimeScope({
            embedId: 'embed-sheet',
            hostUnitId: 'host-doc',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        const baseScope = focusCoordinator.registerRuntimeScope({
            embedId: 'embed-base',
            hostUnitId: 'host-doc',
            childUnitId: 'child-base',
            childType: UniverInstanceType.UNIVER_BASE,
        });
        const activeBaseSession = focusCoordinator.acquireLease({
            embedId: 'embed-base',
            role: 'child-session',
            owner: 'doc-block-stage2-runtime',
            hostUnitId: 'host-doc',
            childUnitId: 'child-base',
            childType: UniverInstanceType.UNIVER_BASE,
        });
        const selectionContainer = document.createElement('div');
        selectionContainer.id = `univer-doc-selection-container-${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        const internalEditor = document.createElement('div');
        internalEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        selectionContainer.appendChild(internalEditor);
        document.body.appendChild(selectionContainer);
        container = document.createElement('div');
        container.setAttribute('data-embed-float-dom', 'true');
        container.setAttribute('data-embed-id', 'embed-sheet');
        container.setAttribute('data-embed-host-unit-id', 'host-doc');
        container.setAttribute('data-embed-child-unit-id', 'child-sheet');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-sheet');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(selectionContainer.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).not.toBe('embed-sheet');
        expect(internalEditor.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).not.toBe('embed-sheet');
        expect(focusCoordinator.containsElement('embed-sheet', internalEditor)).toBe(false);

        activeBaseSession.dispose();
        sheetScope.dispose();
        baseScope.dispose();
        selectionContainer.remove();
    });

    it('fits the cell editor after the editor container mounts visible', async () => {
        const { injector, cellEditorResizeService } = createTestBed();
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(cellEditorResizeService.fitTextSize).toHaveBeenCalledTimes(1);
    });

    it('keeps the cell editor visible while formula range selection moves focus to the sheet canvas', async () => {
        const { injector, editorBridgeService } = createTestBed();
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
            latestFormulaEditorProps?.onFormulaSelectingChange?.(1, false);
        });

        expect(editorBridgeService.enableForceKeepVisible).toHaveBeenCalledTimes(1);
        expect(editorBridgeService.disableForceKeepVisible).not.toHaveBeenCalled();
    });

    it('does not override the formula editor click-selection behavior for sheet cell editing', async () => {
        const { injector } = createTestBed();
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(latestFormulaEditorProps?.disableSelectionOnClick).not.toBe(true);
    });

    it('does not mark the standalone sheet cell editor as an embed child editor', async () => {
        const { injector } = createTestBed();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        const editorRoot = container.querySelector('[data-u-comp="editor"]') as HTMLElement;

        expect(editorRoot.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBeNull();
        expect(editorRoot.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
    });

    it('does not keep refocusing the embedded sheet cell editor on delayed timers after it becomes visible', async () => {
        const { injector } = createTestBed({ docSelectionIsFocusing: false });
        const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await Promise.resolve();
        });

        expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 80);
        expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 200);
        expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 500);
        expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 1000);

        setTimeoutSpy.mockRestore();
    });

    it('restores focus to the internal cell editor after pointer down inside the editor canvas', async () => {
        const { injector, docSelectionRenderService } = createTestBed({ docSelectionIsFocusing: false });
        const hiddenEditor = document.createElement('div');
        hiddenEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        hiddenEditor.tabIndex = -1;
        document.body.appendChild(hiddenEditor);
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await Promise.resolve();
        });

        const editorRoot = container.querySelector('.univer-absolute') as HTMLElement;
        const canvas = document.createElement('canvas');
        canvas.tabIndex = 1;
        editorRoot.appendChild(canvas);
        canvas.focus();

        await act(async () => {
            editorRoot.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
            await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(docSelectionRenderService.focus).toHaveBeenCalled();
        expect(document.activeElement).toBe(hiddenEditor);

        hiddenEditor.remove();
    });

    it('does not schedule pointer refocus when the editor is already focused inside the same embed scope', async () => {
        vi.useFakeTimers();
        const { injector, docSelectionRenderService } = createTestBed({ docSelectionIsFocusing: true });
        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            renderEditorContainer(root!, injector);
            await Promise.resolve();
        });
        await act(async () => {
            vi.runOnlyPendingTimers();
            await Promise.resolve();
        });
        await act(async () => {
            vi.runOnlyPendingTimers();
            await Promise.resolve();
        });

        const activeEditor = document.createElement('div');
        const hiddenEditor = document.createElement('div');
        hiddenEditor.id = `__editor_${DOCS_NORMAL_EDITOR_UNIT_ID_KEY}`;
        hiddenEditor.tabIndex = -1;
        activeEditor.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        activeEditor.tabIndex = -1;
        document.body.appendChild(activeEditor);
        document.body.appendChild(hiddenEditor);
        activeEditor.focus();
        docSelectionRenderService.focus.mockClear();

        const editorRoot = container.querySelector('.univer-absolute') as HTMLElement;
        editorRoot.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        await act(async () => {
            vi.runOnlyPendingTimers();
            await Promise.resolve();
        });

        expect(docSelectionRenderService.focus).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(activeEditor);

        hiddenEditor.remove();
        activeEditor.remove();
        vi.useRealTimers();
    });

    it('skips pointer refocus for active elements inside the same embed owner', () => {
        const rootElement = document.createElement('div');
        const target = document.createElement('canvas');
        const activeElement = document.createElement('div');
        rootElement.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        activeElement.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        rootElement.appendChild(target);

        expect(shouldRefocusCellEditorAfterPointerDown({
            root: rootElement,
            target,
            activeElement,
            isEditorFocusing: true,
        })).toBe(false);

        activeElement.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-2');
        expect(shouldRefocusCellEditorAfterPointerDown({
            root: rootElement,
            target,
            activeElement,
            isEditorFocusing: true,
        })).toBe(true);
    });

    it('does not refocus while the active cell editor already belongs to the same embed owner', () => {
        const rootElement = document.createElement('div');
        const target = document.createElement('canvas');
        const activeElement = document.createElement('div');
        rootElement.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        activeElement.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        activeElement.setAttribute('data-embed-runtime-focus-role', 'child-editor');
        rootElement.appendChild(target);

        expect(shouldRefocusCellEditorAfterPointerDown({
            root: rootElement,
            target,
            activeElement,
            isEditorFocusing: false,
        })).toBe(false);
    });
});
