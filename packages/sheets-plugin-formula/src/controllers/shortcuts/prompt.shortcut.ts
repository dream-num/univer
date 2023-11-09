import { DeviceInputEventType } from '@univerjs/base-render';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { whenEditorFormulaActivated } from '@univerjs/ui-plugin-sheets';

import { SetEditorFormulaOperation } from '../../commands/operations/editor-formula.operation';

export const PROMPT_SELECTION_KEYCODE_LIST = [
    KeyCode.ARROW_DOWN,
    KeyCode.ARROW_UP,
    KeyCode.ARROW_LEFT,
    KeyCode.ARROW_RIGHT,
    KeyCode.ENTER,
    KeyCode.TAB,
];

export function promptSelectionShortcutItem() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of PROMPT_SELECTION_KEYCODE_LIST) {
        shortcutList.push({
            id: SetEditorFormulaOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenEditorFormulaActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
            },
        });
    }
    return shortcutList;
}
