import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';

export const ShowMenuListCommand: ICommand = {
    id: 'ui-sheet.command.show-menu-list',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sheetBarService = accessor.get(ISheetBarService);
        sheetBarService.triggerSheetBarMenu();

        return true;
    },
};
