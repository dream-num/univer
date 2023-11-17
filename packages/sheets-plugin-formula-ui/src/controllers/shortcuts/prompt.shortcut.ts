import { DeviceInputEventType } from '@univerjs/base-render';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';
import { whenEditorInputFormulaActivated } from '@univerjs/ui-plugin-sheets';

import { SelectEditorFormulaOperation } from '../../commands/operations/editor-formula.operation';

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
            id: SelectEditorFormulaOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenEditorInputFormulaActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
            },
        });
    }
    return shortcutList;
}
