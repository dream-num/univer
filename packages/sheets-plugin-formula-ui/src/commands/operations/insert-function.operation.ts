import { SelectionManagerService } from '@univerjs/base-sheets';
import {
    CellValueType,
    CommandType,
    getCellValueType,
    ICellData,
    ICommand,
    ICommandService,
    IRange,
    IUniverInstanceService,
    Nullable,
    ObjectMatrix,
    serializeRange,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { InsertFunctionCommand } from '../commands/insert-function.command';

export interface IInsertFunctionOperationParams {
    /**
     * function name
     */
    value: string;
}

export const InsertFunctionOperation: ICommand = {
    id: 'formula-ui.operation.insert-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IInsertFunctionOperationParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const currentSelections = selectionManagerService.getSelections();
        if (!currentSelections || !currentSelections.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const cellMatrix = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getCellMatrix();

        // Select a single range to insert a formula:
        // 1. The entire row or column, first get the judgment result of the primary position, and then set the formula ID of other positions in sequence;
        // 2. For multiple rows and multiple columns, only get the judgment result of the primary position, and enter the edit mode
        if (currentSelections.length === 1) {
            const { startRow, endRow, startColumn, endColumn } = currentSelections[0].range;
            if (startRow !== endRow && startColumn !== endColumn) {
                // TODO@Dushusir: Enter the editing mode
                return false;
            }
        }

        const { value } = params;

        const commandService = accessor.get(ICommandService);

        // In each range (whether it is an entire row or column or multiple rows and columns),
        // 1. First get the judgment result of the primary position, and then set the formula id of other positions;
        // 2. If there is no primary range, just judge the upper left corner cell.
        const list = currentSelections.map((selection) => {
            const { range, primary } = selection;

            const row = primary?.actualRow ?? range.startRow;
            const column = primary?.actualColumn ?? range.startColumn;

            const refRange = findRefRange(cellMatrix, row, column);
            const rangeString = refRange ? serializeRange(refRange) : '';
            const formulaString = `=${value}(${rangeString})`;

            return {
                range,
                primary: {
                    row,
                    column,
                },
                formula: formulaString,
            };
        });

        return commandService.executeCommand(InsertFunctionCommand.id, {
            list,
        });
    },
};

/**
 * 1. Starting from the first position on the left or top and ending with a continuous number (the first non-blank cell is allowed to be text)
 * 2. Match the upper part first, then the left part. If not, insert a function with empty parameters.
 */
function findRefRange(cellMatrix: ObjectMatrix<ICellData>, row: number, column: number): Nullable<IRange> {
    const startRow = findStartRow(cellMatrix, row, column);
    if (startRow !== row) {
        return {
            startRow,
            endRow: row - 1,
            startColumn: column,
            endColumn: column,
        };
    }

    const startColumn = findStartColumn(cellMatrix, row, column);
    if (startColumn !== column) {
        return {
            startRow: row,
            endRow: row,
            startColumn,
            endColumn: column - 1,
        };
    }
    return null;
}

function findStartRow(cellMatrix: ObjectMatrix<ICellData>, row: number, column: number) {
    let isFirstNumber = false;

    if (row === 0) return row;

    for (let r = row - 1; r >= 0; r--) {
        const cell = cellMatrix.getValue(r, column);

        if (!cell) continue;

        if (getCellValueType(cell) === CellValueType.NUMBER && !isFirstNumber) {
            if (r === 0) return 0;
            isFirstNumber = true;
        } else if (isFirstNumber && getCellValueType(cell) !== CellValueType.NUMBER) {
            return r - 1;
        } else if (isFirstNumber && r === 0) {
            return 0;
        }
    }

    return row;
}

function findStartColumn(cellMatrix: ObjectMatrix<ICellData>, row: number, column: number) {
    let isFirstNumber = false;

    if (column === 0) return column;

    for (let c = column - 1; c >= 0; c--) {
        const cell = cellMatrix.getValue(row, c);
        if (!cell) continue;

        if (getCellValueType(cell) === CellValueType.NUMBER && !isFirstNumber) {
            if (c === 0) return 0;
            isFirstNumber = true;
        } else if (isFirstNumber && getCellValueType(cell) !== CellValueType.NUMBER) {
            return c - 1;
        } else if (isFirstNumber && c === 0) {
            return 0;
        }
    }

    return column;
}
