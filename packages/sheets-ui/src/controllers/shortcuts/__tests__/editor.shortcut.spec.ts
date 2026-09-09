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

import {
    ContextService,
    Direction,
    EDITOR_ACTIVATED,
    FOCUSING_EDITOR_INPUT_FORMULA,
    FOCUSING_SHEET,
    FOCUSING_UNIVER_EDITOR,
    IContextService,
    Injector,
} from '@univerjs/core';
import { MoveCursorOperation, MoveSelectionOperation } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import {
    EditorCursorShiftEnterShortcut,
    EditorCursorShiftTabShortcut,
    generateArrowSelectionShortCutItem,
} from '../editor.shortcut';

describe('editor shortcuts', () => {
    it.each([false, true])('moves to line boundaries with selection extension=%s only in an active Sheet text editor', (extend) => {
        const injector = new Injector();
        injector.add([IContextService, { useClass: ContextService }]);
        const context = injector.get(IContextService);
        context.setContextValue(FOCUSING_SHEET, true);
        context.setContextValue(FOCUSING_UNIVER_EDITOR, true);
        context.setContextValue(EDITOR_ACTIVATED, true);
        const shortcuts = generateArrowSelectionShortCutItem();
        const shift = extend ? MetaKeys.SHIFT : 0;
        for (const [key, arrow, direction] of [
            [KeyCode.HOME, KeyCode.ARROW_LEFT, Direction.LEFT],
            [KeyCode.END, KeyCode.ARROW_RIGHT, Direction.RIGHT],
        ]) {
            const shortcut = shortcuts.find((item) => item.binding === (key | shift));
            expect(shortcut).toBeDefined();
            expect(shortcut).toMatchObject({
                id: extend ? MoveSelectionOperation.id : MoveCursorOperation.id,
                mac: arrow | MetaKeys.CTRL_COMMAND | shift,
                staticParameters: { direction, granularity: 'line' },
            });
            expect(shortcut!.preconditions!(context)).toBe(true);
            context.setContextValue(EDITOR_ACTIVATED, false);
            expect(shortcut!.preconditions!(context)).toBe(false);
            context.setContextValue(EDITOR_ACTIVATED, true);
            context.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, true);
            expect(shortcut!.preconditions!(context)).toBe(false);
            context.setContextValue(FOCUSING_EDITOR_INPUT_FORMULA, false);
        }
        injector.dispose();
    });
    it.each([
        ['Shift+Enter', EditorCursorShiftEnterShortcut, KeyCode.ENTER],
        ['Shift+Tab', EditorCursorShiftTabShortcut, KeyCode.TAB],
    ])('closes the editor with the reverse %s binding', (_name, shortcut, keycode) => {
        expect(shortcut).toMatchObject({
            binding: keycode | MetaKeys.SHIFT,
            staticParameters: {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                isShift: true,
            },
        });
    });
});
