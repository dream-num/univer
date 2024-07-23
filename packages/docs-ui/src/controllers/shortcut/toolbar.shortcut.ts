/**
 * Copyright 2023-present DreamNum Inc.
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

import { SetInlineFormatBoldCommand, SetInlineFormatItalicCommand, SetInlineFormatStrikethroughCommand, SetInlineFormatSubscriptCommand, SetInlineFormatSuperscriptCommand, SetInlineFormatUnderlineCommand } from '@univerjs/docs';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import { whenDocAndEditorFocused } from '../../shortcuts/utils';

export const BoldShortCut: IShortcutItem = {
    id: SetInlineFormatBoldCommand.id,
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};

export const ItalicShortCut: IShortcutItem = {
    id: SetInlineFormatItalicCommand.id,
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};

export const UnderlineShortCut: IShortcutItem = {
    id: SetInlineFormatUnderlineCommand.id,
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};

export const StrikeThroughShortCut: IShortcutItem = {
    id: SetInlineFormatStrikethroughCommand.id,
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};

export const SubscriptShortCut: IShortcutItem = {
    id: SetInlineFormatSubscriptCommand.id,
    binding: KeyCode.COMMA | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};

export const SuperscriptShortCut: IShortcutItem = {
    id: SetInlineFormatSuperscriptCommand.id,
    binding: KeyCode.PERIOD | MetaKeys.CTRL_COMMAND,
    preconditions: whenDocAndEditorFocused,
};
