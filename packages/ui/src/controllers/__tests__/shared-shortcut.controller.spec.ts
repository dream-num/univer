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

import type { IContextService } from '@univerjs/core';
import { EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    CopyShortcutItem,
    CutShortcutItem,
    OnlyDisplayPasteShortcutItem,
    RedoShortcutItem,
    SharedController,
    UndoShortcutItem,
} from '../shared-shortcut.controller';

function createContext(values: Record<string, boolean>): IContextService {
    return {
        getContextValue: (key: string) => values[key] ?? false,
    } as unknown as IContextService;
}

describe('shared shortcut items', () => {
    it('should require editor focus for copy/cut and never trigger display-only paste', () => {
        const focused = createContext({ [FOCUSING_UNIVER_EDITOR]: true });
        const notFocused = createContext({ [FOCUSING_UNIVER_EDITOR]: false });

        expect(CopyShortcutItem.preconditions!(focused)).toBe(true);
        expect(CopyShortcutItem.preconditions!(notFocused)).toBe(false);
        expect(CutShortcutItem.preconditions!(focused)).toBe(true);
        expect(CutShortcutItem.preconditions!(notFocused)).toBe(false);
        expect(OnlyDisplayPasteShortcutItem.preconditions!(focused)).toBe(false);
    });

    it('should block undo/redo when editor or fx bar is activated', () => {
        const allowed = createContext({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: false,
            [FOCUSING_FX_BAR_EDITOR]: false,
        });
        const blockedByEditor = createContext({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: true,
            [FOCUSING_FX_BAR_EDITOR]: false,
        });
        const blockedByFxBar = createContext({
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: false,
            [FOCUSING_FX_BAR_EDITOR]: true,
        });

        expect(UndoShortcutItem.preconditions!(allowed)).toBe(true);
        expect(RedoShortcutItem.preconditions!(allowed)).toBe(true);
        expect(UndoShortcutItem.preconditions!(blockedByEditor)).toBe(false);
        expect(RedoShortcutItem.preconditions!(blockedByFxBar)).toBe(false);
    });
});

describe('SharedController', () => {
    it('should register clipboard commands and shared shortcuts on initialize', () => {
        const registerMultipleCommand = vi.fn(() => ({ dispose: vi.fn() }));
        const registerShortcut = vi.fn(() => ({ dispose: vi.fn() }));

        const commandService = {
            registerMultipleCommand,
        };
        const shortcutService = {
            registerShortcut,
        };

        const controller = new SharedController(shortcutService as any, commandService as any);

        expect(registerMultipleCommand).toHaveBeenCalledTimes(3);
        expect(registerShortcut).toHaveBeenCalledTimes(5);

        controller.dispose();
    });
});
