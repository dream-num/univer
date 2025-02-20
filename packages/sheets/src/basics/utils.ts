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

import type { IAccessor, ICellData, IObjectMatrixPrimitiveType, IRange, Nullable, UniverInstanceService, Workbook, Worksheet } from '@univerjs/core';
import type { IExpandParams } from '../commands/commands/utils/selection-utils';
import type { IDiscreteRange } from './interfaces';
import { IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';

export const groupByKey = <T = Record<string, unknown>>(arr: T[], key: string, blankKey = '') => {
    return arr.reduce(
        (result, current) => {
            const value = current && ((current as Record<string, unknown>)[key] as string);

            if (typeof value !== 'string') {
                console.warn(current, `${key} is not string`);
                return result;
            }

            if (value) {
                if (!result[value]) {
                    result[value] = [];
                }
                result[value].push(current);
            } else {
                result[blankKey].push(current);
            }
            return result;
        },
        {} as Record<string, T[]>
    );
};

export const createUniqueKey = (initValue = 0) => {
    let _initValue = initValue;
    /**
     * Increments 1 per call
     */
    return function getKey() {
        return _initValue++;
    };
};

function cellHasValue(cell: ICellData | undefined): boolean {
    if (cell === undefined || cell === null) {
        return false;
    }
    return (cell.v !== undefined && cell.v !== null && cell.v !== '') || cell.p !== undefined;
}

// eslint-disable-next-line max-lines-per-function
export function expandToContinuousRange(startRange: IRange, directions: IExpandParams, worksheet: Worksheet): IRange {
    const { left, right, up, down } = directions;
    const maxRow = worksheet.getMaxRows();
    const maxColumn = worksheet.getMaxColumns();

    let changed = true;
    const destRange: IRange = { ...startRange }; // startRange should not be used below

    const allMatrix = worksheet.getMatrixWithMergedCells(0, 0, maxRow - 1, maxColumn - 1);
    while (changed) {
        changed = false;

        if (up && destRange.startRow !== 0) {
            // see if there are value in the upper row of contents
            // set `changed` to true if `startRow` really changes
            const destRow = destRange.startRow - 1; // it may decrease if there are merged cell

            const checkRange = {
                startRow: destRow,
                startColumn: destRange.startColumn,
                endRow: destRow,
                endColumn: destRange.endColumn,
            };
            for (let col = checkRange.startColumn; col <= checkRange.endColumn; col++) {
                const cell = allMatrix.getValue(checkRange.startRow, col)!;
                if (cellHasValue(cell)) {
                    destRange.startRow = Math.min(checkRange.startRow, destRange.startRow);
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            }
        }

        if (down && destRange.endRow !== maxRow - 1) {
            const destRow = destRange.endRow + 1;
            const checkRange = {
                startRow: destRow,
                startColumn: destRange.startColumn,
                endRow: destRow,
                endColumn: destRange.endColumn,
            };
            for (let col = checkRange.startColumn; col <= checkRange.endColumn; col++) {
                const cellValue = allMatrix.getValue(checkRange.startRow, col)!;
                if (cellHasValue(cellValue)) {
                    destRange.endRow = Math.max(checkRange.endRow, destRange.endRow);
                    destRange.endRow = Math.max(
                        checkRange.endRow + (cellValue.rowSpan !== undefined ? cellValue.rowSpan - 1 : 0),
                        destRange.endRow
                    );
                    destRange.startColumn = Math.min(col, destRange.startColumn);
                    destRange.endColumn = Math.max(col, destRange.endColumn);
                    changed = true;
                }
            }
        }

        if (left && destRange.startColumn !== 0) {
            const destCol = destRange.startColumn - 1;
            const checkRange = {
                startRow: destRange.startRow,
                startColumn: destCol,
                endRow: destRange.endRow,
                endColumn: destCol,
            };
            for (let row = checkRange.startRow; row <= checkRange.endRow; row++) {
                const cell = allMatrix.getValue(row, checkRange.startColumn)!;
                if (cellHasValue(cell)) {
                    destRange.startColumn = Math.min(checkRange.startColumn, destRange.startColumn);
                    destRange.startRow = Math.min(row, destRange.startRow);
                    destRange.endRow = Math.max(row, destRange.endRow);
                    changed = true;
                }
            }
        }

        if (right && destRange.endColumn !== maxColumn - 1) {
            const destCol = destRange.endColumn + 1;
            const checkRange = {
                startRow: destRange.startRow,
                startColumn: destCol,
                endRow: destRange.endRow,
                endColumn: destCol,
            };
            for (let row = checkRange.startRow; row <= checkRange.endRow; row++) {
                const cellValue = allMatrix.getValue(row, checkRange.endColumn)!;
                if (cellHasValue(cellValue)) {
                    destRange.endColumn = Math.max(
                        checkRange.endColumn + (cellValue.colSpan !== undefined ? cellValue.colSpan - 1 : 0),
                        destRange.endColumn
                    );
                    changed = true;
                }
            }
        }
    }

    return destRange;
}
/**
 * Generate cellValue from range and set null
 * @param range
 * @returns
 */
export function generateNullCell(range: IRange[]): IObjectMatrixPrimitiveType<Nullable<ICellData>> {
    const cellValue = new ObjectMatrix<Nullable<ICellData>>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, null);
            }
        }
    });

    return cellValue.clone();
}

