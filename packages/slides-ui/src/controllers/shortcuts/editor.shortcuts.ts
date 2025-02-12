/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DeleteLeftCommand } from '@univerjs/docs-ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import type { IShortcutItem } from '@univerjs/ui';
import { SetTextEditArrowOperation } from '../../commands/operations/text-edit.operation';
import {
    whenEditorActivated,
    whenFormulaEditorFocused,
} from './utils';

export const ARROW_SELECTION_KEYCODE_LIST = [
    KeyCode.ARROW_DOWN,
    KeyCode.ARROW_UP,
    KeyCode.ARROW_LEFT,
    KeyCode.ARROW_RIGHT,
];

export const MOVE_SELECTION_KEYCODE_LIST = [KeyCode.ENTER, KeyCode.TAB, ...ARROW_SELECTION_KEYCODE_LIST];

export function generateArrowSelectionShortCutItem() {
    const shortcutList: IShortcutItem[] = [];

    for (const keycode of ARROW_SELECTION_KEYCODE_LIST) {
        shortcutList.push({
            id: SetTextEditArrowOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenEditorActivated(contextService),
            staticParameters: {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                isShift: false,
            },
        });

        shortcutList.push({
            id: SetTextEditArrowOperation.id,
            binding: keycode | MetaKeys.SHIFT,
            preconditions: (contextService) => whenEditorActivated(contextService),
            staticParameters: {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                isShift: true,
            },
        });
    }

    return shortcutList;
}

// export const StartEditWithF2Shortcut: IShortcutItem = {
//     id: SetCellEditVisibleWithF2Operation.id,
//     binding: KeyCode.F2,
//     description: 'shortcut.sheet.start-editing',
//     group: '4_sheet-edit',
//     preconditions: whenSheetEditorFocused,
//     staticParameters: {
//         visible: true,
//         eventType: DeviceInputEventType.Keyboard,
//         keycode: KeyCode.F2,
//     },
// };

// export const EditorCursorEnterShortcut: IShortcutItem = {
//     id: SetCellEditVisibleOperation.id,
//     binding: KeyCode.ENTER,
//     description: 'shortcut.sheet.toggle-editing',
//     group: '4_sheet-edit',
//     preconditions: (contextService) => whenEditorDidNotInputFormulaActivated(contextService),
//     staticParameters: {
//         visible: false,
//         eventType: DeviceInputEventType.Keyboard,
//         keycode: KeyCode.ENTER,
//     },
// };

// export const EditorCursorTabShortcut: IShortcutItem = {
//     id: SetCellEditVisibleOperation.id,
//     binding: KeyCode.TAB,
//     preconditions: (contextService) => whenEditorDidNotInputFormulaActivated(contextService),
//     staticParameters: {
//         visible: false,
//         eventType: DeviceInputEventType.Keyboard,
//         keycode: KeyCode.TAB,
//     },
// };

// export const EditorCursorEscShortcut: IShortcutItem = {
//     id: SetCellEditVisibleOperation.id,
//     binding: KeyCode.ESC,
//     description: 'shortcut.sheet.abort-editing',
//     group: '4_sheet-edit',
//     preconditions: (contextService) => whenEditorDidNotInputFormulaActivated(contextService),
//     staticParameters: {
//         visible: false,
//         eventType: DeviceInputEventType.Keyboard,
//         keycode: KeyCode.ESC,
//     },
// };

// export const EditorBreakLineShortcut: IShortcutItem = {
//     id: BreakLineCommand.id,
//     description: 'shortcut.sheet.break-line',
//     group: '4_sheet-edit',
//     preconditions: (contextService) => whenSheetEditorActivated(contextService),
//     binding: KeyCode.ENTER | MetaKeys.ALT,
// };

export const EditorDeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    preconditions: (contextService) => {
        return whenEditorActivated(contextService) || whenFormulaEditorFocused(contextService);
    },
    binding: KeyCode.BACKSPACE,
};

// export const EditorDeleteLeftShortcutInActive: IShortcutItem = {
//     id: SetCellEditVisibleOperation.id,
//     description: 'shortcut.sheet.delete-and-start-editing',
//     group: '4_sheet-edit',
//     preconditions: (contextService) =>
//         whenSheetEditorFocused(contextService) && !whenFormulaEditorFocused(contextService),
//     binding: KeyCode.BACKSPACE,
//     staticParameters: {
//         visible: true,
//         eventType: DeviceInputEventType.Keyboard,
//         keycode: KeyCode.BACKSPACE,
//     },
// };
