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
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeUnderlineCommand,
} from '../../commands/commands/inline-format.command';
import { whenSheetEditorFocused } from './utils';

export const SetBoldShortcutItem: IShortcutItem = {
    id: SetRangeBoldCommand.id,
    description: 'shortcut.sheet.set-bold',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
};

export const SetItalicShortcutItem: IShortcutItem = {
    id: SetRangeItalicCommand.id,
    description: 'shortcut.sheet.set-italic',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
};

export const SetUnderlineShortcutItem: IShortcutItem = {
    id: SetRangeUnderlineCommand.id,
    description: 'shortcut.sheet.set-underline',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
};

export const SetStrikeThroughShortcutItem: IShortcutItem = {
    id: SetRangeStrickThroughCommand.id,
    description: 'shortcut.sheet.set-strike-through',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};
