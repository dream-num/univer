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
import {
    SHEET_TABLE_MOBILE_MENU,
    SHEET_TABLE_RENAME_DIALOG,
    SHEET_TABLE_THEME_PANEL,
    SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
    TABLE_SELECTOR_DIALOG,
} from '../../const';
import { MobileSheetTableFilterPanel } from '../../views/components/MobileSheetTableFilterPanel';
import { MobileSheetTableMenu } from '../../views/components/MobileSheetTableMenu';
import { MobileSheetTableRenameDialog } from '../../views/components/MobileSheetTableRenameDialog';
import { MobileSheetTableSelector } from '../../views/components/MobileSheetTableSelector';
import { MobileSheetTableThemePanel } from '../../views/components/MobileSheetTableThemePanel';

export class MobileComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) componentManager: ComponentManager,
        @Inject(IconManager) iconManager: IconManager
    ) {
        super();

        ([
            [SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, MobileSheetTableFilterPanel],
            [SHEET_TABLE_MOBILE_MENU, MobileSheetTableMenu],
            [SHEET_TABLE_RENAME_DIALOG, MobileSheetTableRenameDialog],
            [TABLE_SELECTOR_DIALOG, MobileSheetTableSelector],
            [SHEET_TABLE_THEME_PANEL, MobileSheetTableThemePanel],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(componentManager.register(key, component));
        });
        this.disposeWithMe(iconManager.register({ TableIcon }));
    }
}
