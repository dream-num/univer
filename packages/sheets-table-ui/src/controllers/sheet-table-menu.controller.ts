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

import { Disposable, Inject } from '@univerjs/core';
import { TableSingle } from '@univerjs/icons';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { SHEET_TABLE_THEME_PANEL, TABLE_SELECTOR_DIALOG, TABLE_TOOLBAR_BUTTON } from '../const';
import { SheetTableSelector } from '../views/components/SheetTableSelector';
import { SheetTableThemePanel } from '../views/components/SheetTableThemePanel';
import { menuSchema } from './menu.schema';

export class SheetTableMenuController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IMenuManagerService) private _menuManagerService: IMenuManagerService
    ) {
        super();
        this._initComponents();
        this._initMenu();
    }

    private _initComponents() {
        ([
            [TABLE_TOOLBAR_BUTTON, TableSingle],
            [TABLE_SELECTOR_DIALOG, SheetTableSelector],
            [SHEET_TABLE_THEME_PANEL, SheetTableThemePanel],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
