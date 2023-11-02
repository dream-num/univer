import { IMenuSelectorItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { LocaleType } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/design';
import { IAccessor } from '@wendellhu/redi';

import { DialogOperation } from '../commands/operations/dialog.operation';
import { LocaleOperation } from '../commands/operations/locale.operation';
import { NotificationOperation } from '../commands/operations/notification.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';

export function LocaleMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: LocaleOperation.id,
        title: 'debugger.locale.title',
        tooltip: 'debugger.locale.tooltip',
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
        title: 'debugger.theme.title',
        tooltip: 'debugger.theme.tooltip',
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
        title: 'debugger.uiComponent.title',
        tooltip: 'debugger.uiComponent.tooltip',
        type: MenuItemType.SELECTOR,
        positions: [MenuPosition.TOOLBAR_OTHERS],
        selections: [
            {
                label: 'Dialog Success',
                value: 'Dialog Success random string to test Dialog Success random string to test Dialog Success random string to test Dialog Success random string to test Dialog Success random string to test',
            },
            {
                label: 'Dialog Info',
                value: 'Dialog Info',
            },
            {
                label: 'Dialog Warning',
                value: 'Dialog Warning',
            },
            {
                label: 'Dialog Error',
                value: 'Dialog Error',
            },
        ],
    };
}

export function DialogMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: DialogOperation.id,
        title: 'debugger.uiComponent.title',
        tooltip: 'debugger.uiComponent.tooltip',
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
