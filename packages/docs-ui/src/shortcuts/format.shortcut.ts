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

import { type IShortcutItem, KeyCode, MetaKeys } from '@univerjs/ui';
import { TabCommand } from '../commands/commands/auto-format.command';
import { whenDocAndEditorFocused } from './utils';

export const TabShortCut: IShortcutItem = {
    id: TabCommand.id,
    binding: KeyCode.TAB,
    preconditions: whenDocAndEditorFocused,
};

export const ShiftTabShortCut: IShortcutItem = {
    id: TabCommand.id,
    binding: KeyCode.TAB | MetaKeys.SHIFT,
    preconditions: whenDocAndEditorFocused,
    staticParameters: {
        shift: true,
    },
};
