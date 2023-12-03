import { SetBoldCommand, SetItalicCommand, SetStrikeThroughCommand, SetUnderlineCommand } from '@univerjs/sheets';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { whenEditorNotActivated } from './utils';

export const SetBoldShortcutItem: IShortcutItem = {
    id: SetBoldCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
};

export const SetItalicShortcutItem: IShortcutItem = {
    id: SetItalicCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
};

export const SetUnderlineShortcutItem: IShortcutItem = {
    id: SetUnderlineCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
};

export const SetStrikeThroughShortcutItem: IShortcutItem = {
    id: SetStrikeThroughCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};
