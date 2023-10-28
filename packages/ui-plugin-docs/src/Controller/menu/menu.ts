import { BreakLineCommand, DeleteLeftCommand } from '@univerjs/base-docs';
import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

// TODO@Dushusir: use for test, change id later
export function BoldMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: DeleteLeftCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'BoldIcon',
        title: 'Set bold',
        tooltip: 'toolbar.bold',
        positions: [MenuPosition.TOOLBAR_START],
    };
}

export function ItalicMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: BreakLineCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ItalicIcon',
        title: 'Set italic',
        tooltip: 'toolbar.italic',
        positions: [MenuPosition.TOOLBAR_START],
    };
}
