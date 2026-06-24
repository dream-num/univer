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

import type { Root } from 'react-dom/client';
import { ICommandService, IConfigService, Injector, IUniverInstanceService } from '@univerjs/core';
import { IEditorService } from '@univerjs/docs-ui';
import { EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE, EmbedInteractionBoundaryService, EmbedRuntimeFocusCoordinator } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IShortcutService, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useFormulaSelecting } from '../hooks/use-formula-selection';
import { FormulaEditor } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('../help-function/HelpFunction', () => ({
    HelpFunction: () => null,
}));

vi.mock('../search-function/SearchFunction', () => ({
    SearchFunction: () => null,
}));

vi.mock('../hooks/use-formula-selection', () => ({
    useFormulaSelecting: vi.fn(() => ({
        isSelecting: 0,
        isSelectingRef: { current: 0 },
    })),
}));

vi.mock('../hooks/use-formula-token', () => ({
    useFormulaToken: () => () => [],
}));

vi.mock('../hooks/use-highlight', () => ({
    useDocHight: () => () => [],
    useSheetHighlight: () => () => {},
}));

vi.mock('../hooks/use-refactor-effect', () => ({
    useRefactorEffect: () => {},
}));

vi.mock('../hooks/use-reset-selection', () => ({
    useResetSelection: () => () => {},
}));

vi.mock('../hooks/use-sheet-selection-change', () => ({
    useSheetSelectionChange: () => {},
}));

vi.mock('../hooks/use-switch-sheet', () => ({
    useSwitchSheet: () => {},
}));

vi.mock('../hooks/use-verify', () => ({
    useVerify: () => {},
}));

vi.mock('../hooks/use-left-and-right-arrow', () => ({
    useLeftAndRightArrow: () => {},
}));

