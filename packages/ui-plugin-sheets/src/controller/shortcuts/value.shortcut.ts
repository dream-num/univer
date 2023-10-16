import { ClearSelectionContentCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { whenEditorNotActivated } from './utils';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    preconditions: (contextService) =>
        // when focusing on any other input tag do not trigger this shortcut
        whenEditorNotActivated(contextService) && document.activeElement?.tagName === 'canvas',
    binding: KeyCode.BACKSPACE,
};
