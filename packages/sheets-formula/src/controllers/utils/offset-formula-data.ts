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

import type { ICommandInfo, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { Dimension, ObjectMatrix, RANGE_TYPE } from '@univerjs/core';
import type { IArrayFormulaRangeType } from '@univerjs/engine-formula';
import type {
    IDeleteRangeMoveLeftCommandParams,
    IDeleteRangeMoveUpCommandParams,
    IInsertColCommandParams,
    IInsertRowCommandParams,
    IMoveColsCommandParams,
    IMoveRangeCommandParams,
    IMoveRowsCommandParams,
    InsertRangeMoveDownCommandParams,
    InsertRangeMoveRightCommandParams,
    IRemoveRowColCommandParams,
    ISelectionWithStyle,
} from '@univerjs/sheets';
import {
    DeleteRangeMoveLeftCommand,
    DeleteRangeMoveUpCommand,
    handleDeleteRangeMutation,
    handleInsertRangeMutation,
    InsertColCommand,
    InsertRangeMoveDownCommand,
    InsertRangeMoveRightCommand,
    InsertRowCommand,
    MoveColsCommand,
    MoveRangeCommand,
    MoveRowsCommand,
    RemoveColCommand,
    RemoveRowCommand,
} from '@univerjs/sheets';

interface IFormulaDataGenerics<T> {
    [unitId: string]: Nullable<{ [sheetId: string]: IObjectMatrixPrimitiveType<T> }>;
}

export interface IRefRangeWithPosition {
    row: number;
    column: number;
    range: IRange;
}

export function offsetFormula<T>(
    formulaData: IFormulaDataGenerics<T>,
    command: ICommandInfo,
    unitId: string,
    sheetId: string,
    selections?: Readonly<Nullable<ISelectionWithStyle[]>>,
    formulaRangeData?: IFormulaDataGenerics<IRange>,
    refRanges?: IRefRangeWithPosition[]
): IFormulaDataGenerics<T> {
    const { id } = command;

    if (checkFormulaDataNull(formulaData, unitId, sheetId)) return formulaData;

    const formulaMatrix = new ObjectMatrix(formulaData[unitId]![sheetId]);
    const formulaRangeMatrix = formulaRangeData && new ObjectMatrix(formulaRangeData[unitId]![sheetId]);

    switch (id) {
        case MoveRangeCommand.id:
            handleMoveRange<T>(formulaMatrix, command as ICommandInfo<IMoveRangeCommandParams>, formulaRangeMatrix);
            break;
        case MoveRowsCommand.id:
            handleMoveRows<T>(formulaMatrix, command as ICommandInfo<IMoveRowsCommandParams>, selections);
            break;
        case MoveColsCommand.id:
            handleMoveCols<T>(formulaMatrix, command as ICommandInfo<IMoveColsCommandParams>, selections);
            break;
        case InsertRowCommand.id:
            handleInsertRow<T>(
                formulaMatrix,
                command as ICommandInfo<IInsertRowCommandParams>,
                formulaRangeMatrix,
                refRanges
            );
            break;
        case InsertColCommand.id:
            handleInsertCol<T>(
                formulaMatrix,
                command as ICommandInfo<IInsertColCommandParams>,
                formulaRangeMatrix,
                refRanges
            );
            break;
        case InsertRangeMoveRightCommand.id:
            handleInsertRangeMoveRight<T>(formulaMatrix, command as ICommandInfo<InsertRangeMoveRightCommandParams>);
            break;
        case InsertRangeMoveDownCommand.id:
            handleInsertRangeMoveDown<T>(formulaMatrix, command as ICommandInfo<InsertRangeMoveDownCommandParams>);
            break;
        case RemoveRowCommand.id:
            handleRemoveRow<T>(
                formulaMatrix,
                command as ICommandInfo<IRemoveRowColCommandParams>,
                formulaRangeMatrix,
                refRanges
            );
            break;
        case RemoveColCommand.id:
            handleRemoveCol<T>(
                formulaMatrix,
                command as ICommandInfo<IRemoveRowColCommandParams>,
                formulaRangeMatrix,
                refRanges
            );
            break;
        case DeleteRangeMoveUpCommand.id:
            handleDeleteRangeMoveUp<T>(formulaMatrix, command as ICommandInfo<IDeleteRangeMoveUpCommandParams>);
            break;
        case DeleteRangeMoveLeftCommand.id:
            handleDeleteRangeMoveLeft<T>(formulaMatrix, command as ICommandInfo<IDeleteRangeMoveLeftCommandParams>);
            break;
    }

    return formulaData;
}

function handleMoveRange<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IMoveRangeCommandParams>,
    formulaRangeMatrix?: ObjectMatrix<IRange>
) {
    const { params } = command;
    if (!params) return;

    const { fromRange, toRange } = params;

    moveRangeUpdateFormulaData(fromRange, toRange, formulaMatrix, formulaMatrix, formulaRangeMatrix);
}

