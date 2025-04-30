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

import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { AddNoteSingle, DeleteNoteSingle, HideNoteSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { AddNotePopupOperation } from '../commands/operations/add-note-popup.operation';
import { SHEET_NOTE_COMPONENT } from '../views/config';
import { SheetsNote } from '../views/note';
import { menuSchema } from './menu.schema';

export class SheetsNoteUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IMenuManagerService) private readonly _menuManagerService: IMenuManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._initComponents();
        this._initMenu();
        this._initCommands();
    }

    private _initComponents() {
        this.disposeWithMe(this._componentManager.register(SHEET_NOTE_COMPONENT, SheetsNote));
        this.disposeWithMe(this._componentManager.register('AddNoteSingle', AddNoteSingle));
        this.disposeWithMe(this._componentManager.register('DeleteNoteSingle', DeleteNoteSingle));
        this.disposeWithMe(this._componentManager.register('HideNoteSingle', HideNoteSingle));
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }

    private _initCommands() {
        this._commandService.registerCommand(AddNotePopupOperation);
    }
}
