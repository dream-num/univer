import type { IMenuButtonItem } from '@univerjs/ui';
import { MenuItemType, MenuPosition } from '@univerjs/ui';
import type { IAccessor } from '@wendellhu/redi';

import { UploadOperation } from '../commands/operations/upload.operation';

export function ImportMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UploadOperation.id,
        type: MenuItemType.BUTTON,
        title: 'importXlsx.import',
        tooltip: 'importXlsx.tooltip',
        positions: [MenuPosition.TOOLBAR_START],
        // TODO@Dushusir disabled$ status
    };
}
