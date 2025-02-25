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
import type {
    IExpandSelectionCommandParams,
    IMoveSelectionCommandParams,
    IMoveSelectionEnterAndTabCommandParams,
    ISelectAllCommandParams,
} from '../../commands/commands/set-selection.command';
import { Direction } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import {
    ExpandSelectionCommand,
    JumpOver,
    MoveSelectionCommand,
    MoveSelectionEnterAndTabCommand,
    SelectAllCommand,
} from '../../commands/commands/set-selection.command';
import { whenSheetEditorFocused, whenSheetEditorFocusedAndFxNotFocused } from './utils';

export const MoveSelectionDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-below-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_DOWN,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const MoveSelectionUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-up-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_UP,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const MoveSelectionLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-left-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_LEFT,
    priority: 100,
    preconditions: whenSheetEditorFocusedAndFxNotFocused,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const MoveSelectionRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-right-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_RIGHT,
    priority: 100,
    preconditions: whenSheetEditorFocusedAndFxNotFocused,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

export const MoveSelectionTabShortcutItem: IShortcutItem<IMoveSelectionEnterAndTabCommandParams> = {
    id: MoveSelectionEnterAndTabCommand.id,
    description: 'shortcut.sheet.select-next-cell',
    group: '3_sheet-view',
    binding: KeyCode.TAB,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
        keycode: KeyCode.TAB,
    },
};

export const MoveSelectionTabLeftShortcutItem: IShortcutItem<IMoveSelectionEnterAndTabCommandParams> = {
    id: MoveSelectionEnterAndTabCommand.id,
    description: 'shortcut.sheet.select-previous-cell',
    group: '3_sheet-view',
    binding: KeyCode.TAB | MetaKeys.SHIFT,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
        keycode: KeyCode.TAB,
    },
};

export const MoveSelectionEnterShortcutItem: IShortcutItem<IMoveSelectionEnterAndTabCommandParams> = {
    id: MoveSelectionEnterAndTabCommand.id,
    description: 'shortcut.sheet.select-below-cell',
    group: '3_sheet-view',
    binding: KeyCode.ENTER,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
        keycode: KeyCode.ENTER,
    },
};

export const MoveSelectionEnterUpShortcutItem: IShortcutItem<IMoveSelectionEnterAndTabCommandParams> = {
    id: MoveSelectionEnterAndTabCommand.id,
    description: 'shortcut.sheet.select-up-cell',
    group: '3_sheet-view',
    binding: KeyCode.ENTER | MetaKeys.SHIFT,
    priority: 100,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.UP,
        keycode: KeyCode.ENTER,
    },
};

// export const MoveBackSelectionShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
//     id: MoveSelectionCommand.id,
//     description: 'shortcut.sheet.select-previous-cell',
//     group: '3_sheet-view',
//     binding: KeyCode.TAB | MetaKeys.SHIFT,
//     priority: 100,
//     preconditions: whenSheetEditorFocused,
//     staticParameters: {
//         direction: Direction.LEFT,
//     },
// };

// move selection to continuous end

export const MoveSelectionEndDownShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-below-value-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_DOWN | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: JumpOver.moveGap,
    },
};

export const MoveSelectionEndUpShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-up-value-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_UP | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.UP,
        jumpOver: JumpOver.moveGap,
    },
};

export const MoveSelectionEndLeftShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-left-value-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_LEFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: JumpOver.moveGap,
    },
};

export const MoveSelectionEndRightShortcutItem: IShortcutItem<IMoveSelectionCommandParams> = {
    id: MoveSelectionCommand.id,
    description: 'shortcut.sheet.select-right-value-cell',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_RIGHT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: JumpOver.moveGap,
    },
};

export const ExpandSelectionDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-down',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
    },
};

export const ExpandSelectionUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-up',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.UP,
    },
};

export const ExpandSelectionLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-left',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
    },
};

export const ExpandSelectionRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-right',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
    },
};

// continuous selection to continuous end

export const ExpandSelectionEndDownShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-to-below-gap',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_DOWN | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.DOWN,
        jumpOver: JumpOver.moveGap,
    },
};

export const ExpandSelectionEndUpShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-to-up-gap',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_UP | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.UP,
        jumpOver: JumpOver.moveGap,
    },
};

export const ExpandSelectionEndLeftShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-to-left-gap',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_LEFT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.LEFT,
        jumpOver: JumpOver.moveGap,
    },
};

export const ExpandSelectionEndRightShortcutItem: IShortcutItem<IExpandSelectionCommandParams> = {
    id: ExpandSelectionCommand.id,
    description: 'shortcut.sheet.expand-selection-to-right-gap',
    group: '3_sheet-view',
    binding: KeyCode.ARROW_RIGHT | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        direction: Direction.RIGHT,
        jumpOver: JumpOver.moveGap,
    },
};

export const SelectAllShortcutItem: IShortcutItem<ISelectAllCommandParams> = {
    id: SelectAllCommand.id,
    description: 'shortcut.sheet.select-all',
    group: '3_sheet-view',
    binding: KeyCode.A | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    staticParameters: {
        expandToGapFirst: true,
        loop: true,
    },
};
