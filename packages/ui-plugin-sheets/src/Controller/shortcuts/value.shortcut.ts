import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { FOCUSING_SHEET, IShortcutItem, KeyCode } from '@univerjs/base-ui';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET),
    binding: KeyCode.BACKSPACE,
};
