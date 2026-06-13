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
import { KeyCode, MetaKeys } from '@univerjs/ui';

import {
    SetRangeBoldCommand,
    SetRangeFontDecreaseCommand,
    SetRangeFontIncreaseCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { whenSheetFocusedInlineFormat } from './utils';

export const SetBoldShortcutItem: IShortcutItem = {
    id: SetRangeBoldCommand.id,
    description: 'sheets-ui.shortcut.sheet.set-bold',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
};

export const SetItalicShortcutItem: IShortcutItem = {
    id: SetRangeItalicCommand.id,
    description: 'sheets-ui.shortcut.sheet.set-italic',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
};

export const SetUnderlineShortcutItem: IShortcutItem = {
    id: SetRangeUnderlineCommand.id,
    description: 'sheets-ui.shortcut.sheet.set-underline',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
};

export const SetStrikeThroughShortcutItem: IShortcutItem = {
    id: SetRangeStrickThroughCommand.id,
    description: 'sheets-ui.shortcut.sheet.set-strike-through',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};

export const SetFontIncreaseShortcutItem: IShortcutItem = {
    id: SetRangeFontIncreaseCommand.id,
    description: 'sheets-ui.toolbar.fontSizeIncrease',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.PERIOD | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};

export const SetFontDecreaseShortcutItem: IShortcutItem = {
    id: SetRangeFontDecreaseCommand.id,
    description: 'sheets-ui.toolbar.fontSizeDecrease',
    group: '4_sheet-edit',
    groupTitle: 'sheets-ui.shortcut.sheet-edit',
    preconditions: (contextService) => whenSheetFocusedInlineFormat(contextService),
    binding: KeyCode.COMMA | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};
