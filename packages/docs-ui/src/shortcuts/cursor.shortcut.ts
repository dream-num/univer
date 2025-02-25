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

export const SelectAllShortcut: IShortcutItem = {
    id: DocSelectAllCommand.id,
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) && (contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(EDITOR_ACTIVATED)),
};
