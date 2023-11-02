import { SetInlineFormatBoldCommand } from '@univerjs/base-docs';
import { SetBoldCommand } from '@univerjs/base-sheets';
import { CommandType, FOCUSING_EDITOR, ICommand, ICommandService, IContextService } from '@univerjs/core';

/**
 * It is used to set the bold style of selections or one cell, need to distinguish between
 *  **selection state** and **edit state**. If you are in the selective state,
 *  you need to set the style on the cell and the style on the rich text(p textRuns) at the same time,
 *  and if it is only in edit state, then you only need to set the style of the rich text(p textRuns)
 */
export const SetRangeBoldCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-range-bold',
    handler: async (accessor) => {
        console.log('SetRangeBoldCommand');
        const contextService = accessor.get(IContextService);
        const isCellEditorFocus = contextService.getContextValue(FOCUSING_EDITOR);

        console.log(isCellEditorFocus);

        if (isCellEditorFocus) {
            return accessor.get(ICommandService).executeCommand(SetInlineFormatBoldCommand.id);
        }

        return accessor.get(ICommandService).executeCommand(SetBoldCommand.id);
    },
};
