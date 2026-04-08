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

import { Direction, RANGE_TYPE } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    checkIfShrink,
    expandToNextCell,
    expandToWholeSheet,
    findNextGapRange,
    findNextRange,
    getMergeableSelectionsByType,
    getStartRange,
    isAllColumnsCovered,
    isAllRowsCovered,
    MergeType,
    shrinkToNextCell,
} from '../utils/selection-utils';

vi.mock('@univerjs/sheets', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets')>();
    return {
        ...actual,
        alignToMergedCellsBorders: (range: any) => range,
    };
});

function createMatrix(hasValue = false) {
    return {
        forValue: (cb: (...args: any[]) => void) => {
            if (hasValue) {
                cb(0, 0, { v: 1 });
            }
            return {
                getLength: () => (hasValue ? 1 : 0),
                forValue: (cb2: (...args: any[]) => void) => {
                    if (hasValue) {
                        cb2(0, 0, { v: 1 });
                    }
                },
            };
        },
    };
}

function createWorksheet() {
    return {
        getRowCount: () => 6,
        getColumnCount: () => 6,
        getRowVisible: (row: number) => row !== 1,
        getColVisible: (col: number) => col !== 1,
        getMatrixWithMergedCells: (_sr: number, _sc: number, _er: number, _ec: number) => createMatrix(false),
    };
}

describe('Test selection utils', () => {
    it('Function isAllRowsCovered', () => {
        // single range
        expect(
            isAllRowsCovered(
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }],
                [{ startRow: 0, endRow: 1, startColumn: Number.NaN, endColumn: Number.NaN }]
            )
        ).toBeFalsy();

        expect(
            isAllRowsCovered(
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }],
                [{ startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN }]
            )
        ).toBeTruthy();

        // multiple range
        expect(
            isAllRowsCovered(
                [
                    { startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ],
                [
                    { startRow: 100, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1500, startColumn: Number.NaN, endColumn: Number.NaN },
                ]
            )
        ).toBeFalsy();

        expect(
            isAllRowsCovered(
                [
                    { startRow: 0, endRow: 999, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ],
                [
                    { startRow: 0, endRow: 1500, startColumn: Number.NaN, endColumn: Number.NaN },
                    { startRow: 1000, endRow: 1999, startColumn: Number.NaN, endColumn: Number.NaN },
                ]
            )
        ).toBeTruthy();
    });

    it('Function isAllColumnsCovered', () => {
        // single range
        expect(
            isAllColumnsCovered(
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }],
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 1 }]
            )
        ).toBeFalsy();

        expect(
            isAllColumnsCovered(
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }],
                [{ startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 }]
            )
        ).toBeTruthy();

        // multiple range
        expect(
            isAllColumnsCovered(
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ],
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 100, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1500 },
                ]
            )
        ).toBeFalsy();

        expect(
            isAllColumnsCovered(
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 999 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ],
                [
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 0, endColumn: 1500 },
                    { startRow: Number.NaN, endRow: Number.NaN, startColumn: 1000, endColumn: 1999 },
                ]
            )
        ).toBeTruthy();
    });

    it('findNextRange should move with hidden rows/cols and wrap in boundary', () => {
        const worksheet = createWorksheet();
        const start = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
        expect(findNextRange(start as any, Direction.DOWN, worksheet as any)).toEqual({ ...start, startRow: 2, endRow: 2 });
        expect(findNextRange(start as any, Direction.RIGHT, worksheet as any)).toEqual({ ...start, startColumn: 2, endColumn: 2 });
        expect(findNextRange(start as any, Direction.LEFT, worksheet as any)).toEqual({ startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 });
    });

    it('findNextGapRange should continue to gap boundary on empty ranges', () => {
        const worksheet = createWorksheet();
        const start = { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 };
        expect(findNextGapRange(start as any, Direction.RIGHT, worksheet as any)).toEqual({ startRow: 0, endRow: 0, startColumn: 5, endColumn: 5 });
        expect(findNextGapRange(start as any, Direction.DOWN, worksheet as any)).toEqual({ startRow: 5, endRow: 5, startColumn: 0, endColumn: 0 });
    });

    it('expand/shrink helpers should return expected ranges', () => {
        const worksheet = createWorksheet();
        const start = { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 };

        expect(expandToNextCell(start as any, Direction.RIGHT, worksheet as any)).toEqual(expect.objectContaining({
            startRow: 2,
            endRow: 2,
            startColumn: 2,
            endColumn: 3,
        }));
        expect(shrinkToNextCell({ startRow: 2, endRow: 2, startColumn: 2, endColumn: 4 } as any, Direction.RIGHT, worksheet as any)).toEqual(expect.objectContaining({
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 4,
        }));
        expect(expandToWholeSheet(worksheet as any)).toEqual({
            startRow: 0,
            startColumn: 0,
            endRow: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.ALL,
        });
    });

    it('getStartRange and checkIfShrink should follow direction and primary cell', () => {
        const range = { startRow: 0, endRow: 3, startColumn: 0, endColumn: 3 };
        const primary = { actualRow: 2, actualColumn: 1, startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 };
        const worksheet = createWorksheet();

        expect(getStartRange(range as any, primary as any, Direction.DOWN)).toEqual({ ...range, startColumn: 1, endColumn: 1 });
        expect(getStartRange(range as any, primary as any, Direction.RIGHT)).toEqual({ ...range, startRow: 2, endRow: 2 });
        expect(checkIfShrink({ range, primary } as any, Direction.DOWN, worksheet as any)).toBe(true);
        expect(checkIfShrink({ range, primary: { ...primary, startColumn: 0, endColumn: 0 } } as any, Direction.RIGHT, worksheet as any)).toBe(false);
    });

    it('getMergeableSelectionsByType should filter single-cell ranges by merge mode', () => {
        const selections = [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        ];

        expect(getMergeableSelectionsByType(MergeType.MergeAll, selections as any)?.length).toBe(3);
        expect(getMergeableSelectionsByType(MergeType.MergeVertical, selections as any)?.length).toBe(2);
        expect(getMergeableSelectionsByType(MergeType.MergeHorizontal, selections as any)?.length).toBe(2);
        expect(getMergeableSelectionsByType(MergeType.MergeAll, null)).toBeNull();
    });
});
