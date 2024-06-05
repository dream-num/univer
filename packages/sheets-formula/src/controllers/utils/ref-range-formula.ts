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

import type { ICellData, IMutationInfo, IObjectMatrixPrimitiveType, IRange, Nullable } from '@univerjs/core';
import { cellToRange, Direction, isFormulaId, isFormulaString, ObjectMatrix } from '@univerjs/core';
import type { IFormulaData, IFormulaDataItem, IRangeChange } from '@univerjs/engine-formula';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { EffectRefRangId, handleDeleteRangeMoveLeft, handleDeleteRangeMoveUp, handleInsertCol, handleInsertRangeMoveDown, handleInsertRangeMoveRight, handleInsertRow, handleIRemoveCol, handleIRemoveRow, handleMoveCols, handleMoveRange, handleMoveRows, runRefRangeMutations, SetRangeValuesMutation } from '@univerjs/sheets';
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

export function getFormulaReferenceMoveUndoRedo(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    const { type } = formulaReferenceMoveParam;

    if (type === FormulaReferenceMoveType.SetName || type === FormulaReferenceMoveType.RemoveSheet) {
        return getFormulaReferenceSheet(oldFormulaData, newFormulaData);
    } else {
        return getFormulaReferenceRange(oldFormulaData, newFormulaData, formulaReferenceMoveParam);
    }
}

export function getFormulaReferenceSheet(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData) {
    const undos: IMutationInfo[] = [];
    const redos: IMutationInfo[] = [];

    Object.keys(newFormulaData).forEach((unitId) => {
        const newSheetData = newFormulaData[unitId];
        const oldSheetData = oldFormulaData[unitId];

        if (newSheetData == null) {
            return true;
        }

        if (oldSheetData == null) {
            return true;
        }

        Object.keys(newSheetData).forEach((subUnitId) => {
            const newSheetFormula = new ObjectMatrix(newSheetData[subUnitId] || {});
            const oldSheetFormula = new ObjectMatrix(oldSheetData[subUnitId] || {});
            const redoFormulaMatrix = new ObjectMatrix<Nullable<ICellData>>();
            const undoFormulaMatrix = new ObjectMatrix<Nullable<ICellData>>();

            newSheetFormula.forValue((r, c, cell) => {
                if (cell == null) {
                    return true;
                }
                const newValue = formulaDataItemToCellData(cell);

                if (newValue === null) {
                    return;
                }

                redoFormulaMatrix.setValue(r, c, newValue);
                undoFormulaMatrix.setValue(r, c, oldSheetFormula.getValue(r, c));
            });

            if (redoFormulaMatrix.getSizeOf() === 0) {
                return;
            }

            const redoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = {
                subUnitId,
                unitId,
                cellValue: redoFormulaMatrix.clone(),
            };

            const redoMutation = {
                id: SetRangeValuesMutation.id,
                params: redoSetRangeValuesMutationParams,
            };

            redos.push(redoMutation);

            const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = {
                subUnitId,
                unitId,
                cellValue: undoFormulaMatrix.clone(),
            };

            const undoMutation = {
                id: SetRangeValuesMutation.id,
                params: undoSetRangeValuesMutationParams,
            };

            undos.push(undoMutation);
        });
    });

    return {
        undos,
        redos,
    };
}

