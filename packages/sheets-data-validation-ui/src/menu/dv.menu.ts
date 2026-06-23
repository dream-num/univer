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

import type { IAccessor } from '@univerjs/core';
import type { IMenuItem } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { UniverInstanceType } from '@univerjs/core';
import {
    RangeProtectionPermissionEditPoint,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetSetCellStylePermission,
} from '@univerjs/sheets';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';
import { AddSheetDataValidationAndOpenCommand } from '../commands/commands/data-validation-ui.command';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';

export const DATA_VALIDATION_MENU_ID = 'sheet.menu.data-validation';

export function dataValidationMenuFactory(accessor: IAccessor): IMenuItem<LocaleKey> {
    return {
        id: DATA_VALIDATION_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'DataValidationIcon',
        tooltip: 'sheets-data-validation-ui.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, {
            workbookTypes: [WorkbookEditablePermission],
            worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
        }),
    };
}

export function openDataValidationMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: OpenValidationPanelOperation.id,
        title: 'sheets-data-validation-ui.panel.title',
        type: MenuItemType.BUTTON,
    };
}

export function addDataValidationMenuFactory(): IMenuItem<LocaleKey> {
    return {
        id: AddSheetDataValidationAndOpenCommand.id,
        title: 'sheets-data-validation-ui.panel.add',
        type: MenuItemType.BUTTON,
    };
}
