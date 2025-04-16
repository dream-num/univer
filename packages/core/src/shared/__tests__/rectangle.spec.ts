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

import { describe, expect, it } from 'vitest';
import { Range } from '../../sheets/range';
import { AbsoluteRefType } from '../../sheets/typedef';
import { ObjectMatrix } from '../object-matrix';
import { multiSubtractMultiRanges } from '../object-matrix-query';
import { Rectangle } from '../rectangle';
import type { IRange } from '../../sheets/typedef';

function rangesToMatrix(ranges: IRange[]) {
    // return JSON.stringify(ranges);
    const matrix = new ObjectMatrix<number>();
    ranges.forEach((range) => {
        Range.foreach(range, (row, col) => {
            matrix.setValue(row, col, 1);
        });
    });

    return matrix.getMatrix();
}

const cellToRange = (row: number, col: number) => ({ startRow: row, endRow: row, startColumn: col, endColumn: col } as IRange);
describe('test "Rectangle"', () => {
    it('test "subtract"', () => {
        // completely covered
        const rect1 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };

        const rect2 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };
        expect(Rectangle.subtract(rect1, rect2)).toEqual([]);

        // partly covered
        const rect3 = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };

        const rect4 = {
            startRow: 1,
            startColumn: 1,
            endRow: 1,
            endColumn: 1,
        };
        expect(Rectangle.subtract(rect3, rect4)).toStrictEqual([
            { startRow: 2, startColumn: 1, endRow: 3, endColumn: 3 },
            { startRow: 1, startColumn: 2, endRow: 1, endColumn: 3 },
        ]);

        // covered at center point
        const rect5 = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };

        const rect6 = {
            startRow: 2,
            startColumn: 2,
            endRow: 2,
            endColumn: 2,
        };

        expect(Rectangle.subtract(rect5, rect6)).toStrictEqual([
            { startRow: 1, startColumn: 1, endRow: 1, endColumn: 3 },
            { startRow: 3, startColumn: 1, endRow: 3, endColumn: 3 },
            { startRow: 2, startColumn: 1, endRow: 2, endColumn: 1 },
            { startRow: 2, startColumn: 3, endRow: 2, endColumn: 3 },
        ]);
    });

    it('test getRelativeRange', () => {
        const relativeRange = Rectangle.getRelativeRange({ startRow: 5, endRow: 6, startColumn: 5, endColumn: 6 }, cellToRange(10, 10));
        expect(relativeRange).toEqual({
            endColumn: 1,
            endRow: 1,
            startColumn: -5,
            startRow: -5,
        });
    });
    it('test getPositionRange', () => {
        const originRange = { startRow: 5, endRow: 6, startColumn: 5, endColumn: 6 };
        const relativeRange = Rectangle.getRelativeRange(originRange, cellToRange(10, 10));
        const positionRange = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11));
        expect(positionRange).toEqual({ startRow: 6, endRow: 7, startColumn: 6, endColumn: 7 });
        const positionRangeWithAbsoluteStartAll = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, startAbsoluteRefType: AbsoluteRefType.ALL });
        const positionRangeWithAbsoluteStartRow = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, startAbsoluteRefType: AbsoluteRefType.ROW });
        const positionRangeWithAbsoluteStartCol = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, startAbsoluteRefType: AbsoluteRefType.COLUMN });
        const positionRangeWithAbsoluteEndALl = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, endAbsoluteRefType: AbsoluteRefType.ALL });
        const positionRangeWithAbsoluteEndRow = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, endAbsoluteRefType: AbsoluteRefType.ROW });
        const positionRangeWithAbsoluteEndCol = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, endAbsoluteRefType: AbsoluteRefType.COLUMN });
        const positionRangeWithALl = Rectangle.getPositionRange(relativeRange, cellToRange(11, 11), { ...originRange, endAbsoluteRefType: AbsoluteRefType.ALL, startAbsoluteRefType: AbsoluteRefType.ALL });
        expect(positionRangeWithAbsoluteStartAll).toEqual({ ...originRange, endColumn: 7, endRow: 7, startAbsoluteRefType: AbsoluteRefType.ALL });
        expect(positionRangeWithAbsoluteStartRow).toEqual({ ...originRange, startColumn: 6, endColumn: 7, endRow: 7, startAbsoluteRefType: AbsoluteRefType.ROW });
        expect(positionRangeWithAbsoluteStartCol).toEqual({ ...originRange, startRow: 6, endColumn: 7, endRow: 7, startAbsoluteRefType: AbsoluteRefType.COLUMN });
        expect(positionRangeWithAbsoluteEndALl).toEqual({ ...originRange, startRow: 6, startColumn: 6, endAbsoluteRefType: AbsoluteRefType.ALL });
        expect(positionRangeWithAbsoluteEndRow).toEqual({ ...originRange, endColumn: 7, startRow: 6, startColumn: 6, endAbsoluteRefType: AbsoluteRefType.ROW });
        expect(positionRangeWithAbsoluteEndCol).toEqual({ ...originRange, endRow: 7, startRow: 6, startColumn: 6, endAbsoluteRefType: AbsoluteRefType.COLUMN });
        expect(positionRangeWithALl).toEqual({ ...originRange, endAbsoluteRefType: AbsoluteRefType.ALL, startAbsoluteRefType: AbsoluteRefType.ALL });
    });
});

describe('multiSubtractMulti', () => {
    it('should subtract a single range from another range', () => {
        const ranges1: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];
        const ranges2: IRange[] = [
            { startColumn: 2, endColumn: 4, startRow: 2, endRow: 4 },
        ];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });

    it('should handle subtracting multiple ranges from a single range', () => {
        const ranges1: IRange[] = [
            { startColumn: 1, endColumn: 10, startRow: 1, endRow: 10 },
        ];
        const ranges2: IRange[] = [
            { startColumn: 2, endColumn: 5, startRow: 2, endRow: 5 },
            { startColumn: 6, endColumn: 8, startRow: 6, endRow: 8 },
        ];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });

    it('should handle non-overlapping subtraction ranges', () => {
        const ranges1: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];
        const ranges2: IRange[] = [
            { startColumn: 6, endColumn: 8, startRow: 6, endRow: 8 },
        ];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });

    it('should handle subtraction ranges that completely overlap', () => {
        const ranges1: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];
        const ranges2: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });

    it('should handle empty ranges', () => {
        const ranges1: IRange[] = [];
        const ranges2: IRange[] = [
            { startColumn: 2, endColumn: 4, startRow: 2, endRow: 4 },
        ];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });

    it('should handle empty subtraction ranges', () => {
        const ranges1: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];
        const ranges2: IRange[] = [];
        const expected: IRange[] = multiSubtractMultiRanges(ranges1, ranges2);
        expect(rangesToMatrix(Rectangle.subtractMulti(ranges1, ranges2))).toEqual(rangesToMatrix(expected));
    });
});
