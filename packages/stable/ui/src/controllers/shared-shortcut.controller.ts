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
import type { IShortcutItem } from '../services/shortcut/shortcut.service';

import { Disposable, EDITOR_ACTIVATED, FOCUSING_FX_BAR_EDITOR, FOCUSING_UNIVER_EDITOR, ICommandService, RedoCommand, UndoCommand } from '@univerjs/core';
import { CopyCommand, CutCommand, PasteCommand } from '../services/clipboard/clipboard.command';
import { KeyCode, MetaKeys } from '../services/shortcut/keycode';
import { IShortcutService } from '../services/shortcut/shortcut.service';

// Not that the clipboard shortcut items would only be invoked when the browser fully supports clipboard API.
// If not, the corresponding shortcut would not be triggered and we will perform clipboard operations
// through clipboard events (editorElement.addEventListener('paste')).

function whenEditorFocused(contextService: IContextService): boolean {
    return contextService.getContextValue(FOCUSING_UNIVER_EDITOR);
}

function whenEditorFocusedButNotCellEditor(contextService: IContextService): boolean {
    return (
        contextService.getContextValue(FOCUSING_UNIVER_EDITOR) &&
        !(contextService.getContextValue(EDITOR_ACTIVATED) || contextService.getContextValue(FOCUSING_FX_BAR_EDITOR))
    );
}

export const CopyShortcutItem: IShortcutItem = {
    id: CopyCommand.id,
    description: 'shortcut.copy',
    group: '1_common-edit',
    binding: KeyCode.C | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorFocused,
};

export const CutShortcutItem: IShortcutItem = {
    id: CutCommand.id,
    description: 'shortcut.cut',
    group: '1_common-edit',
    binding: KeyCode.X | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorFocused,
};

/**
 * This shortcut item is just for displaying shortcut info, do not use it.
 */
export const OnlyDisplayPasteShortcutItem: IShortcutItem = {
    id: PasteCommand.id,
    description: 'shortcut.paste',
    group: '1_common-edit',
    binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
    preconditions: () => false,
};

// For compatibility issues, paste from the shortcut should always go with the native paste event,
// see #1404.
// export const PasteShortcutItem: IShortcutItem = {
//     id: PasteCommand.id,
//     description: 'shortcut.paste',
//     group: '1_common-edit',
//     binding: KeyCode.V | MetaKeys.CTRL_COMMAND,
//     preconditions: supportClipboardAPI,
// };

export const UndoShortcutItem: IShortcutItem = {
    id: UndoCommand.id,
    description: 'shortcut.undo',
    group: '1_common-edit',
    binding: KeyCode.Z | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorFocusedButNotCellEditor,
};

export const RedoShortcutItem: IShortcutItem = {
    id: RedoCommand.id,
    description: 'shortcut.redo',
    group: '1_common-edit',
    binding: KeyCode.Y | MetaKeys.CTRL_COMMAND,
    preconditions: whenEditorFocusedButNotCellEditor,
};

/**
 * Define shared UI behavior across Univer business. Including undo / redo and clipboard operations.
 */
export class SharedController extends Disposable {
    constructor(
        @IShortcutService private readonly _shortcutService: IShortcutService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this.initialize();
    }

    initialize(): void {
        this._registerCommands();
        this._registerShortcuts();
    }

    private _registerCommands(): void {
        [CutCommand, CopyCommand, PasteCommand].forEach((command) =>
            this.disposeWithMe(this._commandService.registerMultipleCommand(command))
        );
    }

    private _registerShortcuts(): void {
        const shortcutItems = [UndoShortcutItem, RedoShortcutItem];
        shortcutItems.push(CutShortcutItem, CopyShortcutItem, OnlyDisplayPasteShortcutItem);

        shortcutItems.forEach((shortcut) => this.disposeWithMe(this._shortcutService.registerShortcut(shortcut)));
    }
}
