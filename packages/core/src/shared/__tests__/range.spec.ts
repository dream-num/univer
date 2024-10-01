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

import { describe, expect, it } from 'vitest';

import { AbsoluteRefType } from '../../sheets/typedef';
import { mergeHorizontalRanges, mergeRanges, mergeVerticalRanges, moveRangeByOffset, splitIntoGrid } from '../range';
import type { IRange } from '../../sheets/typedef';

const stringifyRanges = (ranges: IRange[]) => {
    return ranges.sort((a, b) => a.startRow - b.startRow || a.startColumn - b.startColumn).map((range) => `${range.startRow},${range.startColumn},${range.endRow},${range.endColumn}`);
};

describe('test moveRangeByOffset', () => {
    it('test normal', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        };
        const newRange = moveRangeByOffset(range, 1, 1);
        expect(newRange).toEqual({
            startRow: 2,
            startColumn: 2,
            endRow: 4,
            endColumn: 4,
        });
    });

    it('test absolute', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        };
        const newRange = moveRangeByOffset(range, 1, 1);
        expect(newRange).toEqual({
            startRow: 1,
            startColumn: 2,
            endRow: 4,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        });
    });

    it('test ignoreAbsolute', () => {
        const range = {
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        };
        const newRange = moveRangeByOffset(range, 1, 1, true);
        expect(newRange).toEqual({
            startRow: 2,
            startColumn: 2,
            endRow: 4,
            endColumn: 4,
            startAbsoluteRefType: AbsoluteRefType.ROW,
            endAbsoluteRefType: AbsoluteRefType.COLUMN,
        });
    });
});

// Test cases
describe('splitIntoGrid', () => {
    it('should split and align ranges into grid cells', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 2 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 2, endRow: 2 },
        ];

        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle no ranges', () => {
        const input: IRange[] = [];
        const expected: IRange[] = [];
        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle single range', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
        ];
        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
        ];
        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle full overlap range', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
        ];
        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
        ];
        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle simple case', () => {
        const input = [{ startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 }, { startColumn: 6, endColumn: 8, startRow: 1, endRow: 2 }];
        const expected = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 2, endRow: 2 },
        ];

        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle this case', () => {
        const input = [
            {
                startColumn: 0,
                endColumn: 5,
                startRow: 6,
                endRow: 10,
            },
            {
                startColumn: 6,
                startRow: 8,
                endColumn: 7,
                endRow: 8,
            },
        ];

        const expected: IRange[] = [
            { startColumn: 0, endColumn: 5, startRow: 6, endRow: 7 },
            { startColumn: 0, endColumn: 5, startRow: 8, endRow: 8 },
            { startColumn: 6, endColumn: 7, startRow: 8, endRow: 8 },
            { startColumn: 0, endColumn: 5, startRow: 9, endRow: 10 },
        ];

        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle small range', () => {
        const input = [{ startColumn: 1, endColumn: 1, startRow: 1, endRow: 1 }, { startColumn: 1, endColumn: 1, startRow: 2, endRow: 2 }, { startColumn: 2, endColumn: 2, startRow: 1, endRow: 1 }, { startColumn: 2, endColumn: 2, startRow: 2, endRow: 2 }, { startColumn: 1, endColumn: 1, startRow: 2, endRow: 2 }];
        const expected = [{ startColumn: 1, endColumn: 1, startRow: 1, endRow: 1 }, { startColumn: 1, endColumn: 1, startRow: 2, endRow: 2 }, { startColumn: 2, endColumn: 2, startRow: 1, endRow: 1 }, { startColumn: 2, endColumn: 2, startRow: 2, endRow: 2 }];
        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle overlapping ranges correctly', () => {
        const input = [
            {
                startColumn: 1,
                endColumn: 4,
                startRow: 1,
                endRow: 4,
            },
            {
                startColumn: 1,
                startRow: 1,
                endColumn: 5,
                endRow: 4,
            },
        ];

        const expected: IRange[] = [
            {
                startColumn: 1,
                endColumn: 4,
                startRow: 1,
                endRow: 4,
            },
            {
                startColumn: 5,
                startRow: 1,
                endColumn: 5,
                endRow: 4,
            },
        ];

        expect(stringifyRanges(splitIntoGrid(input))).toEqual(stringifyRanges(expected));
    });
});

