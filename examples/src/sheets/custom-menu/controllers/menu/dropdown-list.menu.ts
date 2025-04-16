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

import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { MenuItemType } from '@univerjs/ui';
import { DropdownListFirstItemOperation, DropdownListSecondItemOperation } from '../../commands/operations/dropdown-list.operation';

export const CUSTOM_MENU_DROPDOWN_LIST_OPERATION_ID = 'custom-menu.operation.dropdown-list';

export function CustomMenuItemDropdownListMainButtonFactory(): IMenuSelectorItem<string> {
    return {
    // When type is MenuItemType.SUBITEMS, this factory serves as a container for the drop-down list, and you can set any unique id
        id: CUSTOM_MENU_DROPDOWN_LIST_OPERATION_ID,
    // The type of the menu item, in this case, it is a subitems
        type: MenuItemType.SUBITEMS,
        icon: 'MainButtonIcon',
        tooltip: 'customMenu.dropdownList',
        title: 'customMenu.dropdown',
    };
}

export function CustomMenuItemDropdownListFirstItemFactory(): IMenuButtonItem<string> {
    return {
        id: DropdownListFirstItemOperation.id,
        type: MenuItemType.BUTTON,
        title: 'customMenu.itemOne',
        icon: 'ItemIcon',
    };
}

export function CustomMenuItemDropdownListSecondItemFactory(): IMenuButtonItem<string> {
    return {
        id: DropdownListSecondItemOperation.id,
        type: MenuItemType.BUTTON,
        title: 'customMenu.itemTwo',
        icon: 'ItemIcon',
    };
}
