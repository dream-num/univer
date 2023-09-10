import { FOCUSING_DOC, IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { BreakLineCommand, DeleteLeftCommand } from '../commands/commands/core-editing.command';

export const BreakLineShortcut: IShortcutItem = {
    id: BreakLineCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    binding: KeyCode.ENTER,
};

export const DeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_DOC),
    binding: KeyCode.BACKSPACE,
};
