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

import type { IShortcutItem } from '@univerjs/ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { whenFormulaEditorActivated } from '@univerjs/sheets-ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { SelectEditorFormulaOperation } from '../../commands/operations/editor-formula.operation';
import { ReferenceAbsoluteOperation } from '../../commands/operations/reference-absolute.operation';
import { META_KEY_CTRL_AND_SHIFT } from '../../common/prompt';
import { whenEditorStandalone } from '../utils/utils';

export const PROMPT_SELECTION_KEYCODE_ARROW_LIST = [
    KeyCode.ARROW_DOWN,
    KeyCode.ARROW_UP,
    KeyCode.ARROW_LEFT,
    KeyCode.ARROW_RIGHT,
];

export const PROMPT_SELECTION_KEYCODE_LIST = [...PROMPT_SELECTION_KEYCODE_ARROW_LIST, KeyCode.ENTER, KeyCode.TAB, KeyCode.ESC];

export function promptSelectionShortcutItem() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of PROMPT_SELECTION_KEYCODE_LIST) {
        shortcutList.push({
            id: SelectEditorFormulaOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenFormulaEditorActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
            },
        });
    }
    return shortcutList;
}

export function promptSelectionShortcutItemShift() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of PROMPT_SELECTION_KEYCODE_ARROW_LIST) {
        shortcutList.push({
            id: SelectEditorFormulaOperation.id,
            binding: keycode | MetaKeys.SHIFT,
            preconditions: (contextService) => whenFormulaEditorActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                metaKey: MetaKeys.SHIFT,
            },
        });
    }
    return shortcutList;
}

export function promptSelectionShortcutItemCtrl() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of PROMPT_SELECTION_KEYCODE_ARROW_LIST) {
        shortcutList.push({
            id: SelectEditorFormulaOperation.id,
            binding: keycode | MetaKeys.CTRL_COMMAND,
            preconditions: (contextService) => whenFormulaEditorActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                metaKey: MetaKeys.CTRL_COMMAND,
            },
        });
    }
    return shortcutList;
}

export function promptSelectionShortcutItemCtrlAndShift() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of PROMPT_SELECTION_KEYCODE_ARROW_LIST) {
        shortcutList.push({
            id: SelectEditorFormulaOperation.id,
            binding: keycode | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
            preconditions: (contextService) => whenFormulaEditorActivated(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                metaKey: META_KEY_CTRL_AND_SHIFT,
            },
        });
    }
    return shortcutList;
}

export const ChangeRefToAbsoluteShortcut: IShortcutItem = {
    id: ReferenceAbsoluteOperation.id,
    binding: KeyCode.F4,
    preconditions: (contextService) => whenFormulaEditorActivated(contextService),
};

export function singleEditorPromptSelectionShortcutItem() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of [KeyCode.ENTER, KeyCode.TAB, KeyCode.ARROW_DOWN, KeyCode.ARROW_UP]) {
        shortcutList.push({
            id: SelectEditorFormulaOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenEditorStandalone(contextService),
            staticParameters: {
                eventType: DeviceInputEventType.Keyboard,
                keycode,
                isSingleEditor: true,
            },
        });
    }
    return shortcutList;
}
