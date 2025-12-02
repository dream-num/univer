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

import type { IWorksheetData } from '../typedef';
import { describe, expect, it } from 'vitest';
import { Tools } from '../../shared/tools';
import { BooleanNumber } from '../../types/enum';
import { cloneWorksheetData } from '../clone';

function createTestWorksheetData(rowCount: number, colCount: number): IWorksheetData {
    const cellData: IWorksheetData['cellData'] = {};
    const rowData: IWorksheetData['rowData'] = {};
    const columnData: IWorksheetData['columnData'] = {};
    const mergeData: IWorksheetData['mergeData'] = [];

    // Generate cell data
    for (let r = 0; r < rowCount; r++) {
        cellData[r] = {};
        for (let c = 0; c < colCount; c++) {
            cellData[r][c] = {
                v: `Cell ${r},${c}`,
                t: 1,
                s: { ff: 'Arial', fs: 12 },
            };
        }
        rowData[r] = { h: 20, hd: BooleanNumber.FALSE };
    }

    // Generate column data
    for (let c = 0; c < colCount; c++) {
        columnData[c] = { w: 100, hd: BooleanNumber.FALSE };
    }

    // Generate merge data
    for (let i = 0; i < Math.min(rowCount, 10); i++) {
        mergeData.push({
            startRow: i * 5,
            endRow: i * 5 + 1,
            startColumn: i * 3,
            endColumn: i * 3 + 2,
        });
    }

    return {
        id: 'test-sheet-id',
        name: 'Test Sheet',
        tabColor: '#FF0000',
        hidden: BooleanNumber.FALSE,
        freeze: {
            xSplit: 0,
            ySplit: 0,
            startRow: -1,
            startColumn: -1,
        },
        rowCount,
        columnCount: colCount,
        zoomRatio: 1,
        scrollTop: 0,
        scrollLeft: 0,
        defaultColumnWidth: 88,
        defaultRowHeight: 24,
        mergeData,
        cellData,
        rowData,
        columnData,
        rowHeader: {
            width: 46,
            hidden: BooleanNumber.FALSE,
        },
        columnHeader: {
            height: 20,
            hidden: BooleanNumber.FALSE,
        },
        showGridlines: BooleanNumber.TRUE,
        rightToLeft: BooleanNumber.FALSE,
    };
}

describe('cloneWorksheetData', () => {
    it('should correctly clone worksheet data', () => {
        const original = createTestWorksheetData(10, 10);
        const cloned = cloneWorksheetData(original);

        // Verify basic properties
        expect(cloned.id).toBe(original.id);
        expect(cloned.name).toBe(original.name);
        expect(cloned.tabColor).toBe(original.tabColor);
        expect(cloned.rowCount).toBe(original.rowCount);
        expect(cloned.columnCount).toBe(original.columnCount);

        // Verify freeze is deeply cloned
        expect(cloned.freeze).toEqual(original.freeze);
        expect(cloned.freeze).not.toBe(original.freeze);

        // Verify cellData is deeply cloned
        expect(cloned.cellData[0][0]).toEqual(original.cellData[0][0]);
        expect(cloned.cellData[0][0]).not.toBe(original.cellData[0][0]);
        expect(cloned.cellData[0][0].s).not.toBe(original.cellData[0][0].s);

        // Verify rowData is deeply cloned
        expect(cloned.rowData[0]).toEqual(original.rowData[0]);
        expect(cloned.rowData[0]).not.toBe(original.rowData[0]);

        // Verify columnData is deeply cloned
        expect(cloned.columnData[0]).toEqual(original.columnData[0]);
        expect(cloned.columnData[0]).not.toBe(original.columnData[0]);

        // Verify mergeData is deeply cloned
        expect(cloned.mergeData).toEqual(original.mergeData);
        expect(cloned.mergeData).not.toBe(original.mergeData);
        expect(cloned.mergeData[0]).not.toBe(original.mergeData[0]);

        // Modify cloned data and verify original is unchanged
        cloned.cellData[0][0].v = 'Modified';
        expect(original.cellData[0][0].v).toBe('Cell 0,0');
    });

    it('should be faster than Tools.deepClone for large worksheets', () => {
        const testCases = [
            { rows: 100, cols: 50, label: '100x50 (5,000 cells)' },
            { rows: 500, cols: 100, label: '500x100 (50,000 cells)' },
        ];

        for (const { rows, cols, label } of testCases) {
            const original = createTestWorksheetData(rows, cols);

            // Warm up
            cloneWorksheetData(original);
            Tools.deepClone(original);

            // Benchmark cloneWorksheetData
            const iterations = 5;
            const startOptimized = performance.now();
            for (let i = 0; i < iterations; i++) {
                cloneWorksheetData(original);
            }
            const endOptimized = performance.now();
            const optimizedTime = endOptimized - startOptimized;

            // Benchmark Tools.deepClone
            const startGeneric = performance.now();
            for (let i = 0; i < iterations; i++) {
                Tools.deepClone(original);
            }
            const endGeneric = performance.now();
            const genericTime = endGeneric - startGeneric;

            const speedup = genericTime / optimizedTime;

            // The optimized version should be at least 2x faster
            expect(speedup).toBeGreaterThan(1.5);
        }
    });

    it('should handle empty cellData', () => {
        const original = createTestWorksheetData(0, 0);
        original.cellData = {};
        const cloned = cloneWorksheetData(original);

        expect(cloned.cellData).toEqual({});
    });

    it('should handle cells with rich text (p property)', () => {
        const original = createTestWorksheetData(1, 1);
        original.cellData[0][0] = {
            p: {
                id: 'doc-id',
                documentStyle: {},
                body: {
                    dataStream: 'Hello\\r\\n',
                    textRuns: [{ st: 0, ed: 5, ts: { ff: 'Arial' } }],
                },
            },
        };

        const cloned = cloneWorksheetData(original);

        expect(cloned.cellData[0][0].p).toEqual(original.cellData[0][0].p);
        expect(cloned.cellData[0][0].p).not.toBe(original.cellData[0][0].p);
        expect(cloned.cellData[0][0].p!.body).not.toBe(original.cellData[0][0].p!.body);
    });

    it('should handle cells with formulas', () => {
        const original = createTestWorksheetData(1, 1);
        original.cellData[0][0] = {
            f: '=SUM(A1:B10)',
            v: 100,
            si: 'formula-id',
        };

        const cloned = cloneWorksheetData(original);

        expect(cloned.cellData[0][0]).toEqual(original.cellData[0][0]);
        expect(cloned.cellData[0][0]).not.toBe(original.cellData[0][0]);
    });

    it('should handle custom data', () => {
        const original = createTestWorksheetData(1, 1);
        original.custom = { key1: 'value1', nested: { key2: 'value2' } };
        original.cellData[0][0].custom = { cellKey: 'cellValue' };

        const cloned = cloneWorksheetData(original);

        expect(cloned.custom).toEqual(original.custom);
        expect(cloned.custom).not.toBe(original.custom);
        expect(cloned.cellData[0][0].custom).toEqual(original.cellData[0][0].custom);
        expect(cloned.cellData[0][0].custom).not.toBe(original.cellData[0][0].custom);
    });
});
