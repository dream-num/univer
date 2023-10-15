import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { QuitCellEditorCommand } from '../../services/cell-editor/cell-editor.command';
import { SHEET_EDITOR_ACTIVATED } from '../../services/context/context';

export const QuitCellEditorShortcutItem: IShortcutItem = {
    id: QuitCellEditorCommand.id,
    binding: KeyCode.ENTER,
    preconditions: (contextService) => contextService.matchContextValue(SHEET_EDITOR_ACTIVATED),
};
