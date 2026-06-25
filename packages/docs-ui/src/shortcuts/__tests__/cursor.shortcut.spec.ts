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

import { Direction } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { describe, expect, it } from 'vitest';
import { MoveCursorOperation, MoveSelectionOperation } from '../../commands/operations/doc-cursor.operation';
import {
    MoveCursorDocumentEndShortcut,
    MoveCursorDocumentStartShortcut,
    MoveCursorLineEndShortcut,
    MoveCursorLineStartShortcut,
    MoveCursorParagraphDownShortcut,
    MoveCursorParagraphUpShortcut,
    MoveCursorWordLeftShortcut,
    MoveCursorWordRightShortcut,
    MoveSelectionDocumentEndShortcut,
    MoveSelectionDocumentStartShortcut,
    MoveSelectionLineEndShortcut,
    MoveSelectionLineStartShortcut,
    MoveSelectionParagraphDownShortcut,
    MoveSelectionParagraphUpShortcut,
    MoveSelectionWordLeftShortcut,
    MoveSelectionWordRightShortcut,
} from '../cursor.shortcut';

describe('docs cursor shortcuts', () => {
    it('registers line boundary movement shortcuts with platform-specific bindings', () => {
        expect(MoveCursorLineStartShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.HOME,
            mac: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
            staticParameters: { direction: Direction.LEFT, granularity: 'line' },
        });
        expect(MoveCursorLineEndShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.END,
            mac: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
            staticParameters: { direction: Direction.RIGHT, granularity: 'line' },
        });
        expect(MoveSelectionLineStartShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.HOME | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.LEFT, granularity: 'line' },
        });
        expect(MoveSelectionLineEndShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.END | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.RIGHT, granularity: 'line' },
        });
    });

    it('registers document boundary movement shortcuts', () => {
        expect(MoveCursorDocumentStartShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.HOME | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
            staticParameters: { direction: Direction.UP, granularity: 'document' },
        });
        expect(MoveCursorDocumentEndShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.END | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
            staticParameters: { direction: Direction.DOWN, granularity: 'document' },
        });
        expect(MoveSelectionDocumentStartShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.HOME | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.UP, granularity: 'document' },
        });
        expect(MoveSelectionDocumentEndShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.END | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.DOWN, granularity: 'document' },
        });
    });

    it('registers word movement shortcuts with Option on macOS and Ctrl elsewhere', () => {
        expect(MoveCursorWordLeftShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_LEFT | MetaKeys.ALT,
            staticParameters: { direction: Direction.LEFT, granularity: 'word' },
        });
        expect(MoveCursorWordRightShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_RIGHT | MetaKeys.ALT,
            staticParameters: { direction: Direction.RIGHT, granularity: 'word' },
        });
        expect(MoveSelectionWordLeftShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_LEFT | MetaKeys.ALT | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.LEFT, granularity: 'word' },
        });
        expect(MoveSelectionWordRightShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_RIGHT | MetaKeys.ALT | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.RIGHT, granularity: 'word' },
        });
    });

    it('registers paragraph movement shortcuts with Option on macOS and Ctrl elsewhere', () => {
        expect(MoveCursorParagraphUpShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_UP | MetaKeys.ALT,
            staticParameters: { direction: Direction.UP, granularity: 'paragraph' },
        });
        expect(MoveCursorParagraphDownShortcut).toMatchObject({
            id: MoveCursorOperation.id,
            binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
            mac: KeyCode.ARROW_DOWN | MetaKeys.ALT,
            staticParameters: { direction: Direction.DOWN, granularity: 'paragraph' },
        });
        expect(MoveSelectionParagraphUpShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_UP | MetaKeys.ALT | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.UP, granularity: 'paragraph' },
        });
        expect(MoveSelectionParagraphDownShortcut).toMatchObject({
            id: MoveSelectionOperation.id,
            binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
            mac: KeyCode.ARROW_DOWN | MetaKeys.ALT | MetaKeys.SHIFT,
            staticParameters: { direction: Direction.DOWN, granularity: 'paragraph' },
        });
    });
});
