import { DisplayTypes, IMenuSelectorItem, MenuItemType, MenuPosition, SelectTypes } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { I18nOperation } from '../commands/operations/i18n.operation';

export function DebuggerMenuItemFactory(accessor: IAccessor): IMenuSelectorItem {
    return {
        id: I18nOperation.id,
        icon: 'ShortcutIcon',
        title: 'debugger.locale.title',
        tooltip: 'debugger.locale.tooltip',
        display: DisplayTypes.ICON,
        type: MenuItemType.SELECTOR,
        selectType: SelectTypes.NEO,
        positions: [MenuPosition.TOOLBAR],
        selections: [
            {
                label: 'English',
                value: 'en',
            },
            {
                label: '简体中文',
                value: 'zh',
            },
        ],
    };
}
