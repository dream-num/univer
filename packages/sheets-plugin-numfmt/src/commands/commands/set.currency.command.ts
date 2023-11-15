import { SelectionManagerService } from '@univerjs/base-sheets';
import { CommandType, ICommand, ICommandService, Range } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { CURRENCYFORMAT } from '../../base/const/FORMATDETAIL';
import { SetNumfmtCommand, SetNumfmtCommandParams } from './set.numfmt.command';

export const SetCurrencyOperator: ICommand = {
    id: 'sheet.command.numfmt.set.currency.operator',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const selections = selectionManagerService.getSelections();
        if (!selections || !selections.length) {
            return false;
        }
        const values: SetNumfmtCommandParams['values'] = [];

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
