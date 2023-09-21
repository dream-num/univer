import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export const RenameSheetCommand: ICommand = {
    id: 'ui-sheet.command.rename-sheet',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor) =>
        // FIXME: direct rename sheetbar not calling SheetBarService
        true,
};
