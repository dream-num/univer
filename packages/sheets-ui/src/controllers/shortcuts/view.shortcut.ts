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

import { NilCommand } from '@univerjs/core';
import type { IShortcutItem } from '@univerjs/ui';
import { KeyCode, MetaKeys } from '@univerjs/ui';

import { ChangeZoomRatioCommand } from '../../commands/commands/set-zoom-ratio.command';
import { whenSheetEditorFocused } from './utils';

export const ZoomInShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.zoom-in',
    binding: KeyCode.EQUAL | MetaKeys.CTRL_COMMAND,
    group: '3_sheet-view',
    preconditions: whenSheetEditorFocused,
    priority: 1,
    staticParameters: {
        delta: 0.2,
    },
};
export const PreventDefaultZoomInShortcutItem: IShortcutItem = {
    id: NilCommand.id,
    binding: KeyCode.EQUAL | MetaKeys.CTRL_COMMAND,
};

export const ZoomOutShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.zoom-out',
    binding: KeyCode.MINUS | MetaKeys.CTRL_COMMAND,
    group: '3_sheet-view',
    preconditions: whenSheetEditorFocused,
    priority: 1,
    staticParameters: {
        delta: -0.2,
    },
};
export const PreventDefaultZoomOutShortcutItem: IShortcutItem = {
    id: NilCommand.id,
    binding: KeyCode.MINUS | MetaKeys.CTRL_COMMAND,
};

export const ResetZoomShortcutItem: IShortcutItem = {
    id: ChangeZoomRatioCommand.id,
    description: 'shortcut.sheet.reset-zoom',
    binding: KeyCode.Digit0 | MetaKeys.CTRL_COMMAND,
    preconditions: whenSheetEditorFocused,
    group: '3_sheet-view',
    priority: 1,
    staticParameters: {
        reset: true,
    },
};
export const PreventDefaultResetZoomShortcutItem: IShortcutItem = {
    id: NilCommand.id,
    binding: KeyCode.Digit0 | MetaKeys.CTRL_COMMAND,
};
