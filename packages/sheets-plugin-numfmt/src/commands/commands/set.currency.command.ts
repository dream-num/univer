import { SelectionManagerService } from '@univerjs/base-sheets';
import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, Range } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { CURRENCYFORMAT } from '../../base/const/FORMATDETAIL';
import type { ISetNumfmtCommandParams } from './set.numfmt.command';
import { SetNumfmtCommand } from './set.numfmt.command';

export const SetCurrencyCommand: ICommand = {
    id: 'sheet.command.numfmt.set.currency',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const selections = selectionManagerService.getSelections();
        if (!selections || !selections.length) {
            return false;
        }
        const values: ISetNumfmtCommandParams['values'] = [];

        const suffix = CURRENCYFORMAT[0].suffix('¥');

        selections.forEach((selection) => {
            Range.foreach(selection.range, (row, col) => {
                values.push({ row, col, pattern: suffix, type: 'currency' });
            });
        });
        const result = await commandService.executeCommand(SetNumfmtCommand.id, { values });
        return result;
    },
};
