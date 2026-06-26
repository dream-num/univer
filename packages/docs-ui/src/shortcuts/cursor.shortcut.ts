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

import type { IShortcutItem } from '@univerjs/ui';
import { Direction, EDITOR_ACTIVATED, FOCUSING_DOC, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { DocSelectAllCommand } from '../commands/commands/doc-select-all.command';
import { MoveCursorOperation, MoveSelectionOperation } from '../commands/operations/doc-cursor.operation';
import { whenDocAndEditorFocused } from './utils';

function moveCursorShortcut(
    direction: Direction,
    granularity: 'word' | 'line' | 'paragraph' | 'document',
    binding: number,
    mac: number = binding,
    win: number = binding,
    linux: number = binding
): IShortcutItem {
    return {
        id: MoveCursorOperation.id,
        binding,
        mac,
        win,
        linux,
        preconditions: whenDocAndEditorFocused,
        staticParameters: {
            direction,
            granularity,
        },
    };
}

function moveSelectionShortcut(
    direction: Direction,
    granularity: 'word' | 'line' | 'paragraph' | 'document',
    binding: number,
    mac: number = binding,
    win: number = binding,
    linux: number = binding
): IShortcutItem {
    return {
        id: MoveSelectionOperation.id,
        binding,
        mac,
        win,
        linux,
        preconditions: whenDocAndEditorFocused,
        staticParameters: {
            direction,
            granularity,
        },
    };
}

export const MoveCursorUpShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_UP,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveCursorDownShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_DOWN,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveCursorLeftShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_LEFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveCursorRightShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_RIGHT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveSelectionUpShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionDownShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionLeftShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveCursorLineStartShortcut = moveCursorShortcut(
    Direction.LEFT,
    'line',
    KeyCode.HOME,
    KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND
);

export const MoveCursorLineEndShortcut = moveCursorShortcut(
    Direction.RIGHT,
    'line',
    KeyCode.END,
    KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND
);

export const MoveSelectionLineStartShortcut = moveSelectionShortcut(
    Direction.LEFT,
    'line',
    KeyCode.HOME | MetaKeys.SHIFT,
    KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT
);

export const MoveSelectionLineEndShortcut = moveSelectionShortcut(
    Direction.RIGHT,
    'line',
    KeyCode.END | MetaKeys.SHIFT,
    KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT
);

export const MoveCursorDocumentStartShortcut = moveCursorShortcut(
    Direction.UP,
    'document',
    KeyCode.HOME | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND
);

export const MoveCursorDocumentEndShortcut = moveCursorShortcut(
    Direction.DOWN,
    'document',
    KeyCode.END | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND
);

export const MoveSelectionDocumentStartShortcut = moveSelectionShortcut(
    Direction.UP,
    'document',
    KeyCode.HOME | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT
);

export const MoveSelectionDocumentEndShortcut = moveSelectionShortcut(
    Direction.DOWN,
    'document',
    KeyCode.END | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT
);

export const MoveCursorWordLeftShortcut = moveCursorShortcut(
    Direction.LEFT,
    'word',
    KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_LEFT | MetaKeys.ALT
);

export const MoveCursorWordRightShortcut = moveCursorShortcut(
    Direction.RIGHT,
    'word',
    KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_RIGHT | MetaKeys.ALT
);

export const MoveSelectionWordLeftShortcut = moveSelectionShortcut(
    Direction.LEFT,
    'word',
    KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_LEFT | MetaKeys.ALT | MetaKeys.SHIFT
);

export const MoveSelectionWordRightShortcut = moveSelectionShortcut(
    Direction.RIGHT,
    'word',
    KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_RIGHT | MetaKeys.ALT | MetaKeys.SHIFT
);

export const MoveCursorParagraphUpShortcut = moveCursorShortcut(
    Direction.UP,
    'paragraph',
    KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_UP | MetaKeys.ALT
);

export const MoveCursorParagraphDownShortcut = moveCursorShortcut(
    Direction.DOWN,
    'paragraph',
    KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    KeyCode.ARROW_DOWN | MetaKeys.ALT
);

export const MoveSelectionParagraphUpShortcut = moveSelectionShortcut(
    Direction.UP,
    'paragraph',
    KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_UP | MetaKeys.ALT | MetaKeys.SHIFT
);

export const MoveSelectionParagraphDownShortcut = moveSelectionShortcut(
    Direction.DOWN,
    'paragraph',
    KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND | MetaKeys.SHIFT,
    KeyCode.ARROW_DOWN | MetaKeys.ALT | MetaKeys.SHIFT
);

export const SelectAllShortcut: IShortcutItem = {
    id: DocSelectAllCommand.id,
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && (contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED)),
};
