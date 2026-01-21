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
import { IUniverInstanceService, mergeIntervals, ObjectMatrix, UniverInstanceType } from '@univerjs/core';
import { getSheetCommandTarget } from '../commands/commands/utils/target-util';

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
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
    if (!target) {
        return ranges;
    }

    const { worksheet } = target;
    const intervalsRanges: Array<{
        startColumn: number;
        endColumn: number;
        rowIntervals: [number, number][];
    }> = [];

    for (const range of ranges) {
        const { startRow, endRow, startColumn, endColumn } = range;

        const rowIntervals: [number, number][] = [];
        let intervalStartRow = startRow;

        for (let r = startRow; r <= endRow; r++) {
            if (worksheet.getRowFiltered(r)) {
                if (intervalStartRow < r) {
                    rowIntervals.push([intervalStartRow, r - 1]);
                }
                intervalStartRow = r + 1;
            } else if (r === endRow) {
                rowIntervals.push([intervalStartRow, endRow]);
            }
        }

        const findIndex = intervalsRanges.findIndex((item) => item.startColumn === startColumn && item.endColumn === endColumn);

        if (findIndex > -1) {
            intervalsRanges[findIndex].rowIntervals = intervalsRanges[findIndex].rowIntervals.concat(rowIntervals);
        } else {
            intervalsRanges.push({
                startColumn,
                endColumn,
                rowIntervals,
            });
        }
    }

    const visibleRanges: IRange[] = [];

    for (const item of intervalsRanges) {
        const { startColumn, endColumn, rowIntervals } = item;
        const mergedRowIntervals = mergeIntervals(rowIntervals);

        for (const [startRow, endRow] of mergedRowIntervals) {
            visibleRanges.push({
                startRow,
                endRow,
                startColumn,
                endColumn,
            });
        }
    }

    return visibleRanges;
}
