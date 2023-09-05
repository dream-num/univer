import { IMenuButtonItem, MenuItemType, MenuPosition } from "@univerjs/base-ui";
import { IAccessor } from "@wendellhu/redi";

export function FindMenuItemFactory(accessor: IAccessor): IMenuButtonItem {

    return {
        // TODO@Dushusir find command trigger open modal
        id: 'FindCommand.id',
        type: MenuItemType.BUTTON,
        icon: 'SearchIcon',
        title: 'find.findLabel',
        tooltip: 'find.findLabel',
        positions: [MenuPosition.TOOLBAR]
        // TODO@Dushusir disabled$ status
    };
}
