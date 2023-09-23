import { SetBoldCommand, SetItalicCommand, SetStrikeThroughCommand, SetUnderlineCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { FOCUSING_SHEET } from '@univerjs/core';

import { SHEET_EDITOR_ACTIVATED } from '../../services/context/context';

export const SetBoldShortcutItem: IShortcutItem = {
    id: SetBoldCommand.id,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
};

export const SetItalicShortcutItem: IShortcutItem = {
    id: SetItalicCommand.id,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
};

export const SetUnderlineShortcutItem: IShortcutItem = {
    id: SetUnderlineCommand.id,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
};

export const SetStrikeThroughShortcutItem: IShortcutItem = {
    id: SetStrikeThroughCommand.id,
    preconditions: (contextService) =>
        contextService.getContextValue(FOCUSING_SHEET) && !contextService.getContextValue(SHEET_EDITOR_ACTIVATED),
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};
