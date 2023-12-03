import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/ui';

import { ChangeZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';

export const ZoomInShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.zoom-in',
    binding: KeyCode.EQUAL | MetaKeys.CTRL_COMMAND,
    group: '3_sheet-view',
    staticParameters: {
        delta: 0.2,
    },
};

export const ZoomOutShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.zoom-out',
    binding: KeyCode.MINUS | MetaKeys.CTRL_COMMAND,
    group: '3_sheet-view',
    staticParameters: {
        delta: -0.2,
    },
};

export const ResetZoomShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.reset-zoom',
    binding: KeyCode.Digit0 | MetaKeys.CTRL_COMMAND,
    group: '3_sheet-view',
    staticParameters: {
        reset: true,
    },
};
