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

import type { DocumentDataModel, IDocumentData, Nullable } from '@univerjs/core';
import {
    CommandType,
    DOCS_COMMENT_EDITOR_UNIT_ID_KEY,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    FOCUSING_SHEET,
    ICommandService,
    IContextService,
    IUndoRedoService,
    IUniverInstanceService,
    LogLevel,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DISABLE_AUTO_FOCUS_KEY, KeyCode, MetaKeys } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEditorUndoRedoKeyboardConfig, executeEditorUndoRedoCommand } from '../editor-undo-redo-keyboard';

function createCommandService() {
    const executeCommand = vi.fn(async () => true) as unknown as ICommandService['executeCommand'] & ReturnType<typeof vi.fn>;

    return {
        executeCommand,
    } as unknown as ICommandService & {
        executeCommand: ReturnType<typeof vi.fn>;
    };
}

function createUniverInstanceService(focusedUnitId: string | null = null, editorDataStream: string = '') {
    let currentFocusedUnitId = focusedUnitId;
    const focusUnit = vi.fn((unitId: string) => {
        currentFocusedUnitId = unitId;
    });

    return {
        focusUnit,
        getFocusedUnit: vi.fn(() => currentFocusedUnitId == null
            ? undefined
            : { getUnitId: () => currentFocusedUnitId }),
        getUnit: vi.fn(() => ({
            getBody: () => ({ dataStream: editorDataStream }),
        })),
    } as unknown as IUniverInstanceService & {
        focusUnit: ReturnType<typeof vi.fn>;
    };
}

async function waitForCommandFinally() {
    await Promise.resolve();
    await Promise.resolve();
}

describe('editor undo redo keyboard helper', () => {
    it('focuses a standalone editor before executing undo and restores the previous focus', async () => {
        const commandService = createCommandService();
        const univerInstanceService = createUniverInstanceService('host-doc');

        executeEditorUndoRedoCommand({
            commandId: UndoCommand.id,
            commandService,
            editorUnitId: 'comment-editor',
            univerInstanceService,
        });

        expect(univerInstanceService.focusUnit).toHaveBeenNthCalledWith(1, 'comment-editor');
        expect(commandService.executeCommand).toHaveBeenCalledWith(UndoCommand.id);

        await waitForCommandFinally();

        expect(univerInstanceService.focusUnit).toHaveBeenNthCalledWith(2, 'host-doc');
    });

    it('ignores undo redo shortcuts while editing formulas in sheet editors', async () => {
        for (const editorUnitId of [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY]) {
            const commandService = createCommandService();
            const univerInstanceService = createUniverInstanceService('sheet-unit', '=SUM(A1\r\n');

            executeEditorUndoRedoCommand({
                commandId: RedoCommand.id,
                commandService,
                editorUnitId,
                univerInstanceService,
            });

            await waitForCommandFinally();

            expect(univerInstanceService.focusUnit).not.toHaveBeenCalled();
            expect(commandService.executeCommand).not.toHaveBeenCalled();
        }
    });

    it('keeps undo redo available for non-formula text in sheet editors', async () => {
        for (const editorUnitId of [DOCS_NORMAL_EDITOR_UNIT_ID_KEY, DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY]) {
            const commandService = createCommandService();
            const univerInstanceService = createUniverInstanceService('sheet-unit', 'plain text\r\n');

            executeEditorUndoRedoCommand({
                commandId: UndoCommand.id,
                commandService,
                editorUnitId,
                univerInstanceService,
            });

            await waitForCommandFinally();

            expect(univerInstanceService.focusUnit).not.toHaveBeenCalled();
            expect(commandService.executeCommand).toHaveBeenCalledWith(UndoCommand.id);
        }
    });

    it('does not restore focus when no previous unit was focused', async () => {
        const commandService = createCommandService();
        const univerInstanceService = createUniverInstanceService();

        executeEditorUndoRedoCommand({
            commandId: UndoCommand.id,
            commandService,
            editorUnitId: 'shape-editor',
            univerInstanceService,
        });

        await waitForCommandFinally();

        expect(univerInstanceService.focusUnit).toHaveBeenCalledTimes(1);
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('shape-editor');
    });

    it('registers undo redo shortcuts and delegates unmatched keys', () => {
        const commandService = createCommandService();
        const univerInstanceService = createUniverInstanceService('host-doc');
        const handler = vi.fn();

        const config = createEditorUndoRedoKeyboardConfig({
            commandService,
            editorUnitId: 'comment-editor',
            univerInstanceService,
            keyCodes: [{ keyCode: KeyCode.B, metaKey: MetaKeys.CTRL_COMMAND }],
            handler,
        });

        expect(config.keyCodes).toEqual([
            { keyCode: KeyCode.Z, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.Y, metaKey: MetaKeys.CTRL_COMMAND },
            { keyCode: KeyCode.Z, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT },
            { keyCode: KeyCode.B, metaKey: MetaKeys.CTRL_COMMAND },
        ]);

        config.handler(KeyCode.Z, MetaKeys.CTRL_COMMAND);
        config.handler(KeyCode.Y, MetaKeys.CTRL_COMMAND);
        config.handler(KeyCode.Z, MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT);
        config.handler(KeyCode.B);

        expect(commandService.executeCommand).toHaveBeenNthCalledWith(1, UndoCommand.id);
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(2, RedoCommand.id);
        expect(commandService.executeCommand).toHaveBeenNthCalledWith(3, RedoCommand.id);
        expect(handler).toHaveBeenCalledWith(KeyCode.B, undefined);
    });
});

