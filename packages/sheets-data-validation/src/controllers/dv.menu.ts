/**
 * Copyright 2023-present DreamNum Inc.
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

import { getMenuHiddenObservable, type IMenuItem, MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { UniverInstanceType } from '@univerjs/core';
import { getCurrentRangeDisable$ } from '@univerjs/sheets-ui';
import { RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission } from '@univerjs/sheets';
import { AddSheetDataValidationAndOpenCommand } from '../commands/commands/data-validation.command';
import { OpenValidationPanelOperation } from '../commands/operations/data-validation.operation';

export const DataValidationIcon = 'data-validation-single';
const DATA_VALIDATION_MENU_ID = 'sheet.menu.data-validation';

export function dataValidationMenuFactory(accessor: IAccessor): IMenuItem {
    return {
        id: DATA_VALIDATION_MENU_ID,
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_START],
        group: MenuGroup.TOOLBAR_FORMULAS_INSERT,
        icon: DataValidationIcon,
        tooltip: 'dataValidation.title',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetSetCellStylePermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function openDataValidationMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: OpenValidationPanelOperation.id,
        title: 'dataValidation.panel.title',
        type: MenuItemType.BUTTON,
        positions: [DATA_VALIDATION_MENU_ID],
    };
}

export function addDataValidationMenuFactory(_accessor: IAccessor): IMenuItem {
    return {
        id: AddSheetDataValidationAndOpenCommand.id,
        title: 'dataValidation.panel.add',
        type: MenuItemType.BUTTON,
        positions: [DATA_VALIDATION_MENU_ID],
    };
}
