import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { Direction } from '@univerjs/core';

import { MoveCursorOperation } from '../commands/operations/cursor.operation';

export const MoveCursorUpShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_UP,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveCursorDownShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_DOWN,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveCursorLeftShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_LEFT,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveCursorRightShortcut: IShortcutItem = {
    id: MoveCursorOperation.id,
    binding: KeyCode.ARROW_RIGHT,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};