describe('mergeHorizontalRanges', () => {
    it('should merge contiguous ranges horizontally', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 1 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 1 },
        ];

        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle ranges with gaps', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 1 },
            { startColumn: 5, endColumn: 7, startRow: 1, endRow: 1 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 1 },
            { startColumn: 5, endColumn: 7, startRow: 1, endRow: 1 },
        ];

        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle overlapping ranges', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 4, endColumn: 8, startRow: 1, endRow: 1 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 1 },
        ];

        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle multiple rows independently', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 1 },
            { startColumn: 1, endColumn: 3, startRow: 2, endRow: 2 },
            { startColumn: 4, endColumn: 7, startRow: 2, endRow: 2 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 1 },
            { startColumn: 1, endColumn: 7, startRow: 2, endRow: 2 },
        ];

        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle single range', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 1 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 1 },
        ];

        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle no ranges', () => {
        const input: IRange[] = [];
        const expected: IRange[] = [];
        expect(mergeHorizontalRanges(input)).toEqual(expected);
    });

    it('should handle complex ranges', () => {
        const input = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 2 },
            { startColumn: 2, endColumn: 2, startRow: 1, endRow: 2 },
            { startColumn: 3, endColumn: 3, startRow: 1, endRow: 2 },
            { startColumn: 4, endColumn: 4, startRow: 1, endRow: 2 },
            { startColumn: 5, endColumn: 5, startRow: 1, endRow: 2 },
            { startColumn: 6, endColumn: 6, startRow: 1, endRow: 2 },
            { startColumn: 7, endColumn: 7, startRow: 1, endRow: 2 },
        ];
        const expected = [{ startColumn: 1, endColumn: 7, startRow: 1, endRow: 2 }];
        expect(stringifyRanges(mergeHorizontalRanges(input))).toEqual(stringifyRanges(expected));
    });
});

// Test cases
describe('mergeVerticalRanges', () => {
    it('should merge contiguous ranges vertically', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 5 },
            { startColumn: 1, endColumn: 1, startRow: 6, endRow: 10 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 10 },
        ];

        expect(mergeVerticalRanges(input)).toEqual(expected);
    });

    it('should handle ranges with gaps', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 3 },
            { startColumn: 1, endColumn: 1, startRow: 5, endRow: 7 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 3 },
            { startColumn: 1, endColumn: 1, startRow: 5, endRow: 7 },
        ];

        expect(stringifyRanges(mergeVerticalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle overlapping ranges', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 5 },
            { startColumn: 1, endColumn: 1, startRow: 4, endRow: 8 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 8 },
        ];

        expect(stringifyRanges(mergeVerticalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle multiple columns independently', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 5 },
            { startColumn: 2, endColumn: 2, startRow: 1, endRow: 5 },
            { startColumn: 1, endColumn: 1, startRow: 6, endRow: 8 },
            { startColumn: 2, endColumn: 2, startRow: 6, endRow: 8 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 1, startRow: 1, endRow: 8 },
            { startColumn: 2, endColumn: 2, startRow: 1, endRow: 8 },
        ];

        expect(stringifyRanges(mergeVerticalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle single range', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 2 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 2 },
        ];

        expect(stringifyRanges(mergeVerticalRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle no ranges', () => {
        const input: IRange[] = [];
        const expected: IRange[] = [];
        expect(mergeVerticalRanges(input)).toEqual(expected);
    });

    it('should handle this case', () => {
        const input: IRange[] = [
            { startColumn: 0, endColumn: 5, startRow: 6, endRow: 7 },
            { startColumn: 0, endColumn: 7, startRow: 8, endRow: 8 },
            { startColumn: 0, endColumn: 5, startRow: 9, endRow: 10 },
        ];

        expect(stringifyRanges(mergeVerticalRanges(input))).toEqual(stringifyRanges(input));
    });
});

describe('mergeRanges', () => {
    it('should merge ranges correctly', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 2 },
            { startColumn: 6, endColumn: 8, startRow: 1, endRow: 2 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 8, startRow: 1, endRow: 2 },
        ];

        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle no ranges', () => {
        const input: IRange[] = [];
        const expected: IRange[] = [];
        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle single range', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 3 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 3 },
        ];

        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle ranges with gaps', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
            { startColumn: 5, endColumn: 7, startRow: 1, endRow: 2 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 3, startRow: 1, endRow: 2 },
            { startColumn: 5, endColumn: 7, startRow: 1, endRow: 2 },
        ];

        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle multiple ranges in multiple rows and columns', () => {
        const input: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 1 },
            { startColumn: 5, endColumn: 5, startRow: 2, endRow: 5 },
            { startColumn: 1, endColumn: 4, startRow: 2, endRow: 5 },
        ];

        const expected: IRange[] = [
            { startColumn: 1, endColumn: 5, startRow: 1, endRow: 5 },
        ];

        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });

    it('should handle this case', () => {
        const input = [
            {
                startColumn: 0,
                endColumn: 5,
                startRow: 6,
                endRow: 10,
            },
            {
                startColumn: 4,
                startRow: 8,
                endColumn: 7,
                endRow: 8,
            },
        ];

        const expected: IRange[] = [
            { startColumn: 0, endColumn: 5, startRow: 6, endRow: 7 },
            { startColumn: 0, endColumn: 7, startRow: 8, endRow: 8 },
            { startColumn: 0, endColumn: 5, startRow: 9, endRow: 10 },
        ];
        expect(stringifyRanges(mergeRanges(input))).toEqual(stringifyRanges(expected));
    });
});
