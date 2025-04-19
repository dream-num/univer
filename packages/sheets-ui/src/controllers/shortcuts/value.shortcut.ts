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
import { ClearSelectionContentCommand } from '@univerjs/sheets';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { SheetCutCommand } from '../../commands/commands/clipboard.command';
import { whenSheetEditorFocused } from './utils';

export const ClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: KeyCode.DELETE,
    mac: KeyCode.BACKSPACE,
};

export const ClearSelectionValueShortcutItemMac: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    mac: KeyCode.DELETE,
};

export const ShiftClearSelectionValueShortcutItem: IShortcutItem = {
    id: ClearSelectionContentCommand.id,
    // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: MetaKeys.SHIFT + KeyCode.BACKSPACE,
};

export const ShiftDeleteSelectionValueShortcutItem: IShortcutItem = {
    id: SheetCutCommand.id,
     // when focusing on any other input tag do not trigger this shortcut
    preconditions: (contextService) => whenSheetEditorFocused(contextService),
    binding: MetaKeys.SHIFT + KeyCode.DELETE,
};
