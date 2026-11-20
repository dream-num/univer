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

import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute } from '../drawing-position-util';

interface ICellBox {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
}

function skeleton(cells: Record<string, ICellBox>, decompose?: () => { row: number; column: number; rowOffset: number; columnOffset: number }): SpreadsheetSkeleton {
    return {
        getNoMergeCellWithCoordByIndex(row: number, column: number) {
            return cells[`${row}:${column}`];
        },
        getCellIndexAndOffsetByPosition() {
            return decompose?.() ?? { row: 0, column: 0, rowOffset: 0, columnOffset: 0 };
        },
    } as unknown as SpreadsheetSkeleton;
}

describe('convertPositionSheetOverGridToAbsolute', () => {
    const cells: Record<string, ICellBox> = {
        '3:1': { startX: 76.44, endX: 152.88, startY: 64, endY: 141.3333 },
        '18:5': { startX: 382.2, endX: 458.64, startY: 440, endY: 461.3333 },
        '3:7': { startX: 535.08, endX: 611.52, startY: 64, endY: 141.3333 },
    };

    it('keeps a positive row or column offset on the far edge of the anchor cell', () => {
        const position = convertPositionSheetOverGridToAbsolute('unit', 'sheet', {
            from: { column: 1, columnOffset: 25.3333, row: 3, rowOffset: 144 },
            to: { column: 5, columnOffset: 85.3333, row: 18, rowOffset: 0 },
        }, skeleton(cells));

        expect(position.top).toBe(141.3);
        expect(position.left).toBe(101.8);
        expect(position.width).toBe(356.8);
        expect(position.height).toBe(298.7);
    });

    it('leaves an offset that already fits inside the cell', () => {
        const position = convertPositionSheetOverGridToAbsolute('unit', 'sheet', {
            from: { column: 7, columnOffset: 2.6667, row: 3, rowOffset: 18.6667 },
            to: { column: 7, columnOffset: 0, row: 3, rowOffset: 0 },
        }, skeleton(cells));

        expect(position.top).toBe(82.7);
        expect(position.left).toBe(537.7);
    });

    it('keeps a negative offset and drops a positive offset on a hidden cell', () => {
        const hidden: Record<string, ICellBox> = {
            '3:1': { startX: 10, endX: 10, startY: 20, endY: 20 },
            '4:2': { startX: 40, endX: 80, startY: 50, endY: 70 },
        };
        const position = convertPositionSheetOverGridToAbsolute('unit', 'sheet', {
            from: { column: 1, columnOffset: 12, row: 3, rowOffset: -8 },
            to: { column: 2, columnOffset: 0, row: 4, rowOffset: 4 },
        }, skeleton(hidden));

        expect(position.left).toBe(10);
        expect(position.top).toBe(12);
        expect(position.width).toBe(30);
        expect(position.height).toBe(42);
    });

    it('uses the full stored offset once the row grows past it', () => {
        const grown: Record<string, ICellBox> = {
            '3:1': { startX: 76.44, endX: 152.88, startY: 64, endY: 220 },
            '18:5': { startX: 382.2, endX: 458.64, startY: 500, endY: 521 },
        };
        const position = convertPositionSheetOverGridToAbsolute('unit', 'sheet', {
            from: { column: 1, columnOffset: 10, row: 3, rowOffset: 144 },
            to: { column: 5, columnOffset: 0, row: 18, rowOffset: 0 },
        }, skeleton(grown));

        expect(position.top).toBe(208);
        expect(position.left).toBe(86.4);
    });
});

describe('convertPositionCellToSheetOverGrid', () => {
    it('clamps the pixel position and keeps the stored from offset', () => {
        const result = convertPositionCellToSheetOverGrid('unit', 'sheet', {
            column: 1,
            columnOffset: 90,
            row: 3,
            rowOffset: 144,
        }, 40, 20, skeleton({
            '3:1': { startX: 76.44, endX: 152.88, startY: 64, endY: 141.3333 },
        }));

        expect(result.transform.left).toBe(152.9);
        expect(result.transform.top).toBe(141.3);
        expect(result.sheetTransform.from.columnOffset).toBe(90);
        expect(result.sheetTransform.from.rowOffset).toBe(144);
    });
});
