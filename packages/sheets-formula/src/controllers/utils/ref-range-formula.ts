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

import type { ICellData, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { cellToRange, Direction, isFormulaId, isFormulaString, ObjectMatrix } from '@univerjs/core';
import type { IExchangePosition, IFormulaData, IFormulaDataItem } from '@univerjs/engine-formula';
import { EffectRefRangId, handleInsertCol, runRefRangeMutations } from '@univerjs/sheets';
import { checkFormulaDataNull } from './offset-formula-data';

export enum FormulaReferenceMoveType {
    MoveRange, // range
    MoveRows, // move rows
    MoveCols, // move columns
    InsertRow, // row
    InsertColumn, // column
    RemoveRow, // row
    RemoveColumn, // column
    DeleteMoveLeft, // range
    DeleteMoveUp, // range
    InsertMoveDown, // range
    InsertMoveRight, // range
    SetName,
    RemoveSheet,
}

export interface IFormulaReferenceMoveParam {
    type: FormulaReferenceMoveType;
    unitId: string;
    sheetId: string;
    range?: IRange;
    from?: IRange;
    to?: IRange;
    sheetName?: string;
}

export interface IRangeChange {
    oldCell: IRange;
    newCell: IRange;
}

/**
 * For different Command operations, it may be necessary to perform traversal in reverse or in forward order, so first determine the type of Command and then perform traversal.
 * @param oldFormulaData
 * @param newFormulaData
 * @param formulaReferenceMoveParam
 * @returns
 */
export function refRangeFormula(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    const type = formulaReferenceMoveParam.type;

    if (type === FormulaReferenceMoveType.SetName) {
        // TODO
    } else if (type === FormulaReferenceMoveType.RemoveSheet) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveRange) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveRows) {
        // TODO
    } else if (type === FormulaReferenceMoveType.MoveCols) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertRow) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertColumn) {
        return handleRefInsertCol(oldFormulaData, newFormulaData, formulaReferenceMoveParam);
    } else if (type === FormulaReferenceMoveType.RemoveRow) {
        // TODO
    } else if (type === FormulaReferenceMoveType.RemoveColumn) {
        // TODO
    } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
        // TODO
    } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
        // TODO
    } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
        // TODO
    }

    return {
        redoFormulaData: {},
        undoFormulaData: {},
        exchangePosition: {},
    };
}

function handleRefInsertCol(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    let redoFormulaData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};
    let undoFormulaData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};
    const exchangePosition: IExchangePosition = {};

    const { type, unitId, sheetId, range, from, to } = formulaReferenceMoveParam;

    if (range === undefined) {
        return {
            redoFormulaData,
            undoFormulaData,
            exchangePosition,
        };
    }

    if (checkFormulaDataNull(oldFormulaData, unitId, sheetId)) {
        return {
            redoFormulaData,
            undoFormulaData,
            exchangePosition,
        };
    }

    const currentOldFormulaData = oldFormulaData[unitId]![sheetId];
    const currentNewFormulaData = newFormulaData[unitId]![sheetId];

    const oldFormulaMatrix = new ObjectMatrix(currentOldFormulaData);
    const newFormulaMatrix = new ObjectMatrix(currentNewFormulaData);

    // When undoing and redoing, the traversal order may be different. Record the range list of all single formula offsets, and then retrieve the traversal as needed.
    const rangeList: IRangeChange[] = [];

    oldFormulaMatrix.forValue((row, column, cell) => {
        const formulaString = cell?.f || '';
        const formulaId = cell?.si || '';

        const checkFormulaString = isFormulaString(formulaString);
        const checkFormulaId = isFormulaId(formulaId);

        // Offset is only needed when there is a formula
        if (!checkFormulaString && !checkFormulaId) {
            return;
        }

        const oldCell = cellToRange(row, column);

        const operators = handleInsertCol(
            {
                id: EffectRefRangId.InsertColCommandId,
                params: { range, unitId: '', subUnitId: '', direction: Direction.RIGHT },
            },
            oldCell
        );

        const newCell = runRefRangeMutations(operators, oldCell);

        if (newCell == null) {
            return;
        }

        rangeList.push({
            oldCell,
            newCell,
        });

        exchangePosition[`${row}_${column}`] = oldCell;
        exchangePosition[`${newCell.startRow}_${newCell.startColumn}`] = newCell;
    });

    redoFormulaData = getRedoFormulaData(rangeList.reverse(), oldFormulaMatrix, newFormulaMatrix);
    undoFormulaData = getUndoFormulaData(rangeList, oldFormulaMatrix, newFormulaMatrix);

    return {
        redoFormulaData,
        undoFormulaData,
        exchangePosition,
    };
}

