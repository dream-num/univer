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

import { RANGE_TYPE } from '@univerjs/core';

import { describe, expect, it } from 'vitest';
import { checkMoveEdge, OriginRangeEdgeType } from '../ref-range-move';

describe('checkMoveEdge', () => {
    it('should return ALL when originRange is completely within fromRange', () => {
        const originRange = {
            startRow: 2,
            endRow: 4,
            startColumn: 2,
            endColumn: 4,
        };

        const fromRange = {
            startRow: 1,
            endRow: 5,
            startColumn: 1,
            endColumn: 5,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.ALL);
    });

    it('should return UP when fromRange is at the top edge of originRange', () => {
        const originRange = {
            startRow: 2,
            endRow: 6,
            startColumn: 2,
            endColumn: 4,
        };

        const fromRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 4,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.UP);
    });

    it('should return DOWN when fromRange is at the bottom edge of originRange', () => {
        const originRange = {
            startRow: 1,
            endRow: 4,
            startColumn: 2,
            endColumn: 4,
        };

        const fromRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 4,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.DOWN);
    });

    it('should return LEFT when fromRange is at the left edge of originRange', () => {
        const originRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 6,
        };

        const fromRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 5,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.LEFT);
    });

    it('should return RIGHT when fromRange is at the right edge of originRange', () => {
        const originRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 1,
            endColumn: 4,
        };

        const fromRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 4,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.RIGHT);
    });

    it('should return null when fromRange is outside originRange', () => {
        const originRange = {
            startRow: 6,
            endRow: 8,
            startColumn: 6,
            endColumn: 8,
        };

        const fromRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 2,
            endColumn: 5,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBeNull();
    });

    it('should handle NaN values correctly when originRange is an entire row', () => {
        const originRange = {
            startRow: 2,
            endRow: 3,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ROW,
        };

        const fromRange = {
            startRow: 2,
            endRow: 2,
            startColumn: 0,
            endColumn: 10,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBeNull();

        const originRange2 = {
            startRow: 2,
            endRow: 3,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ROW,
        };

        const fromRange2 = {
            startRow: 2,
            endRow: 2,
            startColumn: 0,
            endColumn: 10,
            rangeType: RANGE_TYPE.ROW,
        };

        expect(checkMoveEdge(originRange2, fromRange2)).toBe(OriginRangeEdgeType.UP);
    });

    it('should handle NaN values correctly when originRange is an entire column', () => {
        const originRange = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: 3,
            endColumn: 4,
            rangeType: RANGE_TYPE.COLUMN,
        };

        const fromRange = {
            startRow: 0,
            endRow: 10,
            startColumn: 3,
            endColumn: 3,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBeNull();

        const originRange2 = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: 3,
            endColumn: 4,
            rangeType: RANGE_TYPE.COLUMN,
        };

        const fromRange2 = {
            startRow: 0,
            endRow: 10,
            startColumn: 3,
            endColumn: 3,
            rangeType: RANGE_TYPE.COLUMN,
        };

        expect(checkMoveEdge(originRange2, fromRange2)).toBe(OriginRangeEdgeType.LEFT);
    });

    it('should handle NaN values correctly when originRange is the entire sheet', () => {
        const originRange = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ALL,
        };

        const fromRange = {
            startRow: 0,
            endRow: 100,
            startColumn: 0,
            endColumn: 100,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBeNull();

        const originRange2 = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ALL,
        };

        const fromRange2 = {
            startRow: 0,
            endRow: 100,
            startColumn: 0,
            endColumn: 100,
            rangeType: RANGE_TYPE.ALL,
        };

        expect(checkMoveEdge(originRange2, fromRange2)).toBe(OriginRangeEdgeType.ALL);
    });

    it('should return UP when fromRange is at the top edge of originRange (an entire row)', () => {
        const originRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 1,
            endColumn: 10,
        };

        const fromRange = {
            startRow: 2,
            endRow: 4,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ROW,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.UP);
    });

    it('should return DOWN when fromRange is at the bottom edge of originRange (an entire row)', () => {
        const originRange = {
            startRow: 2,
            endRow: 5,
            startColumn: 1,
            endColumn: 10,
        };

        const fromRange = {
            startRow: 3,
            endRow: 5,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ROW,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.DOWN);
    });

    it('should return LEFT when fromRange is at the left edge of originRange (an entire column)', () => {
        const originRange = {
            startRow: 1,
            endRow: 10,
            startColumn: 3,
            endColumn: 5,
        };

        const fromRange = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: 3,
            endColumn: 4,
            rangeType: RANGE_TYPE.COLUMN,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.LEFT);
    });

    it('should return RIGHT when fromRange is at the right edge of originRange (an entire column)', () => {
        const originRange = {
            startRow: 1,
            endRow: 10,
            startColumn: 2,
            endColumn: 4,
        };

        const fromRange = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: 3,
            endColumn: 4,
            rangeType: RANGE_TYPE.COLUMN,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.RIGHT);
    });

    it('should handle when fromRange is entirely unbounded (entire sheet)', () => {
        const originRange = {
            startRow: 0,
            endRow: 100,
            startColumn: 0,
            endColumn: 100,
        };

        const fromRange = {
            startRow: Number.NaN,
            endRow: Number.NaN,
            startColumn: Number.NaN,
            endColumn: Number.NaN,
            rangeType: RANGE_TYPE.ALL,
        };

        expect(checkMoveEdge(originRange, fromRange)).toBe(OriginRangeEdgeType.ALL);
    });
});
