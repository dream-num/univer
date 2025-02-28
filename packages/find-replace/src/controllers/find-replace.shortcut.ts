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

import type { IContextService } from '@univerjs/core';
import type { IShortcutItem } from '@univerjs/ui';

import { EDITOR_ACTIVATED, FOCUSING_SHEET } from '@univerjs/core';
import { KeyCode, MetaKeys } from '@univerjs/ui';
import {
    FocusSelectionOperation,
    GoToNextMatchOperation,
    GoToPreviousMatchOperation,
    OpenFindDialogOperation,
    OpenReplaceDialogOperation,
} from '../commands/operations/find-replace.operation';
import { FIND_REPLACE_DIALOG_FOCUS, FIND_REPLACE_INPUT_FOCUS, FIND_REPLACE_REPLACE_REVEALED } from '../services/context-keys';

function whenFindReplaceDialogFocused(contextService: IContextService): boolean {
    return contextService.getContextValue(FIND_REPLACE_DIALOG_FOCUS);
}

function whenReplaceRevealed(contextService: IContextService): boolean {
    return contextService.getContextValue(FIND_REPLACE_REPLACE_REVEALED);
}

function whenFindReplaceInputFocused(contextService: IContextService): boolean {
    return contextService.getContextValue(FIND_REPLACE_INPUT_FOCUS);
}

const FIND_REPLACE_SHORTCUT_GROUP = '7_find-replace-shortcuts';

// Current we only support find replace on sheet.
function whenSheetFocused(contextService: IContextService) {
    return contextService.getContextValue(FOCUSING_SHEET);
}

function whenEditorNotActivated(contextService: IContextService): boolean {
    return !contextService.getContextValue(EDITOR_ACTIVATED);
}

export const OpenFindDialogShortcutItem: IShortcutItem = {
    id: OpenFindDialogOperation.id,
    description: 'find-replace.shortcut.open-find-dialog',
    binding: KeyCode.F | MetaKeys.CTRL_COMMAND,
    group: FIND_REPLACE_SHORTCUT_GROUP,
    preconditions(contextService) {
        return !whenFindReplaceDialogFocused(contextService) && whenSheetFocused(contextService) && whenEditorNotActivated(contextService);
    },
};

export const MacOpenFindDialogShortcutItem: IShortcutItem = {
    id: OpenFindDialogOperation.id,
    description: 'find-replace.shortcut.open-find-dialog',
    binding: KeyCode.F | MetaKeys.CTRL_COMMAND,
    mac: KeyCode.F | MetaKeys.MAC_CTRL,
    preconditions(contextService) {
        return !whenFindReplaceDialogFocused(contextService) && whenSheetFocused(contextService) && whenEditorNotActivated(contextService);
    },
};

export const OpenReplaceDialogShortcutItem: IShortcutItem = {
    id: OpenReplaceDialogOperation.id,
    description: 'find-replace.shortcut.open-replace-dialog',
    binding: KeyCode.H | MetaKeys.CTRL_COMMAND,
    mac: KeyCode.H | MetaKeys.MAC_CTRL,
    group: FIND_REPLACE_SHORTCUT_GROUP,
    preconditions(contextService) {
        return whenSheetFocused(contextService) && whenEditorNotActivated(contextService) && (!whenFindReplaceDialogFocused(contextService) || !whenReplaceRevealed(contextService));
    },
};

export const GoToNextFindMatchShortcutItem: IShortcutItem = {
    id: GoToNextMatchOperation.id,
    description: 'find-replace.shortcut.go-to-next-match',
    binding: KeyCode.ENTER,
    group: FIND_REPLACE_SHORTCUT_GROUP,
    priority: 1000,
    preconditions(contextService) {
        return whenFindReplaceInputFocused(contextService) && whenFindReplaceDialogFocused(contextService);
    },
};

export const GoToPreviousFindMatchShortcutItem: IShortcutItem = {
    id: GoToPreviousMatchOperation.id,
    description: 'find-replace.shortcut.go-to-previous-match',
    binding: KeyCode.ENTER | MetaKeys.SHIFT,
    group: FIND_REPLACE_SHORTCUT_GROUP,
    priority: 1000,
    preconditions(contextService) {
        return whenFindReplaceInputFocused(contextService) && whenFindReplaceDialogFocused(contextService);
    },
};

export const FocusSelectionShortcutItem: IShortcutItem = {
    id: FocusSelectionOperation.id,
    description: 'find-replace.shortcut.focus-selection',
    binding: KeyCode.ESC,
    group: FIND_REPLACE_SHORTCUT_GROUP,
    priority: 1000,
    preconditions(contextService) {
        return whenFindReplaceDialogFocused(contextService);
    },
};
