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

import { createRowColIter, ObjectMatrix, Rectangle } from '@univerjs/core';
import type { ICellData, IRange, Worksheet } from '@univerjs/core';

export interface IExpandParams {
    left?: boolean;
    right?: boolean;
    up?: boolean;
    down?: boolean;
}

type IMatrixWithSpanInfo = ICellData & {
    spanAnchor?: {
        startRow: number;
        startColumn: number;
        endRow: number;
        endColumn: number;
    };
};

interface IExpandedRangeResult {
    spanAnchor: IRange | null;
    hasValue: boolean;
    range: IRange;
}

function cellHasValue(cell: ICellData | undefined): boolean {
    if (cell === undefined || cell === null) {
        return false;
    }
    return (cell.v !== undefined && cell.v !== null && cell.v !== '') || cell.p !== undefined;
}

function hasValueFromMatrixWithSpanInfo(cell: IMatrixWithSpanInfo | undefined, matrix: ObjectMatrix<IMatrixWithSpanInfo>): boolean {
    if (cell && cell.spanAnchor) {
        return cellHasValue(matrix.getValue(cell.spanAnchor.startRow, cell.spanAnchor.startColumn)!);
    }
    return cellHasValue(cell);
}
function getMatrixWithSpanInfo(worksheet: Worksheet, startRow: number, startColumn: number, endRow: number, endColumn: number): ObjectMatrix<IMatrixWithSpanInfo> {
    const matrix = worksheet.getCellMatrix();

    // get all merged cells
    const mergedCellsInRange = worksheet.getSpanModel().getMergedCellRange(startRow, startColumn, endRow, endColumn);
    // iterate all cells in the range
    const returnCellMatrix = new ObjectMatrix<IMatrixWithSpanInfo>();

    matrix.forValue((row, col) => {
        const v = matrix.getValue(row, col);
        if (v) {
            returnCellMatrix.setValue(row, col, v);
        }
    });
    mergedCellsInRange.forEach((mergedCell) => {
        const { startColumn, startRow, endColumn, endRow } = mergedCell;
        createRowColIter(startRow, endRow, startColumn, endColumn).forEach((row, col) => {
            if (row === startRow && col === startColumn) {
                returnCellMatrix.setValue(row, col, {
                    ...matrix.getValue(row, col),
                    spanAnchor: { startRow, endRow, startColumn, endColumn },
                });
            }

            if (row !== startRow || col !== startColumn) {
                returnCellMatrix.realDeleteValue(row, col);
                returnCellMatrix.setValue(row, col, {
                    spanAnchor: { startRow, endRow, startColumn, endColumn },
                });
            }
        });
    });
    return returnCellMatrix;
}

// do not delete following code， it may be used in the future
// function getMergeRange(startRow: number, startColumn: number, endRow: number, endColumn: number, allMatrixWithSpan: ObjectMatrix<IMatrixWithSpanInfo>): IRange {
//     let isSearching = true;
//     let left = startColumn;
//     let right = endColumn;
//     let up = startRow;
//     let down = endRow;

//     while (isSearching) {
//         isSearching = false;
//         // left
//         for (let i = startRow; i < endRow; i++) {
//             const cell = allMatrixWithSpan.getValue(i, startColumn);
//             if (cell && cell.spanAnchor) {
//                 left = Math.min(left, cell.spanAnchor.startColumn);
//                 right = Math.max(right, cell.spanAnchor.endColumn);
//                 up = Math.min(up, cell.spanAnchor.startRow);
//                 down = Math.max(down, cell.spanAnchor.endRow);
//             }
//         }
//         // right
//         for (let i = startRow; i < endRow; i++) {
//             const cell = allMatrixWithSpan.getValue(i, endColumn);
//             if (cell && cell.spanAnchor) {
//                 left = Math.min(left, cell.spanAnchor.startColumn);
//                 right = Math.max(right, cell.spanAnchor.endColumn);
//                 up = Math.min(up, cell.spanAnchor.startRow);
//                 down = Math.max(down, cell.spanAnchor.endRow);
//             }
//         }
//         // up
//         for (let i = startColumn; i < endColumn; i++) {
//             const cell = allMatrixWithSpan.getValue(startRow, i);
//             if (cell && cell.spanAnchor) {
//                 left = Math.min(left, cell.spanAnchor.startColumn);
//                 right = Math.max(right, cell.spanAnchor.endColumn);
//                 up = Math.min(up, cell.spanAnchor.startRow);
//                 down = Math.max(down, cell.spanAnchor.endRow);
//             }
//         }
//         // down
//         for (let i = startColumn; i < endColumn; i++) {
//             const cell = allMatrixWithSpan.getValue(endRow, i);
//             if (cell && cell.spanAnchor) {
//                 left = Math.min(left, cell.spanAnchor.startColumn);
//                 right = Math.max(right, cell.spanAnchor.endColumn);
//                 up = Math.min(up, cell.spanAnchor.startRow);
//                 down = Math.max(down, cell.spanAnchor.endRow);
//             }
//         }

