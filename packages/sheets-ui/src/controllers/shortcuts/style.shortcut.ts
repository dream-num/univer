/**
 * Copyright 2023 DreamNum Inc.
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

import { SetBoldCommand, SetItalicCommand, SetStrikeThroughCommand, SetUnderlineCommand } from '@univerjs/sheets';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { whenEditorNotActivated } from './utils';

export const SetBoldShortcutItem: IShortcutItem = {
    id: SetBoldCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.B | MetaKeys.CTRL_COMMAND,
};

export const SetItalicShortcutItem: IShortcutItem = {
    id: SetItalicCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.I | MetaKeys.CTRL_COMMAND,
};

export const SetUnderlineShortcutItem: IShortcutItem = {
    id: SetUnderlineCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.U | MetaKeys.CTRL_COMMAND,
};

export const SetStrikeThroughShortcutItem: IShortcutItem = {
    id: SetStrikeThroughCommand.id,
    preconditions: (contextService) => whenEditorNotActivated(contextService),
    binding: KeyCode.X | MetaKeys.SHIFT | MetaKeys.CTRL_COMMAND,
};
