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

import type { ICommandService, IUniverInstanceService } from '@univerjs/core';
import {
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
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