/**
 * Delete the old value at the old position on the match, and add the new value at the new position (the new value first checks whether the old position has offset content, if so, use the new offset content, if not, take the old value)
 * @param rangeList
 * @param oldFormulaData
 * @param newFormulaData
 */
function getRedoFormulaData(rangeList: IRangeChange[], oldFormulaMatrix: ObjectMatrix<IFormulaDataItem>, newFormulaMatrix: ObjectMatrix<IFormulaDataItem>) {
    const redoFormulaData = new ObjectMatrix<ICellData | null>({});

    rangeList.forEach((item) => {
        const { oldCell, newCell } = item;

        const { startRow: oldStartRow, startColumn: oldStartColumn } = oldCell;
        const { startRow: newStartRow, startColumn: newStartColumn } = newCell;

        const newFormula = newFormulaMatrix.getValue(oldStartRow, oldStartColumn) || oldFormulaMatrix.getValue(oldStartRow, oldStartColumn);
        const newValue = formulaDataItemToCellData(newFormula);

        redoFormulaData.setValue(newStartRow, newStartColumn, newValue);
        redoFormulaData.setValue(oldStartRow, oldStartColumn, null);
    });

    return redoFormulaData.clone();
}

/**
 * The old position on the match saves the old value, and the new position delete value（for formulaData）
 * @param rangeList
 * @param oldFormulaData
 * @param newFormulaData
 */
function getUndoFormulaData(rangeList: IRangeChange[], oldFormulaMatrix: ObjectMatrix<IFormulaDataItem>, newFormulaMatrix: ObjectMatrix<IFormulaDataItem>) {
    const undoFormulaData = new ObjectMatrix<ICellData | null>({});

    rangeList.forEach((item) => {
        const { oldCell, newCell } = item;

        const { startRow: oldStartRow, startColumn: oldStartColumn } = oldCell;
        const { startRow: newStartRow, startColumn: newStartColumn } = newCell;

        const oldFormula = oldFormulaMatrix.getValue(oldStartRow, oldStartColumn);
        const oldValue = formulaDataItemToCellData(oldFormula);

        // When undoing, setRangeValues is executed before the position changes, so we must store the old value in the new position so that the old value can be restored to the correct position after the snapshot position changes.

        // For formulaData, it should be necessary to restore the old value at the old position and delete the value at the new position, which is the opposite of the situation in undo, so we set a position exchange information in the mutation information of undo, and identify and process it in the update logic of formulaData.
        undoFormulaData.setValue(oldStartRow, oldStartColumn, null);
        undoFormulaData.setValue(newStartRow, newStartColumn, oldValue);
    });

    return undoFormulaData.clone();
}

/**
 * Transfer the formulaDataItem to the cellData
 * ┌────────────────────────────────┬─────────────────┐
 * │        IFormulaDataItem        │     ICellData   │
 * ├──────────────────┬─────┬───┬───┼───────────┬─────┤
 * │ f                │ si  │ x │ y │ f         │ si  │
 * ├──────────────────┼─────┼───┼───┼───────────┼─────┤
 * │ =SUM(1)          │     │   │   │ =SUM(1)   │     │
 * │                  │ id1 │   │   │           │ id1 │
 * │ =SUM(1)          │ id1 │   │   │ =SUM(1)   │ id1 │
 * │ =SUM(1)          │ id1 │ 0 │ 0 │ =SUM(1)   │ id1 │
 * │ =SUM(1)          │ id1 │ 0 │ 1 │           │ id1 │
 * └──────────────────┴─────┴───┴───┴───────────┴─────┘
 */
export function formulaDataItemToCellData(formulaDataItem: IFormulaDataItem): ICellData {
    const { f, si, x = 0, y = 0 } = formulaDataItem;
    const checkFormulaString = isFormulaString(f);
    const checkFormulaId = isFormulaId(si);

    const cellData: ICellData = {};

    if (checkFormulaId) {
        cellData.si = si;
    }

    if (checkFormulaString && x === 0 && y === 0) {
        cellData.f = f;
    }

    return cellData;
}
