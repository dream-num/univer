import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { ShowModalOperation } from '../commands/operations/show-modal.operation';

export function FindMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: ShowModalOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'SearchIcon',
        title: 'find.findLabel',
        tooltip: 'find.findLabel',
        positions: [MenuPosition.TOOLBAR_START],
        // TODO@Dushusir disabled$ status
    };
}
