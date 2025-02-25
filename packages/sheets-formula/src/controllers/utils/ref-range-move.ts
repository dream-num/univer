/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type {
    IRange,
    IUnitRange,
    Nullable,
} from '@univerjs/core';
import {
    Direction,
    getIntersectRange,
    RANGE_TYPE,
    Rectangle,
} from '@univerjs/core';

import { ErrorType, serializeRangeToRefString } from '@univerjs/engine-formula';

import {
    EffectRefRangId,
    handleDeleteRangeMoveLeft,
    handleDeleteRangeMoveUp,
    handleInsertCol,
    handleInsertRangeMoveDown,
    handleInsertRangeMoveRight,
    handleInsertRow,
    handleIRemoveCol,
    handleIRemoveRow,
    handleMoveCols,
    handleMoveRange,
    handleMoveRows,
    runRefRangeMutations,
} from '@univerjs/sheets';
import { checkIsSameUnitAndSheet, FormulaReferenceMoveType, type IFormulaReferenceMoveParam } from './ref-range-formula';

export interface IUnitRangeWithOffset extends IUnitRange {
    refOffsetX: number;
    refOffsetY: number;
    sheetName: string;
}

export enum OriginRangeEdgeType {
    UP,
    DOWN,
    LEFT,
    RIGHT,
    ALL,
}

