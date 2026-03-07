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
import { convertPositionCellToSheetOverGrid, convertPositionSheetOverGridToAbsolute } from '../drawing-position-util';

describe('drawing-position-util', () => {
    it('should convert sheet-over-grid position to absolute transform', () => {
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => {
                if (row === 1 && col === 1) return { startX: 10, startY: 20, endX: 30, endY: 40 };
                if (row === 3 && col === 4) return { startX: 60, startY: 80, endX: 90, endY: 120 };
                return { startX: 0, startY: 0, endX: 0, endY: 0 };
            },
        };

        const result = convertPositionSheetOverGridToAbsolute('u1', 's1', {
            from: { row: 1, column: 1, rowOffset: 0.26, columnOffset: 0.24 },
            to: { row: 3, column: 4, rowOffset: 4.44, columnOffset: 5.55 },
        } as any, {
            ensureSkeleton: () => skeleton,
        } as any);

        expect(result).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            left: 10.2,
            top: 20.3,
            width: 55.4,
            height: 64.1,
        });
    });

    it('should convert cell-over-grid position to sheet transform', () => {
        const skeleton = {
            getNoMergeCellWithCoordByIndex: (row: number, col: number) => {
                if (row === 2 && col === 3) return { startX: 10, startY: 20, endX: 20, endY: 30 };
                return { startX: 0, startY: 0, endX: 0, endY: 0 };
            },
        };

        const result = convertPositionCellToSheetOverGrid('u1', 's1', {
            row: 2,
            column: 3,
            rowOffset: 0.3,
            columnOffset: 0.2,
        } as any, 50, 40, {
            getCellWithCoordByOffset: () => ({
                actualColumn: 9,
                actualRow: 8,
                startX: 55.7,
                startY: 58.9,
            }),
        } as any, {
            ensureSkeleton: () => skeleton,
        } as any);

        expect(result).toEqual({
            unitId: 'u1',
            subUnitId: 's1',
            sheetTransform: {
                from: { row: 2, column: 3, rowOffset: 0.3, columnOffset: 0.2 },
                to: { row: 8, column: 9, rowOffset: 1.4, columnOffset: 4.5 },
            },
            transform: {
                left: 10.2,
                top: 20.3,
                width: 50,
                height: 40,
            },
        });
    });

    it('should throw when skeleton or end cell is missing', () => {
        expect(() => convertPositionSheetOverGridToAbsolute('u1', 's1', {
            from: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
            to: { row: 0, column: 0, rowOffset: 0, columnOffset: 0 },
        } as any, { ensureSkeleton: () => null } as any)).toThrow(/No current skeleton/);

        const skeleton = {
            getNoMergeCellWithCoordByIndex: () => ({ startX: 10, startY: 20, endX: 20, endY: 30 }),
        };

        expect(() => convertPositionCellToSheetOverGrid('u1', 's1', {
            row: 1,
            column: 1,
            rowOffset: 0,
            columnOffset: 0,
        } as any, 10, 10, {
            getCellWithCoordByOffset: () => null,
        } as any, {
            ensureSkeleton: () => skeleton,
        } as any)).toThrow(/No end selection cell/);
    });
});
