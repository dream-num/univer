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
import { EDITOR_ACTIVATED, FOCUSING_DOC, FOCUSING_EDITOR_STANDALONE, FOCUSING_UNIVER_EDITOR } from '@univerjs/core';
import { type IShortcutItem, KeyCode, MetaKeys } from '@univerjs/ui';

import { CancelZenEditCommand, ConfirmZenEditCommand } from '../../commands/commands/zen-editor.command';

export const ZenEditorConfirmShortcut: IShortcutItem = {
    id: ConfirmZenEditCommand.id,
    description: 'shortcut.sheet.zen-edit-confirm',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenZenEditorActivated(contextService),
    binding: KeyCode.ENTER | MetaKeys.ALT,
};

export const ZenEditorCancelShortcut: IShortcutItem = {
    id: CancelZenEditCommand.id,
    description: 'shortcut.sheet.zen-edit-cancel',
    group: '4_sheet-edit',
    preconditions: (contextService) => whenZenEditorActivated(contextService),
    binding: KeyCode.ESC,
};

/**
 * Requires the currently focused unit to be Doc and the zen editor is activated.
 * @param contextService
 * @returns
 */
export function whenZenEditorActivated(contextService: IContextService) {
    return (
        contextService.getContextValue(FOCUSING_DOC) &&
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        contextService.getContextValue(EDITOR_ACTIVATED) &&
        !contextService.getContextValue(FOCUSING_EDITOR_STANDALONE)
    );
}
