import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { UploadCommand } from '../commands/upload.command';

export function ImportImageMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UploadCommand.id,
        type: MenuItemType.BUTTON,
        icon: 'ImageIcon',
        title: 'Image', // FIXME use translation
        tooltip: 'Import Image', // FIXME use translation
        positions: [MenuPosition.TOOLBAR],
        // TODO@Dushusir disabled$ status
    };
}