export function getFormulaReferenceRange(oldFormulaData: IFormulaData,
    newFormulaData: IFormulaData,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam) {
    const { sheetId: subUnitId, unitId } = formulaReferenceMoveParam;
    const { redoFormulaData, undoFormulaData } = refRangeFormula(oldFormulaData, newFormulaData, formulaReferenceMoveParam);

    const redos: IMutationInfo[] = [];
    const undos: IMutationInfo[] = [];

    if (Object.keys(redoFormulaData).length !== 0) {
        const redoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: redoFormulaData,
        };

        const redoMutation = {
            id: SetRangeValuesMutation.id,
            params: redoSetRangeValuesMutationParams,
        };

        redos.push(redoMutation);
    }

    if (Object.keys(undoFormulaData).length !== 0) {
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: undoFormulaData,
        };

        const undoMutation = {
            id: SetRangeValuesMutation.id,
            params: undoSetRangeValuesMutationParams,
        };

        undos.push(undoMutation);
    }

    return {
        undos,
        redos,
    };
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
    let redoFormulaData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};
    let undoFormulaData: IObjectMatrixPrimitiveType<Nullable<ICellData>> = {};

    const { type, unitId, sheetId, range, from, to } = formulaReferenceMoveParam;

    if (checkFormulaDataNull(oldFormulaData, unitId, sheetId)) {
        return {
            redoFormulaData,
            undoFormulaData,
        };
    }

    const currentOldFormulaData = oldFormulaData[unitId]![sheetId];
    const currentNewFormulaData = newFormulaData[unitId]![sheetId];

    const oldFormulaMatrix = new ObjectMatrix(currentOldFormulaData || {});
    const newFormulaMatrix = new ObjectMatrix(currentNewFormulaData || {});

    const rangeList = processFormulaChanges(oldFormulaMatrix, type, from, to, range);

    redoFormulaData = getRedoFormulaData(rangeList, oldFormulaMatrix, newFormulaMatrix);
    undoFormulaData = getUndoFormulaData(rangeList, oldFormulaMatrix);

    return {
        redoFormulaData,
        undoFormulaData,
    };
}

function processFormulaChanges(oldFormulaMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>, type: FormulaReferenceMoveType, from: Nullable<IRange>, to: Nullable<IRange>, range: Nullable<IRange>) {
    // When undoing and redoing, the traversal order may be different. Record the range list of all single formula offsets, and then retrieve the traversal as needed.
    const rangeList: IRangeChange[] = [];

    oldFormulaMatrix.forValue((row, column, cell) => {
        // Offset is only needed when there is a formula
        if (cell == null || !isFormulaDataItem(cell)) return true;

        const oldCell = cellToRange(row, column);
        let newCell = null;
        let isReverse = false;

        // Handle moves
        if ([FormulaReferenceMoveType.MoveRange, FormulaReferenceMoveType.MoveRows, FormulaReferenceMoveType.MoveCols].includes(type)) {
            newCell = handleMove(type, from, to, oldCell);
        } else if (range !== undefined && range !== null) { // Handle inserts and deletes
            const result = handleInsertDelete(type, range, oldCell);
            // When removing a cell containing a formula, newCell is null, but the formula value of oldCell is required when undoing it, newCell can be null
            newCell = result.newCell;
            isReverse = result.isReverse;
        }

        // Don't intercept newCell null here

        // Note: The formula may only update the reference and not offset the position. The situation where the position is not shifted cannot be intercepted here.
        isReverse ? rangeList.unshift({ oldCell, newCell }) : rangeList.push({ oldCell, newCell });
    });

    return rangeList;
}

function handleMove(type: FormulaReferenceMoveType, from: Nullable<IRange>, to: Nullable<IRange>, oldCell: IRange) {
    if (from == null || to == null) {
        return null;
    }

    switch (type) {
        case FormulaReferenceMoveType.MoveRange:

            return handleRefMoveRange(from, to, oldCell);
        case FormulaReferenceMoveType.MoveRows:

            return handleRefMoveRows(from, to, oldCell);
        case FormulaReferenceMoveType.MoveCols:

            return handleRefMoveCols(from, to, oldCell);
        default:
            return null;
    }
}

function handleInsertDelete(type: FormulaReferenceMoveType, range: IRange, oldCell: IRange) {
    let newCell: IRange | null = null;
    let isReverse = false;

    switch (type) {
        case FormulaReferenceMoveType.InsertRow:
            newCell = handleRefInsertRow(range, oldCell);
            isReverse = true;
            break;
        case FormulaReferenceMoveType.InsertColumn:
            newCell = handleRefInsertCol(range, oldCell);
            isReverse = true;
            break;
        case FormulaReferenceMoveType.RemoveRow:
            newCell = handleRefRemoveRow(range, oldCell);
            break;
        case FormulaReferenceMoveType.RemoveColumn:
            newCell = handleRefRemoveCol(range, oldCell);
            break;
        case FormulaReferenceMoveType.DeleteMoveLeft:
            newCell = handleRefDeleteMoveLeft(range, oldCell);
            break;
        case FormulaReferenceMoveType.DeleteMoveUp:
            newCell = handleRefDeleteMoveUp(range, oldCell);
            break;
        case FormulaReferenceMoveType.InsertMoveDown:
            newCell = handleRefInsertMoveDown(range, oldCell);
            isReverse = true;
            break;
        case FormulaReferenceMoveType.InsertMoveRight:
            newCell = handleRefInsertMoveRight(range, oldCell);
            isReverse = true;
            break;
        default:
            break;
    }

    return { newCell, isReverse };
}

