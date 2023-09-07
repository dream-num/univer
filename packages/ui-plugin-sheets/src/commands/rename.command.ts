import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SheetBarService } from '../services/sheet-bar.service';

export const RenameSheetCommand: ICommand = {
    id: 'ui-sheet.command.rename-sheet',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) => {
        const sheetBarService = accessor.get(SheetBarService);
        const sheetBarController = sheetBarService.getSheetBarUIController();
        const sheetBar = sheetBarController.getSheetBar();
        sheetBar.reNameSheet(sheetBarController.getDataId());
        return true;
    },
};
