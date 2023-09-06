import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SheetBarService } from '../services/sheet-bar.service';

export const ShowMenuListCommand: ICommand = {
    id: 'ui-sheet.command.show-menu-list',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sheetBarService = accessor.get(SheetBarService);
        debugger;
        sheetBarService.showMenuList(true);
        return true;
    },
};
