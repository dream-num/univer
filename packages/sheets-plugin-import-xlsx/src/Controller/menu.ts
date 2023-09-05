import { IMenuButtonItem, MenuItemType, MenuPosition } from "@univerjs/base-ui";
import { IAccessor } from "@wendellhu/redi";

export function ImportMenuItemFactory(accessor: IAccessor): IMenuButtonItem {

    return {
        // TODO@Dushusir import command trigger open file select
        id: 'ImportCommand.id',
        type: MenuItemType.BUTTON,
        title: 'importXlsx.import',
        tooltip: 'importXlsx.tooltip',
        positions: [MenuPosition.TOOLBAR]
        // TODO@Dushusir disabled$ status
    };
}
