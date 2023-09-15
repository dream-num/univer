import { CommandType, ICommand } from '@univerjs/core';

import { ICellEditorService } from './cell-editor.service';

export const QuitCellEditorCommand: ICommand = {
    id: 'sheet.command.quit-cell-editor',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const cellEditorService = accessor.get(ICellEditorService);
        cellEditorService.quitEditing();
    },
};
