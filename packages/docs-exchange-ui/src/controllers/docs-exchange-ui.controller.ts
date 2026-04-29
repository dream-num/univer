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
import { DownloadIcon } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { DocxImportOperation } from '../commands/commands/docx-import.command';
import { DOCX_IMPORT_ICON } from '../menu/menu';
import { menuSchema } from '../menu/schema';

export class DocsExchangeUIController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @ICommandService private readonly _commandService: ICommandService,
        @IMenuManagerService private readonly _menuManagerService: IMenuManagerService
    ) {
        super();

        this._initComponents();
        this._initCommands();
        this._initMenus();
    }

    private _initComponents() {
        this.disposeWithMe(this._componentManager.register(DOCX_IMPORT_ICON, DownloadIcon));
    }

    private _initCommands() {
        this.disposeWithMe(this._commandService.registerCommand(DocxImportOperation));
    }

    private _initMenus() {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
