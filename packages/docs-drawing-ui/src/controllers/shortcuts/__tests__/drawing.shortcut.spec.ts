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

import { Direction, FOCUSING_COMMON_DRAWINGS, FOCUSING_DOC, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { KeyCode } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DeleteDocDrawingsCommand } from '../../../commands/commands/delete-doc-drawing.command';
import { MoveDocDrawingsCommand } from '../../../commands/commands/move-drawings.command';
import {
    DeleteDrawingsShortcutItem,
    MoveDrawingDownShortcutItem,
    MoveDrawingLeftShortcutItem,
    MoveDrawingRightShortcutItem,
    MoveDrawingUpShortcutItem,
    whenDocDrawingFocused,
} from '../drawing.shortcut';

function createContext(values: Record<string, boolean>) {
    return {
        getContextValue: vi.fn((key: string) => values[key]),
    };
}

describe('doc drawing shortcuts', () => {
    it('enables drawing shortcuts only when doc editor and common drawing focus are both active', () => {
        expect(whenDocDrawingFocused(createContext({
            [FOCUSING_DOC]: true,
            [FOCUSING_UNIVER_EDITOR]: true,
            [FOCUSING_COMMON_DRAWINGS]: true,
        }) as never)).toBe(true);

        expect(whenDocDrawingFocused(createContext({
            [FOCUSING_DOC]: true,
            [FOCUSING_UNIVER_EDITOR]: true,
            [FOCUSING_COMMON_DRAWINGS]: false,
        }) as never)).toBe(false);
    });

    it('binds arrow keys to one-pixel drawing move commands', () => {
        expect([
            MoveDrawingDownShortcutItem,
            MoveDrawingUpShortcutItem,
            MoveDrawingLeftShortcutItem,
            MoveDrawingRightShortcutItem,
        ]).toEqual([
            expect.objectContaining({
                id: MoveDocDrawingsCommand.id,
                binding: KeyCode.ARROW_DOWN,
                staticParameters: { direction: Direction.DOWN },
                priority: 100,
            }),
            expect.objectContaining({
                id: MoveDocDrawingsCommand.id,
                binding: KeyCode.ARROW_UP,
                staticParameters: { direction: Direction.UP },
                priority: 100,
            }),
            expect.objectContaining({
                id: MoveDocDrawingsCommand.id,
                binding: KeyCode.ARROW_LEFT,
                staticParameters: { direction: Direction.LEFT },
                priority: 100,
            }),
            expect.objectContaining({
                id: MoveDocDrawingsCommand.id,
                binding: KeyCode.ARROW_RIGHT,
                staticParameters: { direction: Direction.RIGHT },
                priority: 100,
            }),
        ]);
    });

    it('binds delete and backspace to drawing deletion with the same focus guard', () => {
        expect(DeleteDrawingsShortcutItem).toEqual(expect.objectContaining({
            id: DeleteDocDrawingsCommand.id,
            binding: KeyCode.DELETE,
            mac: KeyCode.BACKSPACE,
            preconditions: whenDocDrawingFocused,
        }));
    });
});
