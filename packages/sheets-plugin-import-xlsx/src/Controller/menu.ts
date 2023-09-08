import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { UploadOperation } from '../commands/operations/upload.operation';

export function ImportMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UploadOperation.id,
        type: MenuItemType.BUTTON,
        title: 'importXlsx.import',
        tooltip: 'importXlsx.tooltip',
        positions: [MenuPosition.TOOLBAR],
        // TODO@Dushusir disabled$ status
    };
}
