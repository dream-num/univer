import { DeviceInputEventType } from '@univerjs/base-render';
import { IShortcutItem, KeyCode } from '@univerjs/base-ui';

import { SetEditorFormulaArrowOperation } from '../../commands/operations/editor-formula.operation';
import { whenEditorFormulaActivated } from './utils';

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
            id: SetEditorFormulaArrowOperation.id,
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
