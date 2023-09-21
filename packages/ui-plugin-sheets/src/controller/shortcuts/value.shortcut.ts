import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { FOCUSING_SHEET } from '@univerjs/core';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    binding: KeyCode.BACKSPACE,
};
