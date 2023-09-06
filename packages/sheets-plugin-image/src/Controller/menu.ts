import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

export function ImportImageMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        // TODO@Dushusir trigger image file select
        id: 'ImportImageCommand.id',
        type: MenuItemType.BUTTON,
        icon: 'ImageIcon',
        title: 'Image', // FIXME use translation
        tooltip: 'Import Image', // FIXME use translation
        positions: [MenuPosition.TOOLBAR],
        // TODO@Dushusir disabled$ status
    };
}