function handleMoveRows<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IMoveRowsCommandParams>,
    selections?: Readonly<Nullable<ISelectionWithStyle[]>>
) {
    const { params } = command;
    if (!params) return;

    const {
        fromRange: { startRow: fromRow },
        toRange: { startRow: toRow },
    } = params;

    const filteredSelections = selections?.filter(
        (selection) =>
            selection.range.rangeType === RANGE_TYPE.ROW &&
            selection.range.startRow <= fromRow &&
            fromRow <= selection.range.endRow
    );

    if (filteredSelections?.length !== 1) return;

    const rangeToMove = filteredSelections[0].range;
    const fromRowNumber = rangeToMove.startRow;
    const count = rangeToMove.endRow - rangeToMove.startRow + 1;

    formulaMatrix.moveRows(fromRowNumber, count, toRow);
}

function handleMoveCols<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IMoveColsCommandParams>,
    selections?: Readonly<Nullable<ISelectionWithStyle[]>>
) {
    const { params } = command;
    if (!params) return;

    const {
        fromRange: { startColumn: fromCol },
        toRange: { startColumn: toCol },
    } = params;

    const filteredSelections = selections?.filter(
        (selection) =>
            selection.range.rangeType === RANGE_TYPE.COLUMN &&
            selection.range.startColumn <= fromCol &&
            fromCol <= selection.range.endColumn
    );

    if (filteredSelections?.length !== 1) return;

    const rangeToMove = filteredSelections[0].range;
    const fromColNumber = rangeToMove.startColumn;
    const count = rangeToMove.endColumn - rangeToMove.startColumn + 1;

    formulaMatrix.moveColumns(fromColNumber, count, toCol);
}

function handleInsertRow<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IInsertRowCommandParams>,
    formulaRangeMatrix?: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;

    if (formulaRangeMatrix) {
        removeFormulaArrayRow(range, formulaMatrix, formulaRangeMatrix, refRanges);
        return;
    }

    // Handle formula data
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;
    // Offset formula range
    handleInsertRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleInsertCol<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IInsertColCommandParams>,
    formulaRangeMatrix?: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;

    if (formulaRangeMatrix) {
        removeFormulaArrayColumn(range, formulaMatrix, formulaRangeMatrix, refRanges);
        return;
    }

    // Handle formula data
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;
    // Offset formula range
    handleInsertRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleInsertRangeMoveRight<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<InsertRangeMoveRightCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleInsertRangeMoveDown<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<InsertRangeMoveDownCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleRemoveRow<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IRemoveRowColCommandParams>,
    formulaRangeMatrix?: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;

    if (formulaRangeMatrix) {
        removeFormulaArrayRow(range, formulaMatrix, formulaRangeMatrix, refRanges);
        return;
    }

    // Handle formula data
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;
    // Offset formula range
    handleDeleteRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleRemoveCol<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IRemoveRowColCommandParams>,
    formulaRangeMatrix?: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;

    if (formulaRangeMatrix) {
        removeFormulaArrayColumn(range, formulaMatrix, formulaRangeMatrix, refRanges);
        return;
    }

    // Handle formula data
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;
    // Offset formula range
    handleDeleteRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

function handleDeleteRangeMoveUp<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IDeleteRangeMoveUpCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleDeleteRangeMoveLeft<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IDeleteRangeMoveLeftCommandParams>
) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.COLUMNS);
}

export function offsetArrayFormula(
    arrayFormulaRange: IArrayFormulaRangeType,
    command: ICommandInfo,
    unitId: string,
    sheetId: string
) {
    if (checkFormulaDataNull(arrayFormulaRange, unitId, sheetId)) return arrayFormulaRange;
    if (arrayFormulaRange[unitId]?.[sheetId] == null) {
        return arrayFormulaRange;
    }
    const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange[unitId]![sheetId]);
    arrayFormulaRangeMatrix.forValue((row, column, range) => {
        if (range == null) {
            return true;
        }
        const { startRow, startColumn, endRow, endColumn } = range;
        if (row === startRow && column === startColumn) {
            return true;
        }

        const rows = endRow - startRow;
        const columns = endColumn - startColumn;

        const newRange = {
            startRow: row,
            startColumn: column,
            endRow: row + rows,
            endColumn: column + columns,
        };

        arrayFormulaRangeMatrix.setValue(row, column, newRange);
    });

    return arrayFormulaRange;
}

export function checkFormulaDataNull<T>(formulaData: IFormulaDataGenerics<T>, unitId: string, sheetId: string) {
    if (formulaData == null || formulaData[unitId] == null || formulaData[unitId]?.[sheetId] == null) {
        return true;
    }

    return false;
}

export function removeFormulaData<T>(formulaData: IFormulaDataGenerics<T>, unitId: string, sheetId: string) {
    if (formulaData && formulaData[unitId] && formulaData[unitId]?.[sheetId]) {
        delete formulaData[unitId]![sheetId];
    }
}
export function removeValueFormulaArray<T>(formulaRange: IRange, formulaMatrix: ObjectMatrix<T>) {
    const { startRow, endRow, startColumn, endColumn } = formulaRange;
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startColumn; c <= endColumn; c++) {
            formulaMatrix.setValue(r, c, null as T);
        }
    }
}

