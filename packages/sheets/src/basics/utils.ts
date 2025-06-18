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

function cellHasValue(cell: Nullable<ICellData>): boolean {
    if (cell === undefined || cell === null) {
        return false;
    }
    return (cell.v !== undefined && cell.v !== null && cell.v !== '') || cell.p !== undefined;
}

export function findFirstNonEmptyCell(range: IRange, worksheet: Worksheet): IRange | null {
    for (let row = range.startRow; row <= range.endRow; row++) {
        for (let col = range.startColumn; col <= range.endColumn; col++) {
            const cell = worksheet.getCell(row, col);
            if (cellHasValue(cell)) {
                return { startRow: row, startColumn: col, endRow: row, endColumn: col };
            }
        }
    }

    return null;
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

export function rangeToDiscreteRange(range: IRange, accessor: IAccessor, unitId?: string, subUnitId?: string): IDiscreteRange | null {
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
            rows.push(r);
        }
    }
    for (let c = startColumn; c <= endColumn; c++) {
        cols.push(c);
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
        const discreteRange = rangeToDiscreteRange(range, accessor, unitId, subUnitId);

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
