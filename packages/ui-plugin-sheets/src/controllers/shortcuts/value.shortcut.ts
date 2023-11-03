import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { whenEditorNotActivated } from './utils';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.DELETE,
};
