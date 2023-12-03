import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/ui';
import { Direction, FOCUSING_DOC, FOCUSING_EDITOR } from '@univerjs/core';

import { MoveCursorOperation, MoveSelectionOperation } from '../commands/operations/cursor.operation';
import { SelectAllOperation } from '../commands/operations/select-all.operation';

export const MoveCursorUpShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_UP,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveCursorDownShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_DOWN,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveCursorLeftShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_LEFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveCursorRightShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_RIGHT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveSelectionUpShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionDownShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionLeftShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcut: IShortcutItem = {
    id: MoveSelectionOperation.id,
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const SelectAllShortcut: IShortcutItem = {
    id: SelectAllOperation.id,
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_DOC) || contextService.getContextValue(FOCUSING_EDITOR),
};
