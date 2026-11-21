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

import { BooleanNumber } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { UniverRenderingContext2D } from '../../../context';
import type { SpreadsheetSkeleton } from '../sheet.render-skeleton';
import { Spreadsheet } from '../spreadsheet';

interface ISpreadsheetGridlines {
    _drawAuxiliary: (ctx: UniverRenderingContext2D, hasMergeData?: boolean) => void;
    _drawGapAreas: (...args: unknown[]) => void;
}

function createTestBed(columns: number[], rows = [24, 48, 72]) {
    const spreadsheet = new Spreadsheet('sheet-gridlines-test');
    const privateSpreadsheet = spreadsheet as unknown as ISpreadsheetGridlines;
    const getRowVisible = vi.fn((row: number) => row === 0 ? rows[row] > 0 : rows[row] > rows[row - 1]);
    const skeleton = {
        rowColumnSegment: { startRow: 0, endRow: rows.length - 1, startColumn: 0, endColumn: columns.length - 1 },
        columnWidthAccumulation: columns,
        rowHeightAccumulation: rows,
        columnTotalWidth: columns.at(-1) ?? 0,
        rowTotalHeight: rows.at(-1) ?? 0,
        showGridlines: BooleanNumber.TRUE,
        defaultGridlinesColor: '#d5d7dc',
        worksheet: { getRowVisible },
        overflowCache: { toNativeArray: () => [] },
        getCurrentRowColumnSegmentMergeData: vi.fn(() => []),
    };
    vi.spyOn(spreadsheet, 'getSkeleton').mockReturnValue(skeleton as unknown as SpreadsheetSkeleton);
    const drawGaps = vi.spyOn(privateSpreadsheet, '_drawGapAreas').mockImplementation(() => {});
    const strokes: number[][][] = [];
    let path: number[][] = [];
    const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        setLineWidthByPrecision: vi.fn(),
        translateWithPrecisionRatio: vi.fn(),
        renderConfig: {},
        beginPath: () => { path = []; },
        moveToByPrecision: (x: number, y: number) => path.push([x, y]),
        lineToByPrecision: (x: number, y: number) => path.push([x, y]),
        closePathByEnv: vi.fn(),
        stroke: () => strokes.push(path),
    };
    return {
        spreadsheet,
        skeleton,
        getRowVisible,
        drawGaps,
        strokes,
        draw: (hasMergeData = false) => privateSpreadsheet._drawAuxiliary(ctx as unknown as UniverRenderingContext2D, hasMergeData),
        verticalPositions: () => strokes.filter((points) => points.length === 2 && points[0][0] === points[1][0] && points[0][1] !== points[1][1]).map((points) => points[0][0]),
        horizontalPositions: () => strokes.filter((points) => points.length === 2 && points[0][1] === points[1][1]).map((points) => points[0][1]),
    };
}

afterEach(() => vi.restoreAllMocks());

describe('spreadsheet gridlines', () => {
    it('strokes each distinct coordinate once without scanning hidden column plateaus', () => {
        const columns = Array.from({ length: 10057 }, (_, column) => (
            column < 17 ? (column + 1) * 40 : column < 10017 ? 680 : (column - 9999) * 40
        ));
        let reads = 0;
        const countedColumns = new Proxy(columns, {
            get(target, key, receiver) {
                if (typeof key === 'string' && /^\d+$/.test(key)) {
                    reads++;
                }
                return Reflect.get(target, key, receiver);
            },
        });
        const testBed = createTestBed(countedColumns, [24, 24, 24, 48, 72]);
        reads = 0;

        testBed.draw(true);

        expect(testBed.verticalPositions()).toEqual(Array.from({ length: 57 }, (_, column) => (column + 1) * 40));
        expect(testBed.horizontalPositions()).toEqual([24, 48, 72]);
        expect(reads).toBeLessThan(100);
        expect(testBed.getRowVisible.mock.calls.map(([row]) => row)).toEqual([0, 1, 2, 3, 4]);
        expect(testBed.skeleton.getCurrentRowColumnSegmentMergeData.mock.calls).toEqual([
            [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 10056 }],
            [{ startRow: 3, endRow: 4, startColumn: 0, endColumn: 10056 }],
        ]);
        expect(testBed.drawGaps).toHaveBeenCalledOnce();
        testBed.spreadsheet.dispose();
    });

    it('retains the boundary of a hidden column with a positive gap', () => {
        const testBed = createTestBed([40, 45, 45, 85]);

        testBed.draw();

        expect(testBed.verticalPositions()).toEqual([40, 45, 85]);
        expect(testBed.drawGaps).toHaveBeenCalledWith(
            expect.anything(),
            testBed.skeleton,
            0,
            2,
            0,
            3,
            0,
            85,
            0,
            72
        );
        testBed.spreadsheet.dispose();
    });

    it.each([
        { columns: [0, 0, 40, 40, 80], expected: [40, 80] },
        { columns: [40, 80, 80, 80], expected: [40, 80] },
        { columns: [0, 0, 0], expected: [] },
    ])('handles leading and trailing plateaus in $columns', ({ columns, expected }) => {
        const testBed = createTestBed(columns, [0, 0, 24, 24]);

        testBed.draw();

        expect(testBed.verticalPositions()).toEqual(expected);
        expect(testBed.horizontalPositions()).toEqual([24]);
        testBed.spreadsheet.dispose();
    });

    it('preserves the complete stroke sequence without hidden dimensions', () => {
        const testBed = createTestBed([40, 80, 120], [24, 48]);

        testBed.draw();

        expect(testBed.strokes).toEqual([
            [[0, 0], [120, 0], [0, 0], [0, 48]],
            [[0, 24], [120, 24]],
            [[0, 48], [120, 48]],
            [[40, 0], [40, 48]],
            [[80, 0], [80, 48]],
            [[120, 0], [120, 48]],
        ]);
        testBed.spreadsheet.dispose();
    });

    it('does not emit strokes when gridlines are disabled', () => {
        const testBed = createTestBed([40, 80]);
        testBed.skeleton.showGridlines = BooleanNumber.FALSE;

        testBed.draw();

        expect(testBed.strokes).toEqual([]);
        testBed.spreadsheet.dispose();
    });

    it('does not emit strokes without a skeleton', () => {
        const testBed = createTestBed([40, 80]);
        vi.mocked(testBed.spreadsheet.getSkeleton).mockReturnValue(undefined);

        testBed.draw();

        expect(testBed.strokes).toEqual([]);
        testBed.spreadsheet.dispose();
    });
});
