import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { QuitCellEditorCommand } from '../cell-editor/cell-editor.command';
import { FOCUSING_SHEET_CELL_EDITOR } from '../context/context';

export const QuitCellEditorShortcutItem: IShortcutItem = {
    id: QuitCellEditorCommand.id,
    binding: KeyCode.ENTER,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_SHEET_CELL_EDITOR),
};
