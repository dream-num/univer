import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    binding: KeyCode.BACKSPACE,
};
