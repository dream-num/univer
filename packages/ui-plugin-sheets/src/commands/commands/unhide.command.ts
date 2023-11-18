import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISheetBarService } from '../../services/sheet-bar/sheet-bar.service';

export const ShowMenuListCommand: ICommand = {
    id: 'ui-sheet.command.show-menu-list',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sheetBarService = accessor.get(ISheetBarService);
        sheetBarService.triggerSheetBarMenu();

        return true;
    },
};
