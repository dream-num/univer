import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

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
