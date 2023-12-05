import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService } from '@univerjs/core';
import { SheetPasteCommand } from '@univerjs/sheets-ui';

export const SPECIAL_PASTE_FORMULA = 'special-paste-formula';

export const SheetOnlyPasteFormulaCommand: ICommand = {
    id: 'sheet.command.paste-formula',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const commandService = accessor.get(ICommandService);
        return commandService.executeCommand(SheetPasteCommand.id, {
            value: SPECIAL_PASTE_FORMULA,
        });
    },
};
