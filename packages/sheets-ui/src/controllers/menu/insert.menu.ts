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
import { MenuGroup, MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';
import { Observable } from 'rxjs';

import { InsertRangeMoveDownConfirmCommand } from '../../commands/commands/insert-range-move-down-confirm.command';
import { InsertRangeMoveRightConfirmCommand } from '../../commands/commands/insert-range-move-right-confirm.command';
import { SheetMenuPosition } from './menu';

const COL_INSERT_MENU_ID = 'sheet.menu.col-insert';
export function ColInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: COL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.COL_HEADER_CONTEXT_MENU],
    };
}
const ROW_INSERT_MENU_ID = 'sheet.menu.row-insert';
export function RowInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: ROW_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [SheetMenuPosition.ROW_HEADER_CONTEXT_MENU],
    };
}
const CELL_INSERT_MENU_ID = 'sheet.menu.cell-insert';
export function CellInsertMenuItemFactory(): IMenuSelectorItem<string> {
    return {
        id: CELL_INSERT_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_LAYOUT,
        type: MenuItemType.SUBITEMS,
        title: 'rightClick.insert',
        icon: 'Insert',
        positions: [MenuPosition.CONTEXT_MENU],
    };
}

export function InsertRowBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);

    return {
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
    };
}

export function InsertRowAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
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
    };
}

export function InsertColBeforeMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
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
    };
}

export function InsertColAfterMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const selectionManager = accessor.get(SelectionManagerService);
    return {
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
    };
}

export function InsertRangeMoveRightMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveRightConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveRight',
        icon: 'InsertCellShiftRight',
        positions: [CELL_INSERT_MENU_ID],
    };
}

export function InsertRangeMoveDownMenuItemFactory(): IMenuButtonItem {
    return {
        id: InsertRangeMoveDownConfirmCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.moveDown',
        icon: 'InsertCellDown',
        positions: [CELL_INSERT_MENU_ID],
    };
}