/**
 * Generate cellValue from range and set v/p/f/si/custom to null
 * @param range
 * @returns
 */
export function generateNullCellValue(range: IRange[]): IObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;
        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, {
                    v: null,
                    p: null,
                    f: null,
                    si: null,
                    custom: null,
                });
            }
        }
    });

    return cellValue.clone();
}

// Generate cellValue from range and set s to null
export function generateNullCellStyle(ranges: IRange[]): IObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();

    ranges.forEach((range: IRange) => {
        const { startRow, startColumn, endRow, endColumn } = range;

        for (let i = startRow; i <= endRow; i++) {
            for (let j = startColumn; j <= endColumn; j++) {
                cellValue.setValue(i, j, {
                    s: null,
                });
            }
        }
    });

    return cellValue.clone();
}

export function getActiveWorksheet(instanceService: UniverInstanceService): [Nullable<Workbook>, Nullable<Worksheet>] {
    const workbook = instanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const worksheet = workbook?.getActiveSheet();
    return [workbook, worksheet];
}

export function rangeToDiscreteRange(range: IRange, accessor: IAccessor, unitId?: string, subUnitId?: string, considerHide?: boolean): IDiscreteRange | null {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = unitId
        ? univerInstanceService.getUnit<Workbook>(unitId, UniverInstanceType.UNIVER_SHEET)
        : univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    const worksheet = subUnitId ? workbook?.getSheetBySheetId(subUnitId) : workbook?.getActiveSheet();
    if (!worksheet) {
        return null;
    }
    const { startRow, endRow, startColumn, endColumn } = range;

    const rows = [];
    const cols = [];
    for (let r = startRow; r <= endRow; r++) {
        if (!worksheet.getRowFiltered(r)) {
            if (considerHide) {
                if (worksheet.getRowRawVisible(r)) {
                    rows.push(r);
                }
            } else {
                rows.push(r);
            }
        }
    }
    for (let c = startColumn; c <= endColumn; c++) {
        if (considerHide) {
            if (worksheet.getColVisible(c)) {
                cols.push(c);
            }
        } else {
            cols.push(c);
        }
    }
    return {
        rows,
        cols,
    };
}

export function getVisibleRanges(ranges: IRange[], accessor: IAccessor, unitId?: string, subUnitId?: string): IRange[] {
    const allRows: number[] = [];
    const allCols: number[] = [];

    for (const range of ranges) {
        const discreteRange = rangeToDiscreteRange(range, accessor, unitId, subUnitId, true);

        if (discreteRange) {
            allRows.push(...discreteRange.rows);
            allCols.push(...discreteRange.cols);
        }
    }

    const uniqueRows = Array.from(new Set(allRows)).sort((a, b) => a - b);
    const uniqueCols = Array.from(new Set(allCols)).sort((a, b) => a - b);

    const visibleRanges: IRange[] = [];

    function findContinuousSegments(arr: number[]): number[][] {
        const segments: number[][] = [];
        let start = arr[0];

        for (let i = 1; i < arr.length; i++) {
            if (arr[i] !== arr[i - 1] + 1) {
                segments.push([start, arr[i - 1]]);
                start = arr[i];
            }
        }
        segments.push([start, arr[arr.length - 1]]);
        return segments;
    }

    const rowSegments = findContinuousSegments(uniqueRows);
    const colSegments = findContinuousSegments(uniqueCols);

    for (const [startRow, endRow] of rowSegments) {
        for (const [startCol, endCol] of colSegments) {
            visibleRanges.push({
                startRow,
                endRow,
                startColumn: startCol,
                endColumn: endCol,
            });
        }
    }

    return visibleRanges;
}