describe('host-preserving editor undo redo', () => {
    const editorUnitId = `${DOCS_COMMENT_EDITOR_UNIT_ID_KEY}_test`;
    const setEditorTextMutationId = 'test.mutation.set-editor-text';
    let univer: Univer;
    let container: HTMLDivElement;

    function createTestBed() {
        univer = new Univer({ logLevel: LogLevel.SILENT });
        const injector = univer.__getInjector();
        const commandService = injector.get(ICommandService);
        const contextService = injector.get(IContextService);
        const univerInstanceService = injector.get(IUniverInstanceService);
        const undoRedoService = injector.get(IUndoRedoService);
        const workbook = univer.createUnit(UniverInstanceType.UNIVER_SHEET, { id: 'host-sheet' });
        const editor = univer.createUnit<Partial<IDocumentData>, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: editorUnitId,
            body: { dataStream: 'reply\r\n' },
        });
        commandService.registerCommand({
            id: setEditorTextMutationId,
            type: CommandType.MUTATION,
            handler: (accessor, params?: { dataStream: string }) => {
                if (!params) {
                    return false;
                }

                const documentModel = accessor.get(IUniverInstanceService)
                    .getUnit<DocumentDataModel>(editorUnitId, UniverInstanceType.UNIVER_DOC)!;
                documentModel.reset({ ...documentModel.getSnapshot(), body: { dataStream: params.dataStream } });
                return true;
            },
        });
        undoRedoService.pushUndoRedo({
            unitID: editorUnitId,
            undoMutations: [{ id: setEditorTextMutationId, params: { dataStream: '\r\n' } }],
            redoMutations: [{ id: setEditorTextMutationId, params: { dataStream: 'reply\r\n' } }],
        });
        undoRedoService.pushUndoRedo({ unitID: workbook.getUnitId(), undoMutations: [], redoMutations: [] });
        univerInstanceService.focusUnit(workbook.getUnitId());

        container = document.createElement('div');
        const commentInput = document.createElement('textarea');
        const cellInput = document.createElement('textarea');
        container.append(commentInput, cellInput);
        document.body.append(container);
        // Model the sheet's native input focus response to the real host context notification.
        const focusSubscription = contextService.subscribeContextValue$(FOCUSING_SHEET).subscribe((focusing) => {
            if (focusing && !contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)) {
                cellInput.focus();
            }
        });
        univer.onDispose(() => focusSubscription.unsubscribe());
        commentInput.focus();

        return { commandService, contextService, univerInstanceService, undoRedoService, workbook, editor, commentInput, cellInput };
    }

    afterEach(() => {
        univer?.dispose();
        container?.remove();
    });

    it.each([
        { keyCode: KeyCode.Z, metaKey: MetaKeys.CTRL_COMMAND, redo: false },
        { keyCode: KeyCode.Y, metaKey: MetaKeys.CTRL_COMMAND, redo: true },
        { keyCode: KeyCode.Z, metaKey: MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT, redo: true },
    ])('keeps comment input focus for shortcut $keyCode:$metaKey', async ({ keyCode, metaKey, redo }) => {
        const { commandService, contextService, univerInstanceService, undoRedoService, workbook, editor, commentInput } = createTestBed();
        if (redo) {
            univerInstanceService.focusUnit(editorUnitId);
            commandService.syncExecuteCommand(UndoCommand.id);
            univerInstanceService.focusUnit(workbook.getUnitId());
            commentInput.focus();
        }

        const config = createEditorUndoRedoKeyboardConfig({
            commandService,
            contextService,
            editorUnitId,
            preserveHostFocus: true,
            univerInstanceService,
        });
        config.handler(keyCode, metaKey);

        await vi.waitFor(() => {
            expect(univerInstanceService.getFocusedUnit()).toBe(workbook);
        });

        expect(editor.getBody()?.dataStream).toBe(redo ? 'reply\r\n' : '\r\n');
        expect(document.activeElement).toBe(commentInput);
        expect(contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)).toBe(false);
        expect(undoRedoService.getUndoRedoStatus(workbook.getUnitId())).toEqual({ undos: 1, redos: 0 });
        expect(undoRedoService.getUndoRedoStatus(editorUnitId)).toEqual(redo ? { undos: 1, redos: 0 } : { undos: 0, redos: 1 });
    });

    it('preserves an existing disable-auto-focus setting when undo history is empty', async () => {
        const { commandService, contextService, univerInstanceService, undoRedoService, workbook, commentInput } = createTestBed();
        contextService.setContextValue(DISABLE_AUTO_FOCUS_KEY, true);
        undoRedoService.clearUndoRedo(editorUnitId);

        executeEditorUndoRedoCommand({
            commandId: UndoCommand.id,
            commandService,
            contextService,
            editorUnitId,
            preserveHostFocus: true,
            univerInstanceService,
        });

        await vi.waitFor(() => {
            expect(univerInstanceService.getFocusedUnit()).toBe(workbook);
        });

        expect(document.activeElement).toBe(commentInput);
        expect(contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)).toBe(true);
    });

    it.each([false, true])('does not override a focus change during undo (preserveHostFocus=%s)', async (preserveHostFocus) => {
        const { commandService, contextService, univerInstanceService, editor } = createTestBed();
        const otherDocument = univer.createUnit(UniverInstanceType.UNIVER_DOC, { id: 'other-doc' });
        const focusChanges: Array<Nullable<string>> = [];
        const subscription = univerInstanceService.focused$.subscribe((unitId) => focusChanges.push(unitId));
        univer.onDispose(() => subscription.unsubscribe());

        executeEditorUndoRedoCommand({
            commandId: UndoCommand.id,
            commandService,
            contextService,
            editorUnitId,
            preserveHostFocus,
            univerInstanceService,
        });
        univerInstanceService.focusUnit(otherDocument.getUnitId());

        await vi.waitFor(() => {
            expect(editor.getBody()?.dataStream).toBe('\r\n');
        });
        await waitForCommandFinally();

        expect(univerInstanceService.getFocusedUnit()).toBe(otherDocument);
        expect(focusChanges).toEqual(['host-sheet', editorUnitId, otherDocument.getUnitId()]);
        expect(contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)).toBe(false);
    });

    it('keeps the existing host autofocus behavior for editors without preserveHostFocus', async () => {
        const { commandService, contextService, univerInstanceService, workbook, cellInput } = createTestBed();

        executeEditorUndoRedoCommand({
            commandId: UndoCommand.id,
            commandService,
            contextService,
            editorUnitId,
            univerInstanceService,
        });

        await vi.waitFor(() => {
            expect(univerInstanceService.getFocusedUnit()).toBe(workbook);
        });

        expect(document.activeElement).toBe(cellInput);
        expect(contextService.getContextValue(DISABLE_AUTO_FOCUS_KEY)).toBe(false);
    });
});
