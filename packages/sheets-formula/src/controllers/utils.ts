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

import type { ICommandInfo, IObjectMatrixPrimitiveType, Nullable } from '@univerjs/core';
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

export function offsetFormula<T>(
    formulaData: IFormulaDataGenerics<T>,
    command: ICommandInfo,
    unitId: string,
    sheetId: string,
    selections?: Readonly<Nullable<ISelectionWithStyle[]>>
): IFormulaDataGenerics<T> {
    const { id } = command;

    if (checkFormulaDataNull(formulaData, unitId, sheetId)) return formulaData;

    const formulaMatrix = new ObjectMatrix(formulaData[unitId]?.[sheetId]);

    switch (id) {
        case MoveRangeCommand.id:
            handleMoveRange<T>(formulaMatrix, command as ICommandInfo<IMoveRangeCommandParams>);
            break;
        case MoveRowsCommand.id:
            handleMoveRows<T>(formulaMatrix, command as ICommandInfo<IMoveRowsCommandParams>, selections);
            break;
        case MoveColsCommand.id:
            handleMoveCols<T>(formulaMatrix, command as ICommandInfo<IMoveColsCommandParams>, selections);
            break;
        case InsertRowCommand.id:
            handleInsertRow<T>(formulaMatrix, command as ICommandInfo<IInsertRowCommandParams>);
            break;
        case InsertColCommand.id:
            handleInsertCol<T>(formulaMatrix, command as ICommandInfo<IInsertColCommandParams>);
            break;
        case InsertRangeMoveRightCommand.id:
            handleInsertRangeMoveRight<T>(formulaMatrix, command as ICommandInfo<InsertRangeMoveRightCommandParams>);
            break;
        case InsertRangeMoveDownCommand.id:
            handleInsertRangeMoveDown<T>(formulaMatrix, command as ICommandInfo<InsertRangeMoveDownCommandParams>);
            break;
        case RemoveRowCommand.id:
            handleRemoveRow<T>(formulaMatrix, command as ICommandInfo<IRemoveRowColCommandParams>);
            break;
        case RemoveColCommand.id:
            handleRemoveCol<T>(formulaMatrix, command as ICommandInfo<IRemoveRowColCommandParams>);
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

function handleMoveRange<T>(formulaMatrix: ObjectMatrix<T>, command: ICommandInfo<IMoveRangeCommandParams>) {
    const { params } = command;
    if (!params) return;

    const { fromRange, toRange } = params;
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
            const cacheValue = formulaMatrix.getValue(r, c);
            cacheMatrix.setValue(r - fromStartRow, c - fromStartColumn, cacheValue);

            formulaMatrix.setValue(r, c, null as T);
        }
    }

    for (let r = toStartRow; r <= toEndRow; r++) {
        for (let c = toStartColumn; c <= toEndColumn; c++) {
            const cacheValue = cacheMatrix.getValue(r - toStartRow, c - toStartColumn);
            formulaMatrix.setValue(r, c, cacheValue);
        }
    }
}

function handleMoveRows<T>(
    formulaMatrix: ObjectMatrix<T>,
    command: ICommandInfo<IMoveRowsCommandParams>,
    selections?: Readonly<Nullable<ISelectionWithStyle[]>>
) {
    const { params } = command;
    if (!params) return;

    const { fromRow, toRow } = params;

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

    const { fromCol, toCol } = params;

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

function handleInsertRow<T>(formulaMatrix: ObjectMatrix<T>, command: ICommandInfo<IInsertRowCommandParams>) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleInsertRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleInsertCol<T>(formulaMatrix: ObjectMatrix<T>, command: ICommandInfo<IInsertColCommandParams>) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

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

function handleRemoveRow<T>(formulaMatrix: ObjectMatrix<T>, command: ICommandInfo<IRemoveRowColCommandParams>) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

    handleDeleteRangeMutation(formulaMatrix, range, lastEndRow, lastEndColumn, Dimension.ROWS);
}

function handleRemoveCol<T>(formulaMatrix: ObjectMatrix<T>, command: ICommandInfo<IRemoveRowColCommandParams>) {
    const { params } = command;
    if (!params) return;

    const { range } = params;
    const lastEndRow = formulaMatrix.getLength() - 1;
    const lastEndColumn = formulaMatrix.getRange().endColumn;

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

export function offsetArrayFormula(arrayFormulaRange: IArrayFormulaRangeType, unitId: string, sheetId: string) {
    if (checkFormulaDataNull(arrayFormulaRange, unitId, sheetId)) return arrayFormulaRange;

    const arrayFormulaRangeMatrix = new ObjectMatrix(arrayFormulaRange[unitId]?.[sheetId]);
    arrayFormulaRangeMatrix.forValue((row, column, range) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        if (row === startRow && column === startColumn) {
            return;
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

function checkFormulaDataNull<T>(formulaData: IFormulaDataGenerics<T>, unitId: string, sheetId: string) {
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
