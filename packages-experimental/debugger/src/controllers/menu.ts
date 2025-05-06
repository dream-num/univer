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
import type { IMenuButtonItem, IMenuSelectorItem } from '@univerjs/ui';
import { LocaleType } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/themes';
// import { defaultTheme } from '@univerjs/themes';
import { MenuItemType } from '@univerjs/ui';
import { CreateFloatDomCommand } from '../commands/commands/float-dom.command';
import { CreateEmptySheetCommand, DisposeCurrentUnitCommand, DisposeUniverCommand, LoadSheetSnapshotCommand } from '../commands/commands/unit.command';
import { ShowCellContentOperation } from '../commands/operations/cell.operation';
import { ChangeUserCommand, UnitRole } from '../commands/operations/change-user.operation';
import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DarkModeOperation } from '../commands/operations/dark-mode.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { OpenWatermarkPanelOperation } from '../commands/operations/open-watermark-panel.operation';
import { SaveSnapshotOptions } from '../commands/operations/save-snapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { UNIVER_WATERMARK_MENU } from './watermark.menu.controller';

export function LocaleMenuItemFactory(): IMenuSelectorItem {
    return {
        id: LocaleOperation.id,
        icon: 'VueI18nIcon',
        tooltip: 'i18n',
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: 'English',
                value: LocaleType.EN_US,
            },
            {
                label: 'Français',
                value: LocaleType.FR_FR,
            },
            {
                label: '简体中文',
                value: LocaleType.ZH_CN,
            },
            {
                label: 'Русский',
                value: LocaleType.RU_RU,
            },
            {
                label: '繁體中文',
                value: LocaleType.ZH_TW,
            },
            {
                label: 'Tiếng Việt',
                value: LocaleType.VI_VN,
            },
        ],
    };
}

export function DarkModeMenuItemFactory(): IMenuSelectorItem {
    return {
        id: DarkModeOperation.id,
        title: '🌓',
        tooltip: 'Dark Mode',
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: 'Light',
                value: 'light',
            },
            {
                label: 'Dark',
                value: 'dark',
            },
        ],
    };
}

export function ThemeMenuItemFactory(): IMenuSelectorItem {
    return {
        id: ThemeOperation.id,
        title: 'Theme',
        tooltip: 'Theme',
        type: MenuItemType.SELECTOR,
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
    };
}

export function NotificationMenuItemFactory(): IMenuSelectorItem {
    return {
        id: NotificationOperation.id,
        title: 'Notification',
        tooltip: 'Notification',
        type: MenuItemType.SELECTOR,
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
    };
}

export function DialogMenuItemFactory(): IMenuSelectorItem {
    return {
        id: DialogOperation.id,
        title: 'Dialog',
        tooltip: 'Dialog',
        type: MenuItemType.SELECTOR,
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
    };
}

export function ConfirmMenuItemFactory(): IMenuSelectorItem {
    return {
        id: ConfirmOperation.id,
        title: 'Confirm',
        tooltip: 'Confirm',
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: 'Open confirm',
                value: 'confirm',
            },
        ],
    };
}

export function MessageMenuItemFactory(): IMenuSelectorItem {
    return {
        id: MessageOperation.id,
        title: 'Message',
        tooltip: 'Message',
        type: MenuItemType.SELECTOR,
        selections: [
            {
                label: 'Open message',
                value: '',
            },
            {
                label: 'Open loading message',
                value: 'loading',
            },
        ],
    };
}

export function SidebarMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SidebarOperation.id,
        title: 'Sidebar',
        tooltip: 'Sidebar',
        type: MenuItemType.SELECTOR,
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
    };
}

export function SetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetEditable.id,
        title: 'Editable',
        tooltip: 'Editable',
        type: MenuItemType.SELECTOR,
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
    };
}

export function SaveSnapshotSetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SaveSnapshotOptions.id,
        type: MenuItemType.SELECTOR,
        title: 'Snapshot',
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
    };
}

export const UNIT_ITEM_MENU_ID = 'debugger.unit-menu-item';

export function UnitMenuItemFactory(): IMenuSelectorItem {
    return {
        id: UNIT_ITEM_MENU_ID,
        title: 'Dispose',
        tooltip: 'Lifecycle Related Commands',
        type: MenuItemType.SUBITEMS,
    };
}

export function DisposeUniverItemFactory(): IMenuButtonItem {
    return {
        id: DisposeUniverCommand.id,
        title: 'Dispose Univer',
        tooltip: 'Dispose the Univer instance',
        icon: 'DS',
        type: MenuItemType.BUTTON,
    };
}

export function DisposeCurrentUnitMenuItemFactory(): IMenuButtonItem {
    return {
        id: DisposeCurrentUnitCommand.id,
        title: 'Dispose Current Unit',
        tooltip: 'Dispose Current Unit',
        icon: 'DS',
        type: MenuItemType.BUTTON,
    };
}

export function CreateEmptySheetMenuItemFactory(): IMenuButtonItem {
    return {
        id: CreateEmptySheetCommand.id,
        title: 'Create Another Sheet',
        tooltip: 'Create Another Sheet',
        icon: 'CR',
        type: MenuItemType.BUTTON,
    };
}

export function LoadSheetSnapshotMenuItemFactory(): IMenuButtonItem {
    return {
        id: LoadSheetSnapshotCommand.id,
        title: 'Load Snapshot',
        tooltip: 'Load Snapshot',
        icon: 'CR',
        type: MenuItemType.BUTTON,
    };
}

export const FLOAT_DOM_ITEM_MENU_ID = 'debugger.float-dom-menu-item';

export function FloatDomMenuItemFactory(): IMenuSelectorItem {
    return {
        id: FLOAT_DOM_ITEM_MENU_ID,
        title: 'FloatDom',
        tooltip: 'Float Dom Commands',
        type: MenuItemType.SUBITEMS,
    };
}

export function CreateFloatDOMMenuItemFactory(): IMenuButtonItem {
    return {
        id: CreateFloatDomCommand.id,
        title: 'Create Float Dom',
        tooltip: 'Create Float Dom',
        icon: 'DS',
        type: MenuItemType.BUTTON,
    };
}

export function ShowCellContentMenuItemFactory(): IMenuButtonItem {
    return {
        id: ShowCellContentOperation.id,
        type: MenuItemType.BUTTON,
        title: 'Cell',
        icon: 'DS',
    };
}

export function ChangeUserMenuItemFactory(): IMenuSelectorItem {
    return {
        id: ChangeUserCommand.id,
        type: MenuItemType.SELECTOR,
        title: 'Change User',
        selections: [
            {
                label: 'Owner',
                value: UnitRole.Owner,
            },
            {
                label: 'Editor',
                value: UnitRole.Editor,
            },
            {
                label: 'Reader',
                value: UnitRole.Reader,
            },

        ],
    };
}

export function WatermarkMenuItemFactory(): IMenuButtonItem {
    return {
        id: OpenWatermarkPanelOperation.id,
        title: 'univer-watermark.title',
        tooltip: 'univer-watermark.title',
        icon: UNIVER_WATERMARK_MENU,
        type: MenuItemType.BUTTON,
    };
}
