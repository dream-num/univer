import { ChangeZoomRatioCommand } from '@univerjs/base-sheets';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';

export const ZoomInShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    binding: KeyCode.EQUAL | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        delta: 0.2,
    },
};

export const ZoomOutShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    binding: KeyCode.MINUS | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        delta: -0.2,
    },
};

export const ResetZoomShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    binding: KeyCode.Digit0 | MetaKeys.CTRL_COMMAND,
    staticParameters: {
        reset: true,
    },
};