describe('FormulaEditor', () => {
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(() => {
        act(() => {
            root?.unmount();
        });
        container?.remove();
        root = undefined;
        container = undefined;
        vi.clearAllMocks();
    });

    it('passes the registered editor to selection hooks after the editor is mounted', async () => {
        const editor = {
            getEditorId: vi.fn(() => 'formula-editor'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: '=\r\n' } })),
            docSelectionRenderService: {
                isFocusing: true,
                isOnPointerEvent: false,
            },
            render: {
                with: vi.fn(),
            },
            input$: new Subject(),
            blur: vi.fn(),
        } as never;
        const documentModel = {
            change$: new Subject(),
            getBody: () => ({ dataStream: '=\r\n' }),
        };
        const injector = new Injector();
        injector.add([IEditorService, {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            getEditor: vi.fn(() => editor),
            focus: vi.fn(),
        } as never]);
        injector.add([ICommandService, {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([IUniverInstanceService, {
            getUnit: vi.fn(() => documentModel),
            getCurrentTypeOfUnit$: vi.fn(() => new Subject()),
        } as never]);
        injector.add([IRenderManagerService, {
            getRenderById: vi.fn(),
        } as never]);
        injector.add([IConfigService, {
            getConfig: vi.fn(() => ({ functionScreenTips: false })),
        } as never]);
        injector.add([IShortcutService, {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root?.render(
                <RediContext.Provider value={{ injector }}>
                    <FormulaEditor
                        unitId="sheet-unit"
                        subUnitId="sheet-1"
                        initValue="="
                        onChange={() => {}}
                    />
                </RediContext.Provider>
            );
        });

        expect(vi.mocked(useFormulaSelecting).mock.calls.some(([options]) => options.editor === editor)).toBe(true);
    });

    it('registers the formula editor as an owned child editor while embedded', async () => {
        const editor = {
            getEditorId: vi.fn(() => 'formula-editor'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: '=\r\n' } })),
            docSelectionRenderService: {
                isFocusing: true,
                isOnPointerEvent: false,
            },
            render: {
                with: vi.fn(),
            },
            input$: new Subject(),
            blur: vi.fn(),
        } as never;
        const documentModel = {
            change$: new Subject(),
            getBody: () => ({ dataStream: '=\r\n' }),
        };
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const injector = new Injector();
        injector.add([IEditorService, {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            getEditor: vi.fn(() => editor),
            focus: vi.fn(),
        } as never]);
        injector.add([ICommandService, {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([IUniverInstanceService, {
            getUnit: vi.fn(() => documentModel),
            getCurrentTypeOfUnit$: vi.fn(() => new Subject()),
        } as never]);
        injector.add([IRenderManagerService, {
            getRenderById: vi.fn(),
        } as never]);
        injector.add([IConfigService, {
            getConfig: vi.fn(() => ({ functionScreenTips: false })),
        } as never]);
        injector.add([IShortcutService, {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([EmbedRuntimeFocusCoordinator, { useValue: focusCoordinator }]);
        injector.add([EmbedInteractionBoundaryService, { useValue: interactionBoundaryService }]);

        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root?.render(
                <RediContext.Provider value={{ injector }}>
                    <FormulaEditor
                        unitId="sheet-unit"
                        subUnitId="sheet-1"
                        editorId="formula-editor"
                        initValue="="
                        onChange={() => {}}
                    />
                </RediContext.Provider>
            );
        });

        const formulaRoot = container.querySelector<HTMLElement>('[data-u-comp="formula-editor"]');

        expect(formulaRoot).not.toBeNull();
        expect(formulaRoot?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBe('embed-1');
        expect(formulaRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBe('child-editor');
        expect(interactionBoundaryService.contains('embed-1', formulaRoot)).toBe(true);
        expect(focusCoordinator.containsElement('embed-1', formulaRoot)).toBe(true);
        expect(focusCoordinator.isChildUnitInActiveSession('formula-editor')).toBe(true);
    });

    it('does not hold an embed child editor lease while the formula editor is not focused', async () => {
        const editor = {
            getEditorId: vi.fn(() => 'formula-editor'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: '=\r\n' } })),
            docSelectionRenderService: {
                isFocusing: false,
                isOnPointerEvent: false,
            },
            render: {
                with: vi.fn(),
            },
            input$: new Subject(),
            blur: vi.fn(),
        } as never;
        const documentModel = {
            change$: new Subject(),
            getBody: () => ({ dataStream: '=\r\n' }),
        };
        const focusCoordinator = new EmbedRuntimeFocusCoordinator();
        const interactionBoundaryService = new EmbedInteractionBoundaryService();
        const injector = new Injector();
        injector.add([IEditorService, {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            getEditor: vi.fn(() => editor),
            focus: vi.fn(),
        } as never]);
        injector.add([ICommandService, {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([IUniverInstanceService, {
            getUnit: vi.fn(() => documentModel),
            getCurrentTypeOfUnit$: vi.fn(() => new Subject()),
        } as never]);
        injector.add([IRenderManagerService, {
            getRenderById: vi.fn(),
        } as never]);
        injector.add([IConfigService, {
            getConfig: vi.fn(() => ({ functionScreenTips: false })),
        } as never]);
        injector.add([IShortcutService, {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([EmbedRuntimeFocusCoordinator, { useValue: focusCoordinator }]);
        injector.add([EmbedInteractionBoundaryService, { useValue: interactionBoundaryService }]);

        container = document.createElement('div');
        container.setAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, 'embed-1');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root?.render(
                <RediContext.Provider value={{ injector }}>
                    <FormulaEditor
                        unitId="sheet-unit"
                        subUnitId="sheet-1"
                        editorId="formula-editor"
                        initValue="="
                        isFocus={false}
                        onChange={() => {}}
                    />
                </RediContext.Provider>
            );
        });

        const formulaRoot = container.querySelector<HTMLElement>('[data-u-comp="formula-editor"]');

        expect(formulaRoot).not.toBeNull();
        expect(formulaRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
        expect(focusCoordinator.hasHostPreservingChildFocusLeaseForHost('host-unit')).toBe(false);
        expect(focusCoordinator.isChildUnitInActiveSession('formula-editor')).toBe(false);
    });

    it('does not mark a standalone formula editor as an embed child editor', async () => {
        const editor = {
            getEditorId: vi.fn(() => 'formula-editor'),
            getSelectionRanges: vi.fn(() => [{ startOffset: 1, endOffset: 1, collapsed: true }]),
            setSelectionRanges: vi.fn(),
            getDocumentData: vi.fn(() => ({ body: { dataStream: '=\r\n' } })),
            docSelectionRenderService: {
                isFocusing: true,
                isOnPointerEvent: false,
            },
            render: {
                with: vi.fn(),
            },
            input$: new Subject(),
            blur: vi.fn(),
        } as never;
        const documentModel = {
            change$: new Subject(),
            getBody: () => ({ dataStream: '=\r\n' }),
        };
        const injector = new Injector();
        injector.add([IEditorService, {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            getEditor: vi.fn(() => editor),
            focus: vi.fn(),
        } as never]);
        injector.add([ICommandService, {
            onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            registerCommand: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([IUniverInstanceService, {
            getUnit: vi.fn(() => documentModel),
            getCurrentTypeOfUnit$: vi.fn(() => new Subject()),
        } as never]);
        injector.add([IRenderManagerService, {
            getRenderById: vi.fn(),
        } as never]);
        injector.add([IConfigService, {
            getConfig: vi.fn(() => ({ functionScreenTips: false })),
        } as never]);
        injector.add([IShortcutService, {
            registerShortcut: vi.fn(() => ({ dispose: vi.fn() })),
        } as never]);
        injector.add([EmbedRuntimeFocusCoordinator, { useValue: new EmbedRuntimeFocusCoordinator() }]);
        injector.add([EmbedInteractionBoundaryService, { useValue: new EmbedInteractionBoundaryService() }]);

        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);

        await act(async () => {
            root?.render(
                <RediContext.Provider value={{ injector }}>
                    <FormulaEditor
                        unitId="sheet-unit"
                        subUnitId="sheet-1"
                        editorId="formula-editor"
                        initValue="="
                        onChange={() => {}}
                    />
                </RediContext.Provider>
            );
        });

        const formulaRoot = container.querySelector<HTMLElement>('[data-u-comp="formula-editor"]');

        expect(formulaRoot).not.toBeNull();
        expect(formulaRoot?.getAttribute(EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE)).toBeNull();
        expect(formulaRoot?.getAttribute(EMBED_RUNTIME_FOCUS_ROLE_ATTRIBUTE)).toBeNull();
    });
});
