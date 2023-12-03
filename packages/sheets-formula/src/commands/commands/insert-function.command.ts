import { ISetRangeValuesCommandParams, SetRangeValuesCommand } from '@univerjs/sheets';
import { CommandType, ICellData, ICommand, ICommandService, IRange, ObjectMatrix, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IInsertFunction {
    /**
     * The range into which the function is to be inserted
     */
    range: IRange;

    /**
     * Where there is a function id, other locations reference this function id
     */
    primary: {
        row: number;
        column: number;
    };

    /**
     * Function name
     */
    formula: string;
}

export interface IInsertFunctionCommandParams {
    list: IInsertFunction[];
}

export const InsertFunctionCommand: ICommand = {
    id: 'formula-ui.command.insert-function',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IInsertFunctionCommandParams) => {
        const { list } = params;
        const commandService = accessor.get(ICommandService);
        const cellMatrix = new ObjectMatrix<ICellData>();

        list.forEach((item) => {
            const { range, primary, formula } = item;
            const { row, column } = primary;
            const formulaId = Tools.generateRandomId(6);
            cellMatrix.setValue(row, column, {
                f: formula,
                si: formulaId,
            });

            const { startRow, startColumn, endRow, endColumn } = range;
            for (let i = startRow; i <= endRow; i++) {
                for (let j = startColumn; j <= endColumn; j++) {
                    if (i !== row || j !== column) {
                        cellMatrix.setValue(i, j, {
                            si: formulaId,
                        });
                    }
                }
            }
        });

        const setRangeValuesParams: ISetRangeValuesCommandParams = {
            value: cellMatrix.getData(),
        };

        return commandService.executeCommand(SetRangeValuesCommand.id, setRangeValuesParams);
    },
};
