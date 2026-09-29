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

import type { Editor } from '@univerjs/docs-ui';
import { CommandService, ConfigService, ContextService, DesktopLogService, Direction, DOCS_NORMAL_EDITOR_UNIT_ID_KEY, EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, FOCUSING_SHEET, FOCUSING_UNIVER_EDITOR, ICommandService, IConfigService, IContextService, ILogService, Injector } from '@univerjs/core';
import { DeleteLeftCommand, DeleteRightCommand, IEditorService, MoveCursorOperation, MoveSelectionOperation, UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand } from '@univerjs/sheets-ui';
import { IPlatformService, IShortcutService, IUIRuntimeScopeService, KeyCode, RediContext, ShortcutService, UIRuntimeScopeService } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';

import { FormulaSelectingType } from '../use-formula-selection';
import { useLeftAndRightArrow } from '../use-left-and-right-arrow';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('formula editor text navigation', () => {
    it.each([
        { isMac: true, keyCode: KeyCode.ARROW_LEFT, metaKey: true, direction: Direction.LEFT, granularity: 'line' },
        { isMac: true, keyCode: KeyCode.ARROW_RIGHT, metaKey: true, direction: Direction.RIGHT, granularity: 'line' },
        { isMac: true, keyCode: KeyCode.ARROW_DOWN, metaKey: true, direction: Direction.DOWN, granularity: 'document' },
        { isMac: true, keyCode: KeyCode.ARROW_UP, metaKey: true, direction: Direction.UP, granularity: 'document' },
        { isMac: true, keyCode: KeyCode.ARROW_LEFT, altKey: true, direction: Direction.LEFT, granularity: 'word' },
        { isMac: true, keyCode: KeyCode.ARROW_RIGHT, altKey: true, direction: Direction.RIGHT, granularity: 'word' },
        { isMac: true, keyCode: KeyCode.ARROW_UP, altKey: true, direction: Direction.UP, granularity: 'paragraph' },
        { isMac: true, keyCode: KeyCode.ARROW_DOWN, altKey: true, direction: Direction.DOWN, granularity: 'paragraph' },
        { isMac: false, keyCode: KeyCode.END, direction: Direction.RIGHT, granularity: 'line' },
        { isMac: false, keyCode: KeyCode.HOME, direction: Direction.LEFT, granularity: 'line' },
        { isMac: false, keyCode: KeyCode.ARROW_RIGHT, ctrlKey: true, direction: Direction.RIGHT, granularity: 'word' },
        { isMac: false, keyCode: KeyCode.ARROW_UP, ctrlKey: true, direction: Direction.UP, granularity: 'paragraph' },
        { isMac: false, keyCode: KeyCode.ARROW_DOWN, ctrlKey: true, direction: Direction.DOWN, granularity: 'paragraph' },
        { isMac: false, keyCode: KeyCode.END, ctrlKey: true, direction: Direction.DOWN, granularity: 'document' },
        { isMac: false, keyCode: KeyCode.ARROW_LEFT, ctrlKey: true, direction: Direction.LEFT, granularity: 'word' },
        { isMac: false, keyCode: KeyCode.HOME, ctrlKey: true, direction: Direction.UP, granularity: 'document' },
    ])('keeps the text movement for $keyCode on mac=$isMac', async (keys) => {
        const injector = new Injector([
            [ICommandService, { useClass: CommandService }],
            [IConfigService, { useClass: ConfigService }],
            [IContextService, { useClass: ContextService }],
            [ILogService, { useClass: DesktopLogService }],
            [IPlatformService, { useValue: { isMac: keys.isMac, isWindows: !keys.isMac, isLinux: false } }],
            [IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }],
            [IShortcutService, { useClass: ShortcutService }],
            [IRenderManagerService, { useValue: {} }],
        ]);
        const container = document.createElement('div');
        const root = createRoot(container);
        const editor = { getEditorId: () => DOCS_NORMAL_EDITOR_UNIT_ID_KEY, docSelectionRenderService: { isFocusing: true } } as unknown as Editor;
        const onMoveInEditor = vi.fn();
        let selectingType = FormulaSelectingType.NOT_SELECT;
        function EditorKeys() {
            useLeftAndRightArrow(true, selectingType, editor, onMoveInEditor);
            return null;
        }
        try {
            const context = injector.get(IContextService);
            [FOCUSING_SHEET, FOCUSING_UNIVER_EDITOR, EDITOR_ACTIVATED].forEach((key) => context.setContextValue(key, true));
            const shortcuts = injector.get(IShortcutService);
            injector.createInstance(UniverDocsUIPlugin, {
                override: [[IEditorService, { useValue: { getFocusId: () => DOCS_NORMAL_EDITOR_UNIT_ID_KEY } }]],
            });
            const commands = injector.get(ICommandService);
            const executed = vi.fn();
            commands.onCommandExecuted(executed);
            await act(async () => root.render(<RediContext.Provider value={{ injector }}><EditorKeys /></RediContext.Provider>));
            for (const shiftKey of [false, true]) {
                const shortcut = shortcuts.dispatch(new KeyboardEvent('keydown', { ...keys, shiftKey }));
                expect(shortcut).toBeDefined();
                await commands.executeCommand(shortcut!.id, shortcut!.staticParameters);
                expect(executed).toHaveBeenCalledWith(expect.objectContaining({
                    id: shiftKey ? MoveSelectionOperation.id : MoveCursorOperation.id,
                    params: { direction: keys.direction, granularity: keys.granularity },
                }), expect.anything());
                expect(onMoveInEditor).not.toHaveBeenCalled();
                executed.mockClear();
            }
            context.setContextValue(EDITOR_ACTIVATED, false);
            expect(shortcuts.dispatch(new KeyboardEvent('keydown', keys))).toBeUndefined();
            context.setContextValue(FOCUSING_FX_BAR_EDITOR, true);
            expect(shortcuts.dispatch(new KeyboardEvent('keydown', keys))?.id).toBe(MoveCursorOperation.id);
            context.setContextValue(FOCUSING_UNIVER_EDITOR, false);
            expect(shortcuts.dispatch(new KeyboardEvent('keydown', keys))).toBeUndefined();
            context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
            for (const [event, id, granularity] of keys.isMac
                ? [
                    [{ keyCode: KeyCode.BACKSPACE, altKey: true }, DeleteLeftCommand.id, 'word'],
                    [{ keyCode: KeyCode.BACKSPACE, metaKey: true }, DeleteLeftCommand.id, 'line'],
                    [{ keyCode: KeyCode.DELETE, altKey: true }, DeleteRightCommand.id, 'word'],
                    [{ keyCode: KeyCode.DELETE, ctrlKey: true }, DeleteRightCommand.id, 'line'],
                ] as const
                : [
                    [{ keyCode: KeyCode.BACKSPACE, ctrlKey: true }, DeleteLeftCommand.id, 'word'],
                    [{ keyCode: KeyCode.DELETE, ctrlKey: true }, DeleteRightCommand.id, 'line'],
                ] as const) {
                expect(shortcuts.dispatch(new KeyboardEvent('keydown', event))).toMatchObject({ id, staticParameters: { granularity } });
            }
            // The same key must still select worksheet references after entering formula point mode.
            const moveReference = vi.fn(() => true);
            const expandReference = vi.fn(() => true);
            commands.registerCommand({ ...MoveSelectionCommand, handler: moveReference });
            commands.registerCommand({ ...ExpandSelectionCommand, handler: expandReference });
            selectingType = FormulaSelectingType.NEED_ADD;
            await act(async () => root.render(<RediContext.Provider value={{ injector }}><EditorKeys /></RediContext.Provider>));
            for (const shiftKey of [false, true]) {
                const shortcut = shortcuts.dispatch(new KeyboardEvent('keydown', {
                    keyCode: KeyCode.ARROW_LEFT,
                    metaKey: keys.isMac,
                    ctrlKey: !keys.isMac,
                    shiftKey,
                }));
                await commands.executeCommand(shortcut!.id, shortcut!.staticParameters);
                expect(shiftKey ? expandReference : moveReference).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
                    direction: Direction.LEFT,
                    jumpOver: JumpOver.moveGap,
                    extra: 'formula-editor',
                }), expect.anything());
            }
        } finally {
            await act(async () => root.unmount());
            injector.dispose();
        }
    });
});
