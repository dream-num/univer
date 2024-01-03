/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICellData, ICommand, IRange, Nullable, ObjectMatrix } from '@univerjs/core';
import {
    CellValueType,
    CommandType,
    getCellValueType,
    ICommandService,
    IUniverInstanceService,
    Rectangle,
    serializeRange,
    Tools,
} from '@univerjs/core';
import {
    getCellAtRowCol,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
    SetSelectionsOperation,
} from '@univerjs/sheets';
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

        const workbook = accessor.get(IUniverInstanceService).getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const unitId = workbook.getUnitId();
        const sheetId = worksheet.getSheetId();
        const cellMatrix = worksheet.getCellMatrix();

        const { value } = params;
        const commandService = accessor.get(ICommandService);

        // No match refRange situation, enter edit mode
        // In each range, first take the judgment result of the primary position (if there is no primary, take the upper left corner),
        // If there is a range, set the formula range directly, and then set the formula id of other positions.
        // If the range cannot be found, enter the edit mode.
        const list: IInsertFunction[] = [];
        let editRange: IRange | null = null;
        let editRow = 0;
        let editColumn = 0;

        currentSelections.some((selection) => {
            const { range, primary } = selection;

            const row = primary?.actualRow ?? range.startRow;
            const column = primary?.actualColumn ?? range.startColumn;

            const refRange = findRefRange(cellMatrix, row, column);

            if (!refRange) {
                editRange = range;
                editRow = row;
                editColumn = column;
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

        if (editRange) {
            // set current position
            const destRange = getCellAtRowCol(editRow, editColumn, worksheet);

            const resultRange = {
                range: Rectangle.clone(editRange),
                primary: {
                    startRow: destRange.startRow,
                    startColumn: destRange.startColumn,
                    endRow: destRange.endRow,
                    endColumn: destRange.endColumn,
                    actualRow: editRow,
                    actualColumn: editColumn,
                    isMerged: destRange.isMerged,
                    isMergedMainCell: destRange.startRow === editRow && destRange.startColumn === editColumn,
                },
            };

            const setSelectionParams = {
                unitId,
                sheetId,
                pluginName: NORMAL_SELECTION_PLUGIN_NAME,
                selections: [resultRange],
            };
            await commandService.executeCommand(SetSelectionsOperation.id, setSelectionParams);

            // TODO@DR-Univer: Maybe setTimeout can be removed
            setTimeout(() => {
                // edit cell
                formulaInputService.inputFormula(`=${value}(`);
            }, 0);
        }

        if (list.length === 0) return false;

        return commandService.executeCommand(InsertFunctionCommand.id, {
            list,
        });
    },
};

/**
 * 1. Starting from the first position on the left or top and ending with a continuous number (the first non-blank cell is allowed to be text)
 * 2. Match the upper part first, then the left part. If not, insert a function with empty parameters.
 */
function findRefRange(cellMatrix: ObjectMatrix<Nullable<ICellData>>, row: number, column: number): Nullable<IRange> {
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

function findStartRow(cellMatrix: ObjectMatrix<Nullable<ICellData>>, row: number, column: number) {
    let isFirstNumber = false;

    if (row === 0) return row;

    for (let r = row - 1; r >= 0; r--) {
        const cell = cellMatrix.getValue(r, column);

        if (isNumberCell(cell) && !isFirstNumber) {
            if (r === 0) return 0;
            isFirstNumber = true;
        } else if (isFirstNumber && !isNumberCell(cell)) {
            return r + 1;
        } else if (isFirstNumber && r === 0) {
            return 0;
        }
    }

    return row;
}

function findStartColumn(cellMatrix: ObjectMatrix<Nullable<ICellData>>, row: number, column: number) {
    let isFirstNumber = false;

    if (column === 0) return column;

    for (let c = column - 1; c >= 0; c--) {
        const cell = cellMatrix.getValue(row, c);

        if (isNumberCell(cell) && !isFirstNumber) {
            if (c === 0) return 0;
            isFirstNumber = true;
        } else if (isFirstNumber && !isNumberCell(cell)) {
            return c + 1;
        } else if (isFirstNumber && c === 0) {
            return 0;
        }
    }

    return column;
}

export function isNumberCell(cell: Nullable<ICellData>) {
    return (
        cell &&
        (cell.t === CellValueType.NUMBER ||
            getCellValueType(cell) === CellValueType.NUMBER ||
            Tools.isStringNumber(cell.v))
    );
}
