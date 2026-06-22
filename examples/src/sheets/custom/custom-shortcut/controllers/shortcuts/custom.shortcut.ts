import type { IShortcutItem } from '@univerjs/ui';
import { whenSheetEditorFocused } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { CustomClearSelectionContentCommand } from '../../commands/commands/custom.command';

export const CustomClearSelectionValueShortcutItem: IShortcutItem = {
    id: CustomClearSelectionContentCommand.id,
    // high priority to ensure it is checked first
    priority: 9999,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: whenSheetEditorFocused,
    binding: KeyCode.DELETE,
    mac: KeyCode.BACKSPACE,
};
