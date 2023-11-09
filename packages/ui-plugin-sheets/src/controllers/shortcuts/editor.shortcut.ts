import { BreakLineCommand, DeleteLeftCommand } from '@univerjs/base-docs';
import { DeviceInputEventType } from '@univerjs/base-render';
import { IShortcutItem, KeyCode, MetaKeys } from '@univerjs/base-ui';
import { FOCUSING_EDITOR } from '@univerjs/core';

import {
    SetCellEditVisibleArrowOperation,
    SetCellEditVisibleOperation,
} from '../../commands/operations/cell-edit.operation';
import { whenEditorActivatedIsVisible, whenEditorFocusIsHidden, whenEditorNotFormulaActivated } from './utils';

export const ARROW_SELECTION_KEYCODE_LIST = [
    KeyCode.ARROW_DOWN,
    KeyCode.ARROW_UP,
    KeyCode.ARROW_LEFT,
    KeyCode.ARROW_RIGHT,
];

export const MOVE_SELECTION_KEYCODE_LIST = [KeyCode.ENTER, KeyCode.TAB, ...ARROW_SELECTION_KEYCODE_LIST];

export function generateArrowSelectionShortCuItem() {
    const shortcutList: IShortcutItem[] = [];
    for (const keycode of ARROW_SELECTION_KEYCODE_LIST) {
        shortcutList.push({
            id: SetCellEditVisibleArrowOperation.id,
            binding: keycode,
            preconditions: (contextService) => whenEditorNotFormulaActivated(contextService),
            staticParameters: {
                visible: false,
                eventType: DeviceInputEventType.Keyboard,
                keycode,
            },
        });
    }
    return shortcutList;
}

export const EditorCursorEnterShortcut: IShortcutItem = {
    id: SetCellEditVisibleOperation.id,
    binding: KeyCode.ENTER,
    preconditions: (contextService) => whenEditorNotFormulaActivated(contextService),
    staticParameters: {
        visible: false,
        eventType: DeviceInputEventType.Keyboard,
        keycode: KeyCode.ENTER,
    },
};

export const EditorCursorTabShortcut: IShortcutItem = {
    id: SetCellEditVisibleOperation.id,
    binding: KeyCode.TAB,
    preconditions: (contextService) => whenEditorNotFormulaActivated(contextService),
    staticParameters: {
        visible: false,
        eventType: DeviceInputEventType.Keyboard,
        keycode: KeyCode.TAB,
    },
};

export const EditorCursorEscShortcut: IShortcutItem = {
    id: SetCellEditVisibleOperation.id,
    binding: KeyCode.ESC,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_EDITOR),
    staticParameters: {
        visible: false,
        eventType: DeviceInputEventType.Keyboard,
        keycode: KeyCode.ESC,
    },
};

export const EditorBreakLineShortcut: IShortcutItem = {
    id: BreakLineCommand.id,
    preconditions: (contextService) => contextService.getContextValue(FOCUSING_EDITOR),
    binding: KeyCode.ENTER | MetaKeys.ALT,
};

export const EditorDeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    preconditions: (contextService) => whenEditorActivatedIsVisible(contextService),
    binding: KeyCode.BACKSPACE,
};

export const EditorDeleteLeftShortcutInActive: IShortcutItem = {
    id: SetCellEditVisibleOperation.id,
    preconditions: (contextService) => whenEditorFocusIsHidden(contextService),
    binding: KeyCode.BACKSPACE,
    staticParameters: {
        visible: true,
        eventType: DeviceInputEventType.Keyboard,
        keycode: KeyCode.BACKSPACE,
    },
};
