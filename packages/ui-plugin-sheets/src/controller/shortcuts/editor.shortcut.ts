import { DeviceInputEventType } from '@univerjs/base-render';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { FOCUSING_EDITOR } from '@univerjs/core';

import { SetCellEditOperation } from '../../commands/operations/cell-edit.operation';

export const QuitCellEditorShortcutItem: IShortcutItem = {
    id: SetCellEditOperation.id,
    binding: KeyCode.ENTER,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_EDITOR),
    staticParameters: {
        visible: false,
        eventType: DeviceInputEventType.Keyboard,
        keycode: KeyCode.ENTER,
    },
};
