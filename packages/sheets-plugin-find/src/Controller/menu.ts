import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { ShowModalCommand } from '../commands/show-modal.command';

export function FindMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowModalCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'SearchIcon',
        title: 'find.findLabel',
        tooltip: 'find.findLabel',
        positions: [MenuPosition.TOOLBAR],
        // TODO@Dushusir disabled$ status
    };
}
