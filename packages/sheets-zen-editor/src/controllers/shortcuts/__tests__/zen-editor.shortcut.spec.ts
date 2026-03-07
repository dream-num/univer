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

import { EDITOR_ACTIVATED, FOCUSING_DOC, FOCUSING_EDITOR_STANDALONE, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { whenZenEditorActivated, ZenEditorCancelShortcut, ZenEditorConfirmShortcut } from '../zen-editor.shortcut';

function createContext(values: Record<string, boolean>) {
    return {
        getContextValue: (key: string) => values[key] ?? false,
    } as any;
}

describe('zen editor shortcuts', () => {
    it('should activate only when doc/editor are focused and standalone editor is off', () => {
        const context = createContext({
            [FOCUSING_DOC]: true,
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: true,
            [FOCUSING_EDITOR_STANDALONE]: false,
        });

        expect(whenZenEditorActivated(context)).toBe(true);
        expect(ZenEditorConfirmShortcut.preconditions?.(context as any)).toBe(true);
        expect(ZenEditorCancelShortcut.preconditions?.(context as any)).toBe(true);

        const standaloneContext = createContext({
            [FOCUSING_DOC]: true,
            [FOCUSING_UNIVER_EDITOR]: true,
            [EDITOR_ACTIVATED]: true,
            [FOCUSING_EDITOR_STANDALONE]: true,
        });

        expect(whenZenEditorActivated(standaloneContext)).toBe(false);
    });
});
