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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { Editor } from '@univerjs/docs-ui';
import type { MetaKeys } from '@univerjs/ui';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    Direction,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    EDITOR_ACTIVATED,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_SHEET,
    FOCUSING_UNIVER_EDITOR,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LocaleType,
    RANGE_TYPE,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import {
    DeleteLeftCommand,
    DeleteRightCommand,
    EditorService,
    IEditorService,
    MoveCursorOperation,
    MoveSelectionOperation,
    UniverDocsUIPlugin,
} from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { IRefSelectionsService, REF_SELECTIONS_ENABLED, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { ExpandSelectionCommand, JumpOver, MoveSelectionCommand, UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import {
    ComponentManager,
    IconManager,
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    KeyCode,
    RediContext,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { FormulaSelectingType } from '../use-formula-selection';
import {
    isFormulaEditorInteractionOwner,
    shouldMoveFormulaSelectionFromCurrentSelection,
    useLeftAndRightArrow,
} from '../use-left-and-right-arrow';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface IEditorKeysProps {
    selectingType: FormulaSelectingType;
    editor: Editor;
    onMoveInEditor?: (keyCode: KeyCode, metaKey?: MetaKeys) => void;
    getRefSelectionCount?: () => number;
}

function EditorKeys({ selectingType, editor, onMoveInEditor, getRefSelectionCount }: IEditorKeysProps) {
    useLeftAndRightArrow(true, selectingType, editor, onMoveInEditor, getRefSelectionCount);
    return null;
}

describe('formula editor reference selection', () => {
    it.each([
        { keyCode: KeyCode.ARROW_UP, reverseKeyCode: KeyCode.ARROW_DOWN, row: 2, column: 3, expandedRow: 1, expandedColumn: 3 },
        { keyCode: KeyCode.ARROW_DOWN, reverseKeyCode: KeyCode.ARROW_UP, row: 4, column: 3, expandedRow: 5, expandedColumn: 3 },
        { keyCode: KeyCode.ARROW_LEFT, reverseKeyCode: KeyCode.ARROW_RIGHT, row: 3, column: 2, expandedRow: 3, expandedColumn: 1 },
        { keyCode: KeyCode.ARROW_RIGHT, reverseKeyCode: KeyCode.ARROW_LEFT, row: 3, column: 4, expandedRow: 3, expandedColumn: 5 },
    ].flatMap((keys) => [3, 6].map((selectionEnd) => ({ ...keys, selectionEnd }))))('anchors Shift+$keyCode references to the edited cell in a selection ending at $selectionEnd', async (keys) => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        const injector = univer.__getInjector();
        const root = createRoot(document.createElement('div'));
        let focusedEditorId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        let sheetsUIPlugin: UniverSheetsUIPlugin | undefined;
        try {
            injector.add([SheetsSelectionsService]);
            injector.add([ComponentManager]);
            injector.add([IconManager]);
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            sheetsUIPlugin = injector.createInstance(UniverSheetsUIPlugin, {});
            sheetsUIPlugin.onStarting();
            injector.add([DocSelectionManagerService]);
            injector.add([IEditorService, { useClass: EditorService }]);
            vi.spyOn(injector.get(IEditorService), 'getFocusId').mockImplementation(() => focusedEditorId);
            injector.add([IPlatformService, { useValue: { isMac: false, isWindows: true, isLinux: false } }]);
            injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
            injector.add([IShortcutService, { useClass: ShortcutService }]);
            const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'test',
                name: '',
                appVersion: '1.0.0',
                locale: LocaleType.EN_US,
                sheetOrder: ['sheet1'],
                sheets: { sheet1: { id: 'sheet1', rowCount: 10, columnCount: 10 } },
                styles: {},
            });
            injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
            const context = injector.get(IContextService);
            const commands = injector.get(ICommandService);
            [MoveSelectionCommand, ExpandSelectionCommand, SetSelectionsOperation].forEach((command) => {
                commands.registerCommand(command);
            });
            const selections = injector.get(SheetsSelectionsService);
            const refSelections = injector.get(IRefSelectionsService);
            const shortcuts = injector.get(IShortcutService);
            const getRefSelectionCount = () => refSelections.getCurrentSelections().length;

            for (const editorId of [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY]) {
                focusedEditorId = editorId;
                context.setContextValue(REF_SELECTIONS_ENABLED, false);
                await commands.executeCommand(SetSelectionsOperation.id, {
                    unitId: workbook.getUnitId(),
                    subUnitId: 'sheet1',
                    selections: [{
                        range: { startRow: 3, endRow: keys.selectionEnd, startColumn: 3, endColumn: keys.selectionEnd, rangeType: RANGE_TYPE.NORMAL },
                        primary: {
                            startRow: 3,
                            endRow: 3,
                            startColumn: 3,
                            endColumn: 3,
                            actualRow: 3,
                            actualColumn: 3,
                            isMerged: false,
                            isMergedMainCell: true,
                        },
                        style: null,
                    }],
                });
                refSelections.clear();
                context.setContextValue(REF_SELECTIONS_ENABLED, true);
                const editor = { getEditorId: () => editorId, docSelectionRenderService: { isFocusing: true } } as unknown as Editor;
                await act(async () => root.render(
                    <RediContext.Provider value={{ injector }}>
                        <EditorKeys selectingType={FormulaSelectingType.NEED_ADD} editor={editor} getRefSelectionCount={getRefSelectionCount} />
                    </RediContext.Provider>
                ));
                const shortcut = shortcuts.dispatch(new KeyboardEvent('keydown', { keyCode: keys.keyCode, shiftKey: true }));
                expect(shortcut).toBeDefined();
                await expect(commands.executeCommand(shortcut!.id, shortcut!.staticParameters)).resolves.toBe(true);
                expect(selections.getCurrentLastSelection()?.range).toMatchObject({
                    startRow: 3,
                    endRow: keys.selectionEnd,
                    startColumn: 3,
                    endColumn: keys.selectionEnd,
                });
                expect(refSelections.getCurrentLastSelection()?.range).toMatchObject({
                    startRow: Math.min(3, keys.row),
                    endRow: Math.max(3, keys.row),
                    startColumn: Math.min(3, keys.column),
                    endColumn: Math.max(3, keys.column),
                });
                expect(refSelections.getCurrentLastSelection()?.primary).toMatchObject({
                    actualRow: 3,
                    actualColumn: 3,
                });
                await expect(commands.executeCommand(shortcut!.id, shortcut!.staticParameters)).resolves.toBe(true);
                expect(refSelections.getCurrentLastSelection()?.range).toMatchObject({
                    startRow: Math.min(3, keys.expandedRow),
                    endRow: Math.max(3, keys.expandedRow),
                    startColumn: Math.min(3, keys.expandedColumn),
                    endColumn: Math.max(3, keys.expandedColumn),
                });
                expect(refSelections.getCurrentLastSelection()?.primary).toMatchObject({
                    actualRow: 3,
                    actualColumn: 3,
                });
                const reverseShortcut = shortcuts.dispatch(new KeyboardEvent('keydown', { keyCode: keys.reverseKeyCode, shiftKey: true }));
                expect(reverseShortcut).toBeDefined();
                await expect(commands.executeCommand(reverseShortcut!.id, reverseShortcut!.staticParameters)).resolves.toBe(true);
                await expect(commands.executeCommand(reverseShortcut!.id, reverseShortcut!.staticParameters)).resolves.toBe(true);
                expect(refSelections.getCurrentLastSelection()?.range).toMatchObject({
                    startRow: 3,
                    endRow: 3,
                    startColumn: 3,
                    endColumn: 3,
                });
                expect(selections.getCurrentLastSelection()?.range).toMatchObject({
                    startRow: 3,
                    endRow: keys.selectionEnd,
                    startColumn: 3,
                    endColumn: keys.selectionEnd,
                });
            }
        } finally {
            await act(async () => root.unmount());
            vi.restoreAllMocks();
            sheetsUIPlugin?.dispose();
            univer.dispose();
        }
    });
});

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
            [IEditorService, { useValue: { getFocusId: () => DOCS_NORMAL_EDITOR_UNIT_ID_KEY } }],
        ]);
        const container = document.createElement('div');
        const root = createRoot(container);
        const editor = { getEditorId: () => DOCS_NORMAL_EDITOR_UNIT_ID_KEY, docSelectionRenderService: { isFocusing: true } } as unknown as Editor;
        const onMoveInEditor = vi.fn();
        let selectingType = FormulaSelectingType.NOT_SELECT;
        try {
            const context = injector.get(IContextService);
            [FOCUSING_SHEET, FOCUSING_UNIVER_EDITOR, EDITOR_ACTIVATED].forEach((key) => context.setContextValue(key, true));
            const shortcuts = injector.get(IShortcutService);
            injector.createInstance(UniverDocsUIPlugin, {
                override: [[IEditorService, null]],
            });
            const commands = injector.get(ICommandService);
            const executed = vi.fn();
            commands.onCommandExecuted(executed);
            await act(async () => root.render(<RediContext.Provider value={{ injector }}><EditorKeys selectingType={selectingType} editor={editor} onMoveInEditor={onMoveInEditor} /></RediContext.Provider>));
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
            await act(async () => root.render(<RediContext.Provider value={{ injector }}><EditorKeys selectingType={selectingType} editor={editor} onMoveInEditor={onMoveInEditor} /></RediContext.Provider>));
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

describe('use-left-and-right-arrow regression scenarios', () => {
    it('treats the hidden normal editor as the fx bar owner while the fx bar owns formula selection', () => {
        expect(isFormulaEditorInteractionOwner(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, {
            fxBarFocused: true,
        })).toBe(true);
    });

    it('lets the fx bar own formula selection when the canvas leaves no focused editor', () => {
        expect(isFormulaEditorInteractionOwner(null, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, {
            fxBarFocused: true,
            allowMissingFocus: true,
        })).toBe(true);
    });

    it('does not let the hidden normal editor own the fx bar outside an fx formula selection session', () => {
        expect(isFormulaEditorInteractionOwner(DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY, {
            fxBarFocused: false,
        })).toBe(false);
    });

    it('starts the first keyboard-added formula reference from the edited cell selection', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 0)).toBe(true);
    });

    it('routes formula editor interactions only to the focused formula editor', () => {
        expect(isFormulaEditorInteractionOwner('__INTERNAL_EDITOR__DOCS_NORMAL', '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(true);
        expect(isFormulaEditorInteractionOwner('__INTERNAL_EDITOR__DOCS_FORMULA_BAR', '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);
        expect(isFormulaEditorInteractionOwner(null, '__INTERNAL_EDITOR__DOCS_NORMAL')).toBe(false);
    });

    it('continues keyboard-added formula references from the last reference selection after a delimiter', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 1)).toBe(false);
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.NEED_ADD, 2)).toBe(false);
    });

    it('keeps cross-sheet reference editing anchored to the current sheet selection', () => {
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.EDIT_OTHER_SHEET_REFERENCE, 1)).toBe(true);
        expect(shouldMoveFormulaSelectionFromCurrentSelection(FormulaSelectingType.CAN_EDIT, 1)).toBe(false);
    });
});
