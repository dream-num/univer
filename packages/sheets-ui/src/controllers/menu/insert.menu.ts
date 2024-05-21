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
    SelectionManagerService,
} from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { IMenuService, MenuGroup, MenuItemType, MenuPosition, mergeMenuConfigs } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { SheetMenuPosition } from './menu';

const COL_INSERT_MENU_ID = 'sheet.menu.col-insert';
export function ColInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(COL_INSERT_MENU_ID);

    return mergeMenuConfigs({
        id: COL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
    }, menuItemConfig);
}

const ROW_INSERT_MENU_ID = 'sheet.menu.row-insert';
export function RowInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ROW_INSERT_MENU_ID);

    return mergeMenuConfigs({
        id: ROW_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
    }, menuItemConfig);
}

const CELL_INSERT_MENU_ID = 'sheet.menu.cell-insert';
export function CellInsertMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CELL_INSERT_MENU_ID);

    return mergeMenuConfigs({
        id: CELL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [MenuPosition.CONTEXT_MENU],
    }, menuItemConfig);
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);
    const selectionManager = accessor.get(SelectionManagerService);

    const menuItemConfig = menuService.getMenuConfig(InsertRowBeforeCommand.id);

    return mergeMenuConfigs({
        id: InsertRowBeforeCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.insertRowBefore',
        icon: 'InsertRowAbove',
        positions: [ROW_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    }, menuItemConfig);
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(InsertRowAfterCommand.id);

    return mergeMenuConfigs({
        id: InsertRowAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [ROW_INSERT_MENU_ID],
        title: 'rightClick.insertRow',
        icon: 'InsertRowBelow',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    }, menuItemConfig);
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(InsertColBeforeCommand.id);

    return mergeMenuConfigs({
        id: InsertColBeforeCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID, CELL_INSERT_MENU_ID],
        title: 'rightClick.insertColumnBefore',
        icon: 'LeftInsertColumn',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    }, menuItemConfig);
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(InsertColAfterCommand.id);

    return mergeMenuConfigs({
        id: InsertColAfterCommand.id,
        type: MenuItemType.BUTTON,
        positions: [COL_INSERT_MENU_ID],
        title: 'rightClick.insertColumn',
        icon: 'RightInsertColumn',
        hidden$: new Observable((observer) => {
            // if there are multi selections this item should be hidden
            const selections = selectionManager.getSelections();
            observer.next(selections?.length !== 1);
        }),
    }, menuItemConfig);
}

export function InsertRangeMoveRightMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(InsertRangeMoveRightConfirmCommand.id);

    return mergeMenuConfigs({
        id: InsertRangeMoveRightConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        icon: 'InsertCellShiftRight',
        positions: [CELL_INSERT_MENU_ID],
    }, menuItemConfig);
}

export function InsertRangeMoveDownMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(InsertRangeMoveDownConfirmCommand.id);

    return mergeMenuConfigs({
        id: InsertRangeMoveDownConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        icon: 'InsertCellDown',
        positions: [CELL_INSERT_MENU_ID],
    }, menuItemConfig);
}
