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
import { TableIcon } from '@univerjs/icons';
import { ComponentManager, IconManager, IMenuManagerService } from '@univerjs/ui';
import { SHEET_TABLE_THEME_PANEL, TABLE_SELECTOR_DIALOG } from '../const';
import { SheetTableSelector } from '../views/components/SheetTableSelector';
import { SheetTableThemePanel } from '../views/components/SheetTableThemePanel';
import { menuSchema } from './schema';

export class SheetTableMenuController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(IconManager) private _iconManager: IconManager,
        @Inject(IMenuManagerService) private _menuManagerService: IMenuManagerService
    ) {
        super();
        this._initComponents();
        this._registerIcons();
        this._initMenu();
    }

    private _initComponents() {
        ([
            [TABLE_SELECTOR_DIALOG, SheetTableSelector],
            [SHEET_TABLE_THEME_PANEL, SheetTableThemePanel],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(this._componentManager.register(key, comp));
        });
    }

    private _registerIcons(): void {
        this.disposeWithMe(this._iconManager.register({
            TableIcon,
        }));
    }

    private _initMenu() {
        this._menuManagerService.mergeMenu(menuSchema);
    }
}