// eslint-disable-next-line max-lines-per-function, complexity
export function getNewRangeByMoveParam(
    unitRangeWidthOffset: IUnitRangeWithOffset,
    formulaReferenceMoveParam: IFormulaReferenceMoveParam,
    currentFormulaUnitId: string,
    currentFormulaSheetId: string
) {
    const { type, unitId: userUnitId, sheetId: userSheetId, range, from, to } = formulaReferenceMoveParam;

    const {
        range: unitRange,
        sheetId: sequenceRangeSheetId,
        unitId: sequenceRangeUnitId,
        sheetName: sequenceRangeSheetName,
        refOffsetX,
        refOffsetY,
    } = unitRangeWidthOffset;

    if (
        !checkIsSameUnitAndSheet(
            userUnitId,
            userSheetId,
            currentFormulaUnitId,
            currentFormulaSheetId,
            sequenceRangeUnitId,
            sequenceRangeSheetId
        )
    ) {
        return;
    }

    const sequenceRange = Rectangle.moveOffset(unitRange, refOffsetX, refOffsetY);
    let newRange: Nullable<IRange> = null;

    if (type === FormulaReferenceMoveType.MoveRange) {
        if (from == null || to == null) {
            return;
        }

        const moveEdge = checkMoveEdge(sequenceRange, from);

        const remainRange = getIntersectRange(sequenceRange, from);

        if (remainRange == null || moveEdge !== OriginRangeEdgeType.ALL) {
            return;
        }

        const operators = handleMoveRange(
            { id: EffectRefRangId.MoveRangeCommandId, params: { toRange: to, fromRange: from } },
            remainRange
        );

        const result = runRefRangeMutations(operators, remainRange);

        if (result == null) {
            return ErrorType.REF;
        }

        newRange = getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
    } else if (type === FormulaReferenceMoveType.MoveRows) {
        if (from == null || to == null) {
            return;
        }

        const moveEdge = checkMoveEdge(sequenceRange, from);

        let remainRange = getIntersectRange(sequenceRange, from);

        if (
            remainRange == null &&
            ((from.endRow < sequenceRange.startRow && to.endRow < sequenceRange.startRow) || (from.startRow > sequenceRange.endRow && to.startRow > sequenceRange.endRow))
        ) {
            return;
        }

        if (remainRange == null) {
            remainRange = {
                startRow: sequenceRange.startRow,
                endRow: sequenceRange.endRow,
                startColumn: sequenceRange.startColumn,
                endColumn: sequenceRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
        }

        const operators = handleMoveRows(
            { id: EffectRefRangId.MoveRowsCommandId, params: { toRange: to, fromRange: from } },
            remainRange
        );

        const result = runRefRangeMutations(operators, remainRange);

        if (result == null) {
            return ErrorType.REF;
        }

        newRange = getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
    } else if (type === FormulaReferenceMoveType.MoveCols) {
        if (from == null || to == null) {
            return;
        }

        const moveEdge = checkMoveEdge(sequenceRange, from);

        let remainRange = getIntersectRange(sequenceRange, from);

        if (
            remainRange == null &&
            ((from.endColumn < sequenceRange.startColumn && to.endColumn < sequenceRange.startColumn) || (from.startColumn > sequenceRange.endColumn && to.startColumn > sequenceRange.endColumn))
        ) {
            return;
        }

        if (remainRange == null) {
            remainRange = {
                startRow: sequenceRange.startRow,
                endRow: sequenceRange.endRow,
                startColumn: sequenceRange.startColumn,
                endColumn: sequenceRange.endColumn,
                rangeType: RANGE_TYPE.NORMAL,
            };
        }

        const operators = handleMoveCols(
            { id: EffectRefRangId.MoveColsCommandId, params: { toRange: to, fromRange: from } },
            remainRange
        );

        const result = runRefRangeMutations(operators, remainRange);

        if (result == null) {
            return ErrorType.REF;
        }

        newRange = getMoveNewRange(moveEdge, result, from, to, sequenceRange, remainRange);
    }

    if (range != null) {
        if (type === FormulaReferenceMoveType.InsertRow) {
            const operators = handleInsertRow(
                {
                    id: EffectRefRangId.InsertRowCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: Direction.DOWN },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.InsertColumn) {
            const operators = handleInsertCol(
                {
                    id: EffectRefRangId.InsertColCommandId,
                    params: { range, unitId: '', subUnitId: '', direction: Direction.RIGHT },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.RemoveRow) {
            const operators = handleIRemoveRow(
                {
                    id: EffectRefRangId.RemoveRowCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.RemoveColumn) {
            const operators = handleIRemoveCol(
                {
                    id: EffectRefRangId.RemoveColCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.DeleteMoveLeft) {
            const operators = handleDeleteRangeMoveLeft(
                {
                    id: EffectRefRangId.DeleteRangeMoveLeftCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.DeleteMoveUp) {
            const operators = handleDeleteRangeMoveUp(
                {
                    id: EffectRefRangId.DeleteRangeMoveUpCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return ErrorType.REF;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.InsertMoveDown) {
            const operators = handleInsertRangeMoveDown(
                {
                    id: EffectRefRangId.InsertRangeMoveDownCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        } else if (type === FormulaReferenceMoveType.InsertMoveRight) {
            const operators = handleInsertRangeMoveRight(
                {
                    id: EffectRefRangId.InsertRangeMoveRightCommandId,
                    params: { range },
                },
                sequenceRange
            );

            const result = runRefRangeMutations(operators, sequenceRange);

            if (result == null) {
                return;
            }

            newRange = {
                ...sequenceRange,
                ...result,
            };
        }
    }

    if (newRange == null) {
        return;
    }

    return serializeRangeToRefString({
        range: newRange,
        sheetName: sequenceRangeSheetName,
        unitId: sequenceRangeUnitId,
    });
}

/**
 *  Calculate the new ref information for the moving selection.
 * @param moveEdge  the 'from' range lie on the edge of the original range, or does it completely cover the original range
 * @param result The original range is divided by 'from' and moved to a new position range.
 * @param from The initial range of the moving selection.
 * @param to The result range after moving the initial range.
 * @param origin The original target range.
 * @param remain "The range subtracted from the initial range by 'from'.
 * @returns
 */
// eslint-disable-next-line
function getMoveNewRange(
    moveEdge: Nullable<OriginRangeEdgeType>,
    result: IRange,
    from: IRange,
    to: IRange,
    origin: IRange,
    remain: IRange
) {
    const { startRow, endRow, startColumn, endColumn, rangeType } = getStartEndValue(result);

    const {
        startRow: fromStartRow,
        startColumn: fromStartColumn,
        endRow: fromEndRow,
        endColumn: fromEndColumn,
        rangeType: fromRangeType = RANGE_TYPE.NORMAL,
    } = getStartEndValue(from);

    const { startRow: toStartRow, startColumn: toStartColumn, endRow: toEndRow, endColumn: toEndColumn } = getStartEndValue(to);

    const {
        startRow: remainStartRow,
        endRow: remainEndRow,
        startColumn: remainStartColumn,
        endColumn: remainEndColumn,
    } = getStartEndValue(remain);

    const {
        startRow: originStartRow,
        endRow: originEndRow,
        startColumn: originStartColumn,
        endColumn: originEndColumn,
        rangeType: originRangeType = RANGE_TYPE.NORMAL,
    } = getStartEndValue(origin);

    const newRange = { ...origin };

    function rowsCover(): boolean {
        if (rangeType === RANGE_TYPE.COLUMN && originRangeType === RANGE_TYPE.COLUMN) {
            return true;
        }
        return startColumn >= originStartColumn && endColumn <= originEndColumn;
    }

    function columnsCover(): boolean {
        if (rangeType === RANGE_TYPE.ROW && originRangeType === RANGE_TYPE.ROW) {
            return true;
        }
        return startRow >= originStartRow && endRow <= originEndRow;
    }

    if (moveEdge === OriginRangeEdgeType.UP) {
        if (rowsCover()) {
            if (startRow < originStartRow) {
                newRange.startRow = startRow;
            } else if (startRow >= originEndRow) {
                newRange.endRow -= fromEndRow + 1 - originStartRow;
            } else {
                return;
            }
        } else {
            return;
        }
    } else if (moveEdge === OriginRangeEdgeType.DOWN) {
        if (rowsCover()) {
            if (endRow > originEndRow) {
                newRange.endRow = endRow;
            } else if (endRow <= originStartRow) {
                newRange.startRow += originEndRow - fromStartRow + 1;
            } else {
                return;
            }
        } else {
            return;
        }
    } else if (moveEdge === OriginRangeEdgeType.LEFT) {
        if (columnsCover()) {
            if (startColumn < originStartColumn) {
                newRange.startColumn = startColumn;
            } else if (startColumn >= originEndColumn) {
                newRange.endColumn -= fromEndColumn + 1 - originStartColumn;
            } else {
                return;
            }
        } else {
            return;
        }
    } else if (moveEdge === OriginRangeEdgeType.RIGHT) {
        if (columnsCover()) {
            if (endColumn > originEndColumn) {
                newRange.endColumn = endColumn;
            } else if (endColumn <= originStartColumn) {
                newRange.startColumn += originEndColumn - fromStartColumn + 1;
            } else {
                return;
            }
        } else {
            return;
        }
    } else if (moveEdge === OriginRangeEdgeType.ALL) {
        newRange.startRow = startRow;
        newRange.startColumn = startColumn;
        newRange.endRow = endRow;
        newRange.endColumn = endColumn;
    } else if ((fromStartColumn <= originStartColumn && fromEndColumn >= originEndColumn) || (fromRangeType === RANGE_TYPE.ROW && originRangeType === RANGE_TYPE.ROW)) { // For the entire row, originStartColumn and originEndColumn may be NaN
        if (from.endRow < originStartRow) {
            if (toStartRow >= originStartRow) {
                newRange.startRow -= fromEndRow - fromStartRow + 1;
            }
            if (toStartRow >= originEndRow) {
                newRange.endRow -= fromEndRow - fromStartRow + 1;
            }
        } else if (from.startRow > originEndRow) {
            if (toEndRow <= originEndRow) {
                newRange.endRow += fromEndRow - fromStartRow + 1;
            }
            if (toEndRow <= originStartRow) {
                newRange.startRow += fromEndRow - fromStartRow + 1;
            }
        } else if (from.startRow >= originStartRow && from.endRow <= originEndRow) { // from range is in the middle of the original range
            if (toStartRow <= originStartRow) {
                newRange.startRow += fromEndRow - fromStartRow + 1;
            } else if (toStartRow >= originEndRow) {
                newRange.endRow -= fromEndRow - fromStartRow + 1;
            }
        }
    } else if ((fromStartRow <= originStartRow && fromEndRow >= originEndRow) || (fromRangeType === RANGE_TYPE.COLUMN && originRangeType === RANGE_TYPE.COLUMN)) { // For the entire column, originStartRow and originEndRow may be NaN
        if (from.endColumn < originStartColumn) {
            if (toStartColumn >= originStartColumn) {
                newRange.startColumn -= fromEndColumn - fromStartColumn + 1;
            }
            if (toStartColumn >= originEndColumn) {
                newRange.endColumn -= fromEndColumn - fromStartColumn + 1;
            }
        } else if (from.startColumn > originEndColumn) {
            if (toEndColumn <= originEndColumn) {
                newRange.endColumn += fromEndColumn - fromStartColumn + 1;
            }
            if (toEndColumn <= originStartColumn) {
                newRange.startColumn += fromEndColumn - fromStartColumn + 1;
            }
        } else if (from.startColumn >= originStartColumn && from.endColumn <= originEndColumn) { // from range is in the middle of the original range
            if (toStartColumn <= originStartColumn) {
                newRange.startColumn += fromEndColumn - fromStartColumn + 1;
            } else if (toStartColumn >= originEndColumn) {
                newRange.endColumn -= fromEndColumn - fromStartColumn + 1;
            }
        }
    } else if (
        ((toStartColumn <= remainEndColumn + 1 && toEndColumn >= originEndColumn) ||
           (toStartColumn <= originStartColumn && toEndColumn >= remainStartColumn - 1)) &&
       toStartRow <= originStartRow &&
       toEndRow >= originEndRow
    ) {
        newRange.startRow = startRow;
        newRange.startColumn = startColumn;
        newRange.endRow = endRow;
        newRange.endColumn = endColumn;
    } else if (
        ((toStartRow <= remainEndRow + 1 && toEndRow >= originEndRow) ||
           (toStartRow <= originStartRow && toEndRow >= remainStartRow - 1)) &&
       toStartColumn <= originStartColumn &&
       toEndColumn >= originEndColumn
    ) {
        newRange.startRow = startRow;
        newRange.startColumn = startColumn;
        newRange.endRow = endRow;
        newRange.endColumn = endColumn;
    } else {
        // By default, the offset of result is taken
        newRange.startRow = startRow;
        newRange.startColumn = startColumn;
        newRange.endRow = endRow;
        newRange.endColumn = endColumn;
    }

    return newRange;
}

/**
 * Determine the range of the moving selection,
 * and check if it is at the edge of the reference range of the formula.
 * @param originRange
 * @param fromRange
 */
export function checkMoveEdge(originRange: IRange, fromRange: IRange): Nullable<OriginRangeEdgeType> {
    const startRow = getStartValue(originRange.startRow);
    const endRow = getEndValue(originRange.endRow);
    const startColumn = getStartValue(originRange.startColumn);
    const endColumn = getEndValue(originRange.endColumn);

    const fromStartRow = getStartValue(fromRange.startRow);
    const fromEndRow = getEndValue(fromRange.endRow);
    const fromStartColumn = getStartValue(fromRange.startColumn);
    const fromEndColumn = getEndValue(fromRange.endColumn);

    function rowsCover(): boolean {
        if (originRange.rangeType === RANGE_TYPE.COLUMN && fromRange.rangeType === RANGE_TYPE.COLUMN) {
            return true;
        }
        return startRow >= fromStartRow && endRow <= fromEndRow;
    }

    function columnsCover(): boolean {
        if (originRange.rangeType === RANGE_TYPE.ROW && fromRange.rangeType === RANGE_TYPE.ROW) {
            return true;
        }
        return startColumn >= fromStartColumn && endColumn <= fromEndColumn;
    }

    function allCover(): boolean {
        return originRange.rangeType === RANGE_TYPE.ALL && fromRange.rangeType === RANGE_TYPE.ALL;
    }

    if ((rowsCover() && columnsCover()) || allCover()) {
        return OriginRangeEdgeType.ALL;
    }

    if (
        columnsCover() &&
            startRow >= fromStartRow &&
            startRow <= fromEndRow &&
            endRow > fromEndRow
    ) {
        return OriginRangeEdgeType.UP;
    }

    if (
        columnsCover() &&
            endRow >= fromStartRow &&
            endRow <= fromEndRow &&
            startRow < fromStartRow
    ) {
        return OriginRangeEdgeType.DOWN;
    }

    if (
        rowsCover() &&
            startColumn >= fromStartColumn &&
            startColumn <= fromEndColumn &&
            endColumn > fromEndColumn
    ) {
        return OriginRangeEdgeType.LEFT;
    }

    if (
        rowsCover() &&
            endColumn >= fromStartColumn &&
            endColumn <= fromEndColumn &&
            startColumn < fromStartColumn
    ) {
        return OriginRangeEdgeType.RIGHT;
    }

    return null; // Return null if no edge type matches
}

// Helper functions to get start values, treating NaN as unbounded
function getStartValue(value: number): number {
    // If value is NaN, treat as -Infinity (unbounded start)
    return isNaN(value) ? -Infinity : value;
}

// Helper functions to get end values, treating NaN as unbounded
function getEndValue(value: number): number {
    // If value is NaN, treat as Infinity (unbounded end)
    return isNaN(value) ? Infinity : value;
}

function getStartEndValue(range: IRange) {
    const { startRow, endRow, startColumn, endColumn } = range;
    return {
        ...range,
        startRow: getStartValue(startRow),
        endRow: getEndValue(endRow),
        startColumn: getStartValue(startColumn),
        endColumn: getEndValue(endColumn),
    };
}
