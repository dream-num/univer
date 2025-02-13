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

import { Disposable, ICommandService } from '@univerjs/core';
import { IMenuManagerService, IShortcutService, IZenZoneService } from '@univerjs/ui';

import { CancelZenEditCommand, ConfirmZenEditCommand, OpenZenEditorCommand } from '../commands/commands/zen-editor.command';
import { ZEN_EDITOR_COMPONENT, ZenEditor } from '../views/zen-editor';
import { menuSchema } from './menu.schema';
import { ZenEditorCancelShortcut, ZenEditorConfirmShortcut } from './shortcuts/zen-editor.shortcut';

export class ZenEditorUIController extends Disposable {
    constructor(
        @IZenZoneService private readonly _zenZoneService: IZenZoneService,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
        @IShortcutService private readonly _shortcutService: IShortcutService
    ) {
        super();

        this._initialize();
    }

    private _initialize(): void {
        this._initCustomComponents();
        this._initCommands();
        this._initMenus();
        this._initShortcuts();
    }

    private _initCustomComponents(): void {
        this.disposeWithMe(this._zenZoneService.set(ZEN_EDITOR_COMPONENT, ZenEditor));
    }

    private _initCommands(): void {
        [OpenZenEditorCommand, CancelZenEditCommand, ConfirmZenEditCommand].forEach((c) => {
            this.disposeWithMe(this._commandService.registerCommand(c));
        });
    }

    private _initMenus(): void {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initShortcuts(): void {
        [ZenEditorConfirmShortcut, ZenEditorCancelShortcut].forEach((item) => {
            this.disposeWithMe(this._shortcutService.registerShortcut(item));
        });
    }
}
