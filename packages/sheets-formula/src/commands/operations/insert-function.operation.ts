import type { ICellData, ICommand, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import {
    CellValueType,
    CommandType,
    getCellValueType,
    ICommandService,
    IUniverInstanceService,
    serializeRange,
} from '@univerjs/core';
import { SelectionManagerService } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

import { IFormulaInputService } from '../../services/formula-input.service';
import type { IInsertFunction } from '../commands/insert-function.command';
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
        const formulaInputService = accessor.get(IFormulaInputService);
        const currentSelections = selectionManagerService.getSelections();
        if (!currentSelections || !currentSelections.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const cellMatrix = univerInstanceService.getCurrentUniverSheetInstance().getActiveSheet().getCellMatrix();

        const { value } = params;
        const commandService = accessor.get(ICommandService);

        // TODO@Dushusir: no match refRange situation, enter edit mode

        // In each range (whether it is an entire row or column or multiple rows and columns),
        // 1. First get the judgment result of the primary position, and then set the formula id of other positions;
        // 2. If there is no primary range, just judge the upper left corner cell.
        const list: IInsertFunction[] = [];
        currentSelections.some((selection) => {
            const { range, primary } = selection;

            const row = primary?.actualRow ?? range.startRow;
            const column = primary?.actualColumn ?? range.startColumn;

            const refRange = findRefRange(cellMatrix, row, column);

            if (!refRange) {
                formulaInputService.inputFormula(value);
                return true;
            }

            const rangeString = serializeRange(refRange);
            const formulaString = `=${value}(${rangeString})`;

            list.push({
                range,
                primary: {
                    row,
                    column,
                },
                formula: formulaString,
            });

            return false;
        });

        if (list) return false;

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
