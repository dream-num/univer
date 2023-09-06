import { IMenuButtonItem, MenuItemType, MenuPosition } from '@univerjs/base-ui';
import { IAccessor } from '@wendellhu/redi';

import { UploadCommand } from '../commands/upload.command';

export function ImportMenuItemFactory(accessor: IAccessor): IMenuButtonItem {
    return {
        id: UploadCommand.id,
        type: MenuItemType.BUTTON,
        title: 'importXlsx.import',
        tooltip: 'importXlsx.tooltip',
        positions: [MenuPosition.TOOLBAR],
        // TODO@Dushusir disabled$ status
    };
}
