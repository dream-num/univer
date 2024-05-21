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

import { LocaleType } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/design';
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { IMenuService, MenuItemType, MenuPosition, mergeMenuConfigs } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { CreateEmptySheetCommand, DisposeCurrentUnitCommand } from '../commands/commands/unit.command';

export function LocaleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(LocaleOperation.id);

    return mergeMenuConfigs({
        id: LocaleOperation.id,
        icon: 'VueI18nIcon',
        tooltip: 'i18n',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'English',
                value: LocaleType.EN_US,
            },
            {
                label: '简体中文',
                value: LocaleType.ZH_CN,
            },
            {
                label: 'Русский',
                value: LocaleType.RU_RU,
            },
        ],
    }, menuItemConfig);
}

export function ThemeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ThemeOperation.id);

    return mergeMenuConfigs({
        id: ThemeOperation.id,
        title: 'Theme',
        tooltip: 'Theme',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'green',
                value: greenTheme as any,
            },
            {
                label: 'default',
                value: defaultTheme as any,
            },
        ],
    }, menuItemConfig);
}

export function NotificationMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(NotificationOperation.id);

    return mergeMenuConfigs({
        id: NotificationOperation.id,
        title: 'Notification',
        tooltip: 'Notification',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Notification Success',
                value: 'Notification Success random string to test Notification Success random string to test Notification Success random string to test Notification Success random string to test Notification Success random string to test',
            },
            {
                label: 'Notification Info',
                value: 'Notification Info',
            },
            {
                label: 'Notification Warning',
                value: 'Notification Warning',
            },
            {
                label: 'Notification Error',
                value: 'Notification Error',
            },
        ],
    }, menuItemConfig);
}

export function DialogMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(DialogOperation.id);

    return mergeMenuConfigs({
        id: DialogOperation.id,
        title: 'Dialog',
        tooltip: 'Dialog',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open Dialog',
                value: 'dialog',
            },
            {
                label: 'Draggable Dialog',
                value: 'draggable',
            },
        ],
    }, menuItemConfig);
}

export function ConfirmMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(ConfirmOperation.id);

    return mergeMenuConfigs({
        id: ConfirmOperation.id,
        title: 'Confirm',
        tooltip: 'Confirm',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open confirm',
                value: 'confirm',
            },
        ],
    }, menuItemConfig);
}

export function MessageMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(MessageOperation.id);

    return mergeMenuConfigs({
        id: MessageOperation.id,
        title: 'Message',
        tooltip: 'Message',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open message',
                value: '',
            },
        ],
    }, menuItemConfig);
}

export function SidebarMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SidebarOperation.id);

    return mergeMenuConfigs({
        id: SidebarOperation.id,
        title: 'Sidebar',
        tooltip: 'Sidebar',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open sidebar',
                value: 'open',
            },
            {
                label: 'Close sidebar',
                value: 'close',
            },
        ],
    }, menuItemConfig);
}

export function SetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SetEditable.id);

    return mergeMenuConfigs({
        id: SetEditable.id,
        title: 'Editable',
        tooltip: 'Editable',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'changeUniverEditable',
                value: 'univer',
            },
            {
                label: 'changeSheetEditable',
                value: 'sheet',
            },
        ],
    }, menuItemConfig);
}

export function SaveSnapshotSetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(SaveSnapshotOptions.id);

    return mergeMenuConfigs({
        id: SaveSnapshotOptions.id,
        type: MenuItemType.SELECTOR,
        title: 'Snapshot',
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'saveWorkbook',
                value: 'workbook',
            },
            {
                label: 'saveSheet',
                value: 'sheet',
            },
            {
                label: 'record',
                value: 'record',
            },
        ],
    }, menuItemConfig);
}

const UNIT_ITEM_MENU_ID = 'debugger.unit-menu-item';

export function UnitMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(UNIT_ITEM_MENU_ID);

    return mergeMenuConfigs({
        id: UNIT_ITEM_MENU_ID,
        title: 'Unit',
        tooltip: 'Unit Commands',
        type: MenuItemType.SUBITEMS,
        positions: [MenuPosition.TOOLBAR_OTHERS],
    }, menuItemConfig);
}

export function DisposeCurrentUnitMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(DisposeCurrentUnitCommand.id);

    return mergeMenuConfigs({
        id: DisposeCurrentUnitCommand.id,
        title: 'Dispose Current Unit',
        tooltip: 'Dispose Current Unit',
        icon: 'DS',
        type: MenuItemType.BUTTON,
        positions: [UNIT_ITEM_MENU_ID],
    }, menuItemConfig);
}

export function CreateEmptySheetMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    const menuService = accessor.get(IMenuService);

    const menuItemConfig = menuService.getMenuConfig(CreateEmptySheetCommand.id);

    return mergeMenuConfigs({
        id: CreateEmptySheetCommand.id,
        title: 'Create Another Sheet',
        tooltip: 'Create Another Sheet',
        icon: 'CR',
        type: MenuItemType.BUTTON,
        positions: [UNIT_ITEM_MENU_ID],
    }, menuItemConfig);
}
