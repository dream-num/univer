import { CommandType, ICellData, ICommand, ICommandService, IRange } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SetSelectionsOperation } from '../operations/selection.operation';
import { AddWorksheetMergeCommand } from './add-worksheet-merge.command';
import { SetRangeValuesCommand } from './set-range-values.command';

interface IAutoFillCommandParams {
    worksheetId: string;
    workbookId: string;
    applyRange: IRange;
    selectionRange: IRange;
    applyDatas: ICellData[][];
    applyMergeRanges?: IRange[];
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IAutoFillCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const { applyRange, selectionRange, applyDatas, workbookId, worksheetId, applyMergeRanges } = params || {};
        if (!applyRange || !applyDatas || !selectionRange) {
            return false;
        }
        commandService.executeCommand(SetRangeValuesCommand.id, {
            ...params,
            range: applyRange,
            value: applyDatas,
        });

        if (applyMergeRanges) {
            commandService.executeCommand(AddWorksheetMergeCommand.id, {
                selections: applyMergeRanges,
                workbookId,
                worksheetId,
            });
        }

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
