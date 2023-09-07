import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { BreakLineCommand, DeleteLeftCommand } from '../commands/commands/core-editing.command';

export const BreakLineShortcut: IShortcutItem = {
    id: BreakLineCommand.id,
    binding: KeyCode.ENTER,
};

export const DeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    binding: KeyCode.BACKSPACE,
};
