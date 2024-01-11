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

import { type IShortcutItem, KeyCode, MetaKeys } from '@univerjs/ui';

import {
    CloseFRDialogOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
} from '../commands/operations/find-replace.operation';
import { FIND_REPLACE_ACTIVATED } from '../services/context-keys';

export const OpenFindDialogShortcutItem: IShortcutItem = {
    id: OpenFindDialogOperation.id,
    description: 'shortcut.find-replace.open-find-dialog',
    binding: KeyCode.F | MetaKeys.CTRL_COMMAND,
    group: '4_find-replace',
    preconditions(contextService) {
        return !contextService.getContextValue(FIND_REPLACE_ACTIVATED);
    },
};

export const OpenReplaceDialogShortcutItem: IShortcutItem = {
    id: OpenReplaceDialogOperation.id,
    description: 'shortcut.find-replace.open-replace-dialog',
    binding: KeyCode.H | MetaKeys.CTRL_COMMAND,
    group: '4_find-replace',
    preconditions(contextService) {
        return !contextService.getContextValue(FIND_REPLACE_ACTIVATED);
    },
};

export const CloseFRDialogShortcutItem: IShortcutItem = {
    id: CloseFRDialogOperation.id,
    description: 'shortcut.find-replace.close-dialog',
    binding: KeyCode.ESC,
    group: '4_find-replace',
    priority: 1000,
    preconditions(contextService) {
        return !!contextService.getContextValue(FIND_REPLACE_ACTIVATED);
    },
};

export const GoToNextFindMatchShortcutItem: IShortcutItem = {
    id: GoToNextMatchOperation.id,
    description: 'shortcut.find-replace.go-to-next-find-match',
    binding: KeyCode.ARROW_DOWN,
    group: '4_find-replace',
    priority: 1000,
    preconditions(contextService) {
        return !!contextService.getContextValue(FIND_REPLACE_ACTIVATED);
    },
};

export const GoToPreviousFindMatchShortcutItem: IShortcutItem = {
    id: GoToPreviousMatchOperation.id,
    description: 'shortcut.find-replace.go-to-previous-find-match',
    binding: KeyCode.ARROW_UP,
    group: '4_find-replace',
    priority: 1000,
    preconditions(contextService) {
        return !!contextService.getContextValue(FIND_REPLACE_ACTIVATED);
    },
};
