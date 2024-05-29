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

import {
    InsertColAfterCommand,
    InsertColBeforeCommand,
    InsertRowAfterCommand,
    InsertRowBeforeCommand,
    RangeProtectionPermissionEditPoint,
    WorkbookEditablePermission,
    WorksheetEditPermission,
    WorksheetInsertColumnPermission,
    WorksheetInsertRowPermission,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { SheetMenuPosition } from './menu';
import { getBaseRangeMenuHidden$, getCellMenuHidden$, getCurrentRangeDisable$, getInsertAfterMenuHidden$, getInsertBeforeMenuHidden$ } from './menu-util';

const COL_INSERT_MENU_ID = 'sheet.menu.col-insert';
export function ColInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: COL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
        hidden$: getBaseRangeMenuHidden$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission, WorksheetInsertColumnPermission] }),
    };
}

const ROW_INSERT_MENU_ID = 'sheet.menu.row-insert';
export function RowInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: ROW_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
        hidden$: getBaseRangeMenuHidden$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

const CELL_INSERT_MENU_ID = 'sheet.menu.cell-insert';
export function CellInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    return {
        id: CELL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [MenuPosition.CONTEXT_MENU],
        hidden$: getBaseRangeMenuHidden$(accessor),
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRowBefore',
        icon: 'InsertRowAbove',
        positions: [ROW_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertBeforeMenuHidden$(accessor, 'row'),
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [ROW_INSERT_MENU_ID],
        title: 'rightClick.insertRow',
        icon: 'InsertRowBelow',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertRowPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getInsertAfterMenuHidden$(accessor, 'row'),
    };
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        title: 'rightClick.insertColumnBefore',
        icon: 'LeftInsertColumn',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

        hidden$: getInsertBeforeMenuHidden$(accessor, 'col'),

    };
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID],
        title: 'rightClick.insertColumn',
        icon: 'RightInsertColumn',
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetInsertColumnPermission, WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

        hidden$: getInsertAfterMenuHidden$(accessor, 'col'),
    };
}

export function InsertRangeMoveRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRangeMoveRightConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        icon: 'InsertCellShiftRight',
        positions: [CELL_INSERT_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),
        hidden$: getCellMenuHidden$(accessor, 'col'),
    };
}

export function InsertRangeMoveDownMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: InsertRangeMoveDownConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        icon: 'InsertCellDown',
        positions: [CELL_INSERT_MENU_ID],
        disabled$: getCurrentRangeDisable$(accessor, { workbookTypes: [WorkbookEditablePermission], worksheetTypes: [WorksheetEditPermission], rangeTypes: [RangeProtectionPermissionEditPoint] }),

        hidden$: getCellMenuHidden$(accessor, 'row'),
    };
}
