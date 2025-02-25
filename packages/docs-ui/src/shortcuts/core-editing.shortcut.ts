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
import { KeyCode } from '@univerjs/ui';
import { EnterCommand } from '../commands/commands/auto-format.command';
import { DeleteLeftCommand, DeleteRightCommand } from '../commands/commands/doc-delete.command';
import { whenDocAndEditorFocused, whenDocAndEditorFocusedWithBreakLine } from './utils';

export const BreakLineShortcut: IShortcutItem = {
    id: EnterCommand.id,
    preconditions: whenDocAndEditorFocusedWithBreakLine,
    binding: KeyCode.ENTER,
};

export const DeleteLeftShortcut: IShortcutItem = {
    id: DeleteLeftCommand.id,
    preconditions: whenDocAndEditorFocused,
    binding: KeyCode.BACKSPACE,
};

export const DeleteRightShortcut: IShortcutItem = {
    id: DeleteRightCommand.id,
    preconditions: whenDocAndEditorFocused,
    binding: KeyCode.DELETE,
};

// export const TabShortcut: IShortcutItem = {
//     id: DocTabCommand.id,
//     preconditions: whenDocAndEditorFocused,
//     binding: KeyCode.TAB,
// };

// export const ShiftTabShortcut: IShortcutItem = {
//     id: DocShiftTabCommand.id,
//     preconditions: whenDocAndEditorFocused,
//     binding: KeyCode.TAB | MetaKeys.SHIFT,
// };
