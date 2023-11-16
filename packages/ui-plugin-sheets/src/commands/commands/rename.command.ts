import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISheetBarService } from '../../services/sheetbar/sheetbar.service';

interface IRenameCommandParams {
    worksheetId: string;
}

export const RenameSheetOperation: ICommand = {
    id: 'sheet.command.rename-sheet',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params?: IRenameCommandParams) => {
        const sheetBarService = accessor.get(ISheetBarService);
        if (params) {
            sheetBarService.setRenameId(params.worksheetId);
        }
        return true;
    },
};
