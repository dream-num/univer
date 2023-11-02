import { CommandType, ICellData, ICommand, ICommandService, IRange } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SetSelectionsOperation } from '../operations/selection.operation';
import { SetRangeValuesCommand } from './set-range-values.command';

interface IAutoFillCommandParams {
    worksheetId: string;
    workbookId: string;
    applyRange: IRange;
    selectionRange: IRange;
    applyDatas: ICellData[][];
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IAutoFillCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { applyRange, selectionRange, applyDatas, workbookId, worksheetId } = params || {};
        if (!applyRange || !applyDatas || !selectionRange) {
            return false;
        }
        commandService.executeCommand(SetRangeValuesCommand.id, {
            ...params,
            range: applyRange,
            value: applyDatas,
        });
        commandService.executeCommand(SetSelectionsOperation.id, {
            selections: [
                {
                    primary: {
                        startRow: selectionRange.startRow,
                        endRow: selectionRange.endRow,
                        startColumn: selectionRange.startColumn,
                        endColumn: selectionRange.endColumn,
                    },
                    range: {
                        startRow: selectionRange.startRow,
                        endRow: selectionRange.endRow,
                        startColumn: selectionRange.startColumn,
                        endColumn: selectionRange.endColumn,
                    },
                },
            ],
            workbookId,
            worksheetId,
        });
        return true;
    },
};
