import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { UploadOperation } from '../commands/operations/upload.operation';

export function ImportImageMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UploadOperation.id,
        type: MenuItemType.BUTTON,
        icon: 'ImageIcon',
        title: 'Image', // FIXME use translation
        tooltip: 'Import Image', // FIXME use translation
        positions: [MenuPosition.TOOLBAR_START],
        // TODO@Dushusir disabled$ status
    };
}
