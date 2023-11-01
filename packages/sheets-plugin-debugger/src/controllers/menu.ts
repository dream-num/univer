import { IMenuSelectorItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { LocaleType } from '@univerjs/core';
import { defaultTheme, greenTheme } from '@univerjs/design';
import { IAccessor } from '@wendellhu/redi';

import { LocaleOperation } from '../commands/operations/locale.operation';
import { ThemeOperation } from '../commands/operations/theme.operation';
import { UIComponentOperation } from '../commands/operations/ui-component.operation';

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
export function UIComponentMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: UIComponentOperation.id,
        title: 'debugger.uiComponent.title',
        tooltip: 'debugger.uiComponent.tooltip',
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
