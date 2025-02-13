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

import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand, RangeProtectionPermissionEditPoint, WorkbookEditablePermission, WorksheetEditPermission, WorksheetSetCellStylePermission, WorksheetSetCellValuePermission } from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { getMenuHiddenObservable, MenuItemType } from '@univerjs/ui';

import type { IAccessor } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import { getCurrentRangeDisable$, getObservableWithExclusiveRange$ } from './menu-util';

export const CLEAR_SELECTION_MENU_ID = 'sheet.menu.clear-selection';
export function ClearSelectionMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: CLEAR_SELECTION_MENU_ID,
        type: MenuItemType.SUBITEMS,
        icon: 'ClearFormat',
        title: 'rightClick.clearSelection',
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}

export function ClearSelectionContentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
export function ClearSelectionFormatMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ClearSelectionFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearFormat',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
export function ClearSelectionAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ClearSelectionAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearAll',
        disabled$: getObservableWithExclusiveRange$(accessor, getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetSetCellValuePermission, WorksheetSetCellStylePermission], rangeTypes: [RangeProtectionPermissionEditPoint] })),
        hidden$: getMenuHiddenObservable(accessor, UniverInstanceType.UNIVER_SHEET),
    };
}
