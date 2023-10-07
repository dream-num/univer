import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { FOCUSING_SHEET } from '@univerjs/core';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    preconditions: (contextService) =>
        // when focusing on any other input tag do not trigger this shortcut
        contextService.getContextValue(FOCUSING_SHEET) && document.activeElement?.tagName === 'canvas',
    binding: KeyCode.BACKSPACE,
};
