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

import { ClearSelectionAllCommand, ClearSelectionContentCommand, ClearSelectionFormatCommand } from '@univerjs/sheets';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { IMenuService, MenuGroup, MenuItemType, MenuPosition, mergeMenuConfigs } from '@univerjs/ui';

import type { IAccessor } from '@wendellhu/redi';
import { SheetMenuPosition } from './menu';

const CLEAR_SELECTION_MENU_ID = 'sheet.menu.clear-selection';
export function ClearSelectionMenuItemFactory(accessor: IAccessor): IMenuSelectorItem<string> {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CLEAR_SELECTION_MENU_ID);

    return mergeMenuConfigs({
        id: CLEAR_SELECTION_MENU_ID,
        group: MenuGroup.CONTEXT_MENU_FORMAT,
        type: MenuItemType.SUBITEMS,
        icon: 'ClearFormat',
        title: 'rightClick.clearSelection',
        positions: [
            MenuPosition.CONTEXT_MENU,
            SheetMenuPosition.COL_HEADER_CONTEXT_MENU,
            SheetMenuPosition.ROW_HEADER_CONTEXT_MENU,
        ],
    }, menuItemConfig);
}

export function ClearSelectionContentMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ClearSelectionContentCommand.id);

    return mergeMenuConfigs({
        id: ClearSelectionContentCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearContent',
        positions: [CLEAR_SELECTION_MENU_ID],
    }, menuItemConfig);
}

export function ClearSelectionFormatMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ClearSelectionFormatCommand.id);

    return mergeMenuConfigs({
        id: ClearSelectionFormatCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearFormat',
        positions: [CLEAR_SELECTION_MENU_ID],
    }, menuItemConfig);
}

export function ClearSelectionAllMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ClearSelectionAllCommand.id);

    return mergeMenuConfigs({
        id: ClearSelectionAllCommand.id,
        type: MenuItemType.BUTTON,
        title: 'rightClick.clearAll',
        positions: [CLEAR_SELECTION_MENU_ID],
    }, menuItemConfig);
}