//         if (startColumn !== left || startRow !== up || endColumn !== right || endRow !== down) {
//             isSearching = true;
//             startColumn = left;
//             startRow = up;
//             endColumn = right;
//             endRow = down;
//         }
//     }

//     return {
//         startRow: up,
//         startColumn: left,
//         endRow: down,
//         endColumn: right,
//     };
// }

function getExpandedRangeLeft(range: IRange, allMatrixWithSpan: ObjectMatrix<IMatrixWithSpanInfo>, leftOffset: number, isWorksheetHasSpan: boolean): IExpandedRangeResult {
    const { startRow, startColumn, endRow } = range;

    let spanAnchor: IRange | null = null;
    let hasValue = false;
    for (let i = startRow; i <= endRow; i++) {
        const cell = allMatrixWithSpan.getValue(i, startColumn - leftOffset)!;
        hasValue = hasValue || hasValueFromMatrixWithSpanInfo(cell, allMatrixWithSpan);
        if (!isWorksheetHasSpan && hasValue) {
            break;
        }
        if (cell && cell.spanAnchor) {
            if (!spanAnchor) {
                spanAnchor = {
                    startRow: cell.spanAnchor.startRow,
                    startColumn: cell.spanAnchor.startColumn,
                    endRow: cell.spanAnchor.endRow,
                    endColumn: cell.spanAnchor.endColumn,
                };
            } else {
                spanAnchor = {
                    startRow: Math.min(cell.spanAnchor.startRow, spanAnchor.startRow),
                    startColumn: Math.min(cell.spanAnchor.startColumn, spanAnchor.startColumn),
                    endRow: Math.max(cell.spanAnchor.endRow, spanAnchor.endRow),
                    endColumn: Math.max(cell.spanAnchor.endColumn, spanAnchor.endColumn),
                };
            }
        }
    }

    if (hasValue) {
        range.startColumn = range.startColumn - leftOffset;
        return {
            spanAnchor,
            hasValue: true,
            range,
        };
    }
    return {
        spanAnchor: null,
        hasValue: false,
        range,
    };
}
function getExpandedRangeRight(range: IRange, allMatrixWithSpan: ObjectMatrix<IMatrixWithSpanInfo>, rightOffset: number, isWorksheetHasSpan: boolean): IExpandedRangeResult {
    const { startRow, endColumn, endRow } = range;
    let spanAnchor: IRange | null = null;
    let hasValue = false;

    for (let i = startRow; i <= endRow; i++) {
        const cell = allMatrixWithSpan.getValue(i, endColumn + rightOffset)!;
        hasValue = hasValue || hasValueFromMatrixWithSpanInfo(cell, allMatrixWithSpan);
        if (!isWorksheetHasSpan && hasValue) {
            break;
        }
        if (cell && cell.spanAnchor) {
            if (!spanAnchor) {
                spanAnchor = {
                    startRow: cell.spanAnchor.startRow,
                    startColumn: cell.spanAnchor.startColumn,
                    endRow: cell.spanAnchor.endRow,
                    endColumn: cell.spanAnchor.endColumn,
                };
            } else {
                spanAnchor = {
                    startRow: Math.min(cell.spanAnchor.startRow, spanAnchor.startRow),
                    startColumn: Math.min(cell.spanAnchor.startColumn, spanAnchor.startColumn),
                    endRow: Math.max(cell.spanAnchor.endRow, spanAnchor.endRow),
                    endColumn: Math.max(cell.spanAnchor.endColumn, spanAnchor.endColumn),
                };
            }
        }
    }

    if (hasValue) {
        range.endColumn = range.endColumn + rightOffset;
        return {
            spanAnchor,
            hasValue: true,
            range,
        };
    }

    return {
        spanAnchor: null,
        hasValue: false,
        range,
    };
}

function getExpandedRangeUp(range: IRange, allMatrixWithSpan: ObjectMatrix<IMatrixWithSpanInfo>, upOffset: number, isWorksheetHasSpan: boolean): IExpandedRangeResult {
    const { startRow, startColumn, endColumn } = range;
    let spanAnchor: IRange | null = null;
    let hasValue = false;
    for (let i = startColumn; i <= endColumn; i++) {
        const cell = allMatrixWithSpan.getValue(startRow - upOffset, i)!;
        hasValue = hasValue || hasValueFromMatrixWithSpanInfo(cell, allMatrixWithSpan);
        if (!isWorksheetHasSpan && hasValue) {
            break;
        }
        if (cell && cell.spanAnchor) {
            if (!spanAnchor) {
                spanAnchor = {
                    startRow: cell.spanAnchor.startRow,
                    startColumn: cell.spanAnchor.startColumn,
                    endRow: cell.spanAnchor.endRow,
                    endColumn: cell.spanAnchor.endColumn,
                };
            } else {
                spanAnchor = {
                    startRow: Math.min(cell.spanAnchor.startRow, spanAnchor.startRow),
                    startColumn: Math.min(cell.spanAnchor.startColumn, spanAnchor.startColumn),
                    endRow: Math.max(cell.spanAnchor.endRow, spanAnchor.endRow),
                    endColumn: Math.max(cell.spanAnchor.endColumn, spanAnchor.endColumn),
                };
            }
        }
    }

    if (hasValue) {
        range.startRow = range.startRow - upOffset;
        return {
            spanAnchor,
            hasValue: true,
            range,
        };
    }
    return {
        spanAnchor: null,
        hasValue: false,
        range,
    };
}