export function inFormulaRange(row: number, column: number, formulaMatrix?: ObjectMatrix<IRange>) {
    if (!formulaMatrix) return false;

    let result = false;
    formulaMatrix.forValue((r, c, range) => {
        if (!range) return;

        const { startRow, endRow, startColumn, endColumn } = range;

        if (startRow <= row && row <= endRow && startColumn <= column && column <= endColumn) {
            result = true;
            return false;
        }
    });

    return result;
}

export function moveRangeUpdateFormulaData<T>(
    fromRange: IRange,
    toRange: IRange,
    fromArrayFormulaCellDataMatrix: ObjectMatrix<T>,
    toArrayFormulaCellDataMatrix: ObjectMatrix<T>,
    arrayFormulaRangeMatrix?: ObjectMatrix<IRange>
) {
    const {
        startRow: fromStartRow,
        endRow: fromEndRow,
        startColumn: fromStartColumn,
        endColumn: fromEndColumn,
    } = fromRange;

    const { startRow: toStartRow, endRow: toEndRow, startColumn: toStartColumn, endColumn: toEndColumn } = toRange;

    const cacheMatrix = new ObjectMatrix<T>();

    for (let r = fromStartRow; r <= fromEndRow; r++) {
        for (let c = fromStartColumn; c <= fromEndColumn; c++) {
            const cacheValue = fromArrayFormulaCellDataMatrix.getValue(r, c);

            // If the moved area has an array formula,
            // move the first cell, you need to clear the contents of the array formula.
            // move the no-first cell, do not change the original data, set the new area to null
            const formulaRange = arrayFormulaRangeMatrix && arrayFormulaRangeMatrix.getValue(r, c);
            if (formulaRange) {
                cacheMatrix.setValue(r - fromStartRow, c - fromStartColumn, cacheValue);
                removeValueFormulaArray(formulaRange, fromArrayFormulaCellDataMatrix);
                continue;
            } else if (inFormulaRange(r, c, arrayFormulaRangeMatrix)) {
                cacheMatrix.setValue(r - fromStartRow, c - fromStartColumn, null as T);
                continue;
            }

            cacheMatrix.setValue(r - fromStartRow, c - fromStartColumn, cacheValue);
            fromArrayFormulaCellDataMatrix.setValue(r, c, null as T);
        }
    }

    for (let r = toStartRow; r <= toEndRow; r++) {
        for (let c = toStartColumn; c <= toEndColumn; c++) {
            const cacheValue = cacheMatrix.getValue(r - toStartRow, c - toStartColumn);
            toArrayFormulaCellDataMatrix.setValue(r, c, cacheValue);
        }
    }
}

/**
 *  Handle arrayFormulaRange and arrayFormulaCellData. If removing rows affects the array formula, the array formula cell data needs to be cleared and will be regenerated during recalculation.
 * @param range
 * @param formulaMatrix
 * @param formulaRangeMatrix
 * @param refRanges
 */
export function removeFormulaArrayRow<T>(
    range: IRange,
    formulaMatrix: ObjectMatrix<T>,
    formulaRangeMatrix: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { endRow } = range;
    // 1. Above the first line of ArrayFormula
    formulaRangeMatrix.forValue((row, column, range) => {
        if (!range) return;

        const { startRow: formulaRangeStartRow } = range;
        if (endRow <= formulaRangeStartRow) {
            removeValueFormulaArray(range, formulaMatrix);
        }
    });

    // 2. Above the last line of refRanges
    refRanges?.forEach(({ row, column, range }) => {
        if (!range) return;

        const { endRow: refRangeEndRow } = range;
        if (endRow <= refRangeEndRow) {
            // The formula cell position corresponding to refRange
            const removeRange = formulaRangeMatrix?.getValue(row, column);
            removeRange && removeValueFormulaArray(removeRange, formulaMatrix);
        }
    });
}

/**
 * Handle arrayFormulaRange and arrayFormulaCellData. If removing columns affects the array formula, the array formula cell data needs to be cleared and will be regenerated during recalculation.
 * @param range
 * @param formulaRangeMatrix
 * @param refRanges
 */
export function removeFormulaArrayColumn<T>(
    range: IRange,
    formulaMatrix: ObjectMatrix<T>,
    formulaRangeMatrix: ObjectMatrix<IRange>,
    refRanges?: IRefRangeWithPosition[]
) {
    const { endColumn } = range;
    // 1. Left of the first column of ArrayFormula
    formulaRangeMatrix.forValue((row, column, range) => {
        if (!range) return;

        const { startColumn: formulaRangeStartColumn } = range;
        if (endColumn <= formulaRangeStartColumn) {
            removeValueFormulaArray(range, formulaMatrix);
        }
    });

    // 2. Left of the last column of refRanges
    refRanges?.forEach(({ row, column, range }) => {
        if (!range) return;

        const { endColumn: refRangeEndColumn } = range;
        if (endColumn <= refRangeEndColumn) {
            // The formula cell position corresponding to refRange
            const removeRange = formulaRangeMatrix?.getValue(row, column);
            removeRange && removeValueFormulaArray(removeRange, formulaMatrix);
        }
    });
}
