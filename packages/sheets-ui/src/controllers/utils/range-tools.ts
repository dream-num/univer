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

import type { IAccessor, ICellData, IObjectMatrixPrimitiveType, IRange, Workbook } from '@univerjs/core';
import { IUniverInstanceService, ObjectMatrix, UniverInstanceType } from '@univerjs/core';

export interface IDiscreteRange {
    rows: number[];
    cols: number[];
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

export function discreteRangeToRange(discreteRange: IDiscreteRange): IRange {
    const { rows, cols } = discreteRange;
    return {
        startRow: rows[0],
        endRow: rows[rows.length - 1],
        startColumn: cols[0],
        endColumn: cols[cols.length - 1],
    };
}

export function virtualizeDiscreteRanges(ranges: IDiscreteRange[]): {
    ranges: IRange[];
    mapFunc: (row: number, col: number) => { row: number; col: number };
} {
    let totalRows: number[] = [];
    let totalCols: number[] = [];
    const totalRanges: IRange[] = [];

    ranges.forEach((r) => {
        // Do not use destructuring, otherwise Maximum call stack size exceeded will occur
        totalRows = totalRows.concat(r.rows);
        totalCols = totalCols.concat(r.cols);
    });

    totalRows = Array.from(new Set(totalRows)).sort((a, b) => a - b);
    totalCols = Array.from(new Set(totalCols)).sort((a, b) => a - b);

    ranges.forEach((r) => {
        totalRanges.push({
            startRow: totalRows.findIndex((row) => row === r.rows[0]),
            endRow: totalRows.findIndex((row) => row === r.rows[r.rows.length - 1]),
            startColumn: totalCols.findIndex((col) => col === r.cols[0]),
            endColumn: totalCols.findIndex((col) => col === r.cols[r.cols.length - 1]),
        });
    });

    return {
        ranges: totalRanges,
        mapFunc: (row, col) => (
            {
                row: totalRows[row],
                col: totalCols[col],
            }
        ),
    };
}

export function generateNullCellValueRowCol(range: IDiscreteRange[]): IObjectMatrixPrimitiveType<ICellData> {
    const cellValue = new ObjectMatrix<ICellData>();
    range.forEach((r) => {
        const { rows, cols } = r;
        rows.forEach((i) => {
            cols.forEach((j) => {
                cellValue.setValue(i, j, {
                    v: null,
                    p: null,
                    f: null,
                    si: null,
                    custom: null,
                });
            });
        });
    });

    return cellValue.getData();
}
