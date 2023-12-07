import { LocaleType } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/design';
import type { IMenuSelectorItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { ConfirmOperation } from '../commands/operations/confirm.operation';
import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { MessageOperation } from '../commands/operations/message.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { SaveSnapshotOptions } from '../commands/operations/saveSnapshot.operations';
import { SetEditable } from '../commands/operations/set.editable.operation';
import { SidebarOperation } from '../commands/operations/sidebar.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';

export function LocaleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: LocaleOperation.id,
        title: 'debugger.locale',
        tooltip: 'debugger.locale',
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
        ],
    };
}

export function ThemeMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: ThemeOperation.id,
        title: 'debugger.theme',
        tooltip: 'debugger.theme',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'green',
                value: greenTheme,
            },
            {
                label: 'default',
                value: defaultTheme,
            },
        ],
    };
}

export function NotificationMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: NotificationOperation.id,
        title: 'debugger.notification',
        tooltip: 'debugger.notification',
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
    };
}

export function DialogMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: DialogOperation.id,
        title: 'debugger.dialog',
        tooltip: 'debugger.dialog',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open dialog',
                value: 'dialog',
            },
        ],
    };
}

export function ConfirmMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: ConfirmOperation.id,
        title: 'debugger.confirm',
        tooltip: 'debugger.confirm',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open confirm',
                value: 'confirm',
            },
        ],
    };
}

export function MessageMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: MessageOperation.id,
        title: 'debugger.message',
        tooltip: 'debugger.message',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Open message',
                value: '',
            },
        ],
    };
}

export function SidebarMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SidebarOperation.id,
        title: 'debugger.sidebar',
        tooltip: 'debugger.sidebar',
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
    };
}

export function SetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SetEditable.id,
        title: 'debugger.editable',
        tooltip: 'debugger.editable',
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
    };
}

export function SaveSnapshotSetEditableMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: SaveSnapshotOptions.id,
        type: MenuItemType.SELECTOR,
        title: 'debugger.snapshot',
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
    };
}