function getExpandedRangeDown(range: IRange, allMatrixWithSpan: ObjectMatrix<IMatrixWithSpanInfo>, downOffset: number, isWorksheetHasSpan: boolean): IExpandedRangeResult {
    const { startColumn, endColumn, endRow } = range;
    let spanAnchor: IRange | null = null;
    let hasValue = false;
    for (let i = startColumn; i <= endColumn; i++) {
        const cell = allMatrixWithSpan.getValue(endRow + downOffset, i)!;
        hasValue = hasValue || hasValueFromMatrixWithSpanInfo(cell, allMatrixWithSpan);
        if (!isWorksheetHasSpan && hasValue) {
            break;
        }
        if (cell && cell.spanAnchor) {
            if (!spanAnchor) {
                spanAnchor = {
                    startRow: cell.spanAnchor.startRow,
                    startColumn: cell.spanAnchor.startColumn,
                    endRow: cell.spanAnchor.endRow,
                    endColumn: cell.spanAnchor.endColumn,
                };
            } else {
                spanAnchor = {
                    startRow: Math.min(cell.spanAnchor.startRow, spanAnchor.startRow),
                    startColumn: Math.min(cell.spanAnchor.startColumn, spanAnchor.startColumn),
                    endRow: Math.max(cell.spanAnchor.endRow, spanAnchor.endRow),
                    endColumn: Math.max(cell.spanAnchor.endColumn, spanAnchor.endColumn),
                };
            }
        }
    }

    if (hasValue) {
        range.endRow = range.endRow + downOffset;
        return {
            spanAnchor,
            hasValue: true,
            range,
        };
    }
    return {
        spanAnchor: null,
        hasValue: false,
        range,
    };
}
// the demo unit=YSvbxFMCTxugbku-IWNyxQ&type=2&subunit=U_wr1DEF84N_mbesFNmxR in pro
// The excel behavior rules:
// 1. If the range has a span, the range should expand to whole span range.
// 2. If range left, right, up, down has value, the range should expand to the cell which has value.
// 3. If the range has no value, the range should not expand.
// 4. If the merge has span, the every cell value in span should be the anchor of the span range.
// 5. The span range should be not part in the result range.

/**
 *  Expand the range to a continuous range, it uses when Ctrl + A , or only one cell selected to add a pivot table adn so on.
 * @param {IRange} startRange The start range.
 * @param {IExpandParams} directions The directions to expand.
 * @param {Worksheet} worksheet The worksheet working on.
 * @returns {IRange} The expanded range.
 */
export function expandToContinuousRange(startRange: IRange, directions: IExpandParams, worksheet: Worksheet): IRange {
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();
    const allMatrixWithSpan = getMatrixWithSpanInfo(worksheet, 0, 0, maxRow - 1, maxColumn - 1);

    const worksheetHasSpan = worksheet.getSnapshot().mergeData.length > 0;
    const { left, right, up, down } = directions;
    let changed = true;
    let destRange = { ...startRange };
    const spanAnchors: IRange[] = [];

    while (changed) {
        changed = false;
        if (up && destRange.startRow !== 0) {
            const { hasValue, range, spanAnchor } = getExpandedRangeUp(destRange, allMatrixWithSpan, 1, worksheetHasSpan);
            if (spanAnchor) {
                spanAnchors.push(spanAnchor);
            }
            if (hasValue) {
                destRange = range;
                changed = true;
                continue;
            }
        }
        if (down && destRange.endRow !== maxRow - 1) {
            const { hasValue, range, spanAnchor } = getExpandedRangeDown(destRange, allMatrixWithSpan, 1, worksheetHasSpan);
            if (spanAnchor) {
                spanAnchors.push(spanAnchor);
            }

            if (hasValue) {
                destRange = range;
                changed = true;
                continue;
            }
        }
        if (left && destRange.startColumn !== 0) {
            const { hasValue, range, spanAnchor } = getExpandedRangeLeft(destRange, allMatrixWithSpan, 1, worksheetHasSpan);
            if (spanAnchor) {
                spanAnchors.push(spanAnchor);
            }
            if (hasValue) {
                destRange = range;
                changed = true;
                continue;
            }
        }
        if (right && destRange.endColumn !== maxColumn - 1) {
            const { hasValue, range, spanAnchor } = getExpandedRangeRight(destRange, allMatrixWithSpan, 1, worksheetHasSpan);
            if (spanAnchor) {
                spanAnchors.push(spanAnchor);
            }
            if (hasValue) {
                destRange = range;
                changed = true;
                continue;
            }
        }
    }
    if (spanAnchors.length > 0) {
        destRange = Rectangle.union(destRange, ...spanAnchors);
    }

    return destRange;
}
