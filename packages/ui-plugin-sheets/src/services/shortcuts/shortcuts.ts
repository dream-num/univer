import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { QuitCellEditorCommand } from '../cell-editor/cell-editor.command';
import { SHEET_EDITOR_ACTIVATED } from '../context/context';

export const QuitCellEditorShortcutItem: IShortcutItem = {
    id: QuitCellEditorCommand.id,
    binding: KeyCode.ENTER,
    preconditions: (contextService) => contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
};