function handleRefMoveRange(from: IRange, to: IRange, oldCell: IRange) {
    const operators = handleMoveRange(
        {
            id: EffectRefRangId.MoveRangeCommandId,
            params: { toRange: to, fromRange: from },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefMoveRows(from: IRange, to: IRange, oldCell: IRange) {
    const operators = handleMoveRows(
        {
            id: EffectRefRangId.MoveRowsCommandId,
            params: { toRange: to, fromRange: from },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefMoveCols(from: IRange, to: IRange, oldCell: IRange) {
    const operators = handleMoveCols(
        {
            id: EffectRefRangId.MoveColsCommandId,
            params: { toRange: to, fromRange: from },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefInsertRow(range: IRange, oldCell: IRange) {
    const operators = handleInsertRow(
        {
            id: EffectRefRangId.InsertRowCommandId,
            params: { range, unitId: '', subUnitId: '', direction: Direction.DOWN },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefInsertCol(range: IRange, oldCell: IRange) {
    const operators = handleInsertCol(
        {
            id: EffectRefRangId.InsertColCommandId,
            params: { range, unitId: '', subUnitId: '', direction: Direction.RIGHT },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefRemoveRow(range: IRange, oldCell: IRange) {
    const operators = handleIRemoveRow(
        {
            id: EffectRefRangId.RemoveRowCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefRemoveCol(range: IRange, oldCell: IRange) {
    const operators = handleIRemoveCol(
        {
            id: EffectRefRangId.RemoveColCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefDeleteMoveLeft(range: IRange, oldCell: IRange) {
    const operators = handleDeleteRangeMoveLeft(
        {
            id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefDeleteMoveUp(range: IRange, oldCell: IRange) {
    const operators = handleDeleteRangeMoveUp(
        {
            id: EffectRefRangId.DeleteRangeMoveUpCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefInsertMoveDown(range: IRange, oldCell: IRange) {
    const operators = handleInsertRangeMoveDown(
        {
            id: EffectRefRangId.InsertRangeMoveDownCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

function handleRefInsertMoveRight(range: IRange, oldCell: IRange) {
    const operators = handleInsertRangeMoveRight(
        {
            id: EffectRefRangId.InsertRangeMoveRightCommandId,
            params: { range },
        },
        oldCell
    );

    return runRefRangeMutations(operators, oldCell);
}

/**
 * Delete the old value at the old position on the match, and add the new value at the new position (the new value first checks whether the old position has offset content, if so, use the new offset content, if not, take the old value)
 * @param rangeList
 * @param oldFormulaData
 * @param newFormulaData
 */
function getRedoFormulaData(rangeList: IRangeChange[], oldFormulaMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>, newFormulaMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>) {
    const redoFormulaData = new ObjectMatrix<Nullable<ICellData>>({});

    rangeList.forEach((item) => {
        const { oldCell, newCell } = item;

        const { startRow: oldStartRow, startColumn: oldStartColumn } = oldCell;

        const newFormula = newFormulaMatrix.getValue(oldStartRow, oldStartColumn) || oldFormulaMatrix.getValue(oldStartRow, oldStartColumn);
        // Use the formula result value to update the data to ensure accuracy, otherwise the new formula cannot be inferred from #REF
        const newValue = formulaDataItemToCellDataFormula(newFormula);

        redoFormulaData.setValue(oldStartRow, oldStartColumn, { f: null, si: null });

        if (newCell) {
            const { startRow: newStartRow, startColumn: newStartColumn } = newCell;
            redoFormulaData.setValue(newStartRow, newStartColumn, newValue);
        }
    });

    return redoFormulaData.clone();
}

/**
 * The old position on the match saves the old value, and the new position delete value（for formulaData）
 * @param rangeList
 * @param oldFormulaData
 * @param newFormulaData
 */
function getUndoFormulaData(rangeList: IRangeChange[], oldFormulaMatrix: ObjectMatrix<Nullable<IFormulaDataItem>>) {
    const undoFormulaData = new ObjectMatrix<Nullable<ICellData>>({});

    // Maintaining the correct assignment order prevents overwriting data
    rangeList.reverse().forEach((item) => {
        const { oldCell, newCell } = item;

        const { startRow: oldStartRow, startColumn: oldStartColumn } = oldCell;

        const oldFormula = oldFormulaMatrix.getValue(oldStartRow, oldStartColumn);
        const oldValue = formulaDataItemToCellData(oldFormula);

        if (newCell) {
            const { startRow: newStartRow, startColumn: newStartColumn } = newCell;
            undoFormulaData.setValue(newStartRow, newStartColumn, { f: null, si: null });
        }

        undoFormulaData.setValue(oldStartRow, oldStartColumn, oldValue);
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
export function formulaDataItemToCellData(formulaDataItem: Nullable<IFormulaDataItem>): Nullable<ICellData> {
    if (formulaDataItem == null) {
        return;
    }
    const { f, si, x = 0, y = 0 } = formulaDataItem;
    const checkFormulaString = isFormulaString(f);
    const checkFormulaId = isFormulaId(si);

    if (!checkFormulaString && !checkFormulaId) {
        return {
            f: null,
            si: null,
        };
    }

    const cellData: ICellData = {};

    if (checkFormulaId) {
        cellData.si = si;
    }

    if (checkFormulaString && x === 0 && y === 0) {
        cellData.f = f;
    }

    return cellData;
}

/**
 * Transfer the formulaDataItem to the cellData, contains formula
 * ┌────────────────────────────────┬─────────────────┐
 * │        IFormulaDataItem        │     ICellData   │
 * ├──────────────────┬─────┬───┬───┼───────────┬─────┤
 * │ f                │ si  │ x │ y │ f         │ si  │
 * ├──────────────────┼─────┼───┼───┼───────────┼─────┤
 * │ =SUM(1)          │     │   │   │ =SUM(1)   │     │
 * │                  │ id1 │   │   │           │ id1 │
 * │ =SUM(1)          │ id1 │   │   │ =SUM(1)   │     │
 * │ =SUM(1)          │ id1 │ 0 │ 0 │ =SUM(1)   │     │
 * │ =SUM(1)          │ id1 │ 0 │ 1 │ =SUM(1)   │     │
 * └──────────────────┴─────┴───┴───┴───────────┴─────┘
 *
 * The fifth case: The value f of the formula is already the result value. If the formula content of si contains #REF, it cannot be obtained from the formula offset of si, and the result value must be stored directly
 */
export function formulaDataItemToCellDataFormula(formulaDataItem: Nullable<IFormulaDataItem>): Nullable<ICellData> {
    if (formulaDataItem == null) {
        return;
    }
    const { f, si } = formulaDataItem;
    const checkFormulaString = isFormulaString(f);
    const checkFormulaId = isFormulaId(si);

    if (!checkFormulaString && !checkFormulaId) {
        return {
            f: null,
            si: null,
        };
    }

    const cellData: ICellData = {};

    if (checkFormulaString) {
        cellData.f = f;
    }

    if (checkFormulaId && !checkFormulaString) {
        cellData.si = si;
    }

    return cellData;
}

export function isFormulaDataItem(cell: IFormulaDataItem) {
    const formulaString = cell?.f || '';
    const formulaId = cell?.si || '';

    const checkFormulaString = isFormulaString(formulaString);
    const checkFormulaId = isFormulaId(formulaId);

    if (checkFormulaString || checkFormulaId) {
        return true;
    }

    return false;
}
