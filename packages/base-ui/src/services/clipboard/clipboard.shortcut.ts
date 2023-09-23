import { KeyCode, MetaKeys } from '../shortcut/keycode';
import { IShortcutItem } from '../shortcut/shortcut.service';
import { CopyCommand, CutCommand, PasteCommand } from './clipboard.command';

export const CopyShortcutItem: IShortcutItem = {
    id: CopyCommand.id,
    binding: KeyCode.C | MetaKeys.CTRL_COMMAND,
};

export const CutShortcutItem: IShortcutItem = {
    id: CutCommand.id,
    binding: KeyCode.X | MetaKeys.CTRL_COMMAND,
};

export const PasteShortcutItem: IShortcutItem = {
    id: PasteCommand.id,
    binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
};
