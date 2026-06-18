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
import { ComponentManager, IconManager } from '@univerjs/ui';
import { SHEET_TABLE_RENAME_DIALOG, SHEET_TABLE_THEME_PANEL, SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, TABLE_SELECTOR_DIALOG } from '../const';
import { SheetTableFilterPanel } from '../views/components/SheetTableFilterPanel';
import { SheetTableRenameDialog } from '../views/components/SheetTableRenameDialog';
import { SheetTableSelector } from '../views/components/SheetTableSelector';
import { SheetTableThemePanel } from '../views/components/SheetTableThemePanel';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager,
        @Inject(IconManager) private readonly _iconManager: IconManager
    ) {
        super();

        this._registerComponents();
        this._registerIcons();
    }

    private _registerComponents(): void {
        ([
            [SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, SheetTableFilterPanel],
            [SHEET_TABLE_RENAME_DIALOG, SheetTableRenameDialog],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(this._componentManager.register(key, comp));
        });

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
}
