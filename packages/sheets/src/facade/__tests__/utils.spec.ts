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

import { covertCellValue, covertCellValues, HorizontalAlign, RANGE_TYPE, VerticalAlign } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    covertToColRange,
    covertToRowRange,
    isCellMerged,
    isSingleCell,
    transformCoreHorizontalAlignment,
    transformCoreVerticalAlignment,
    transformFacadeHorizontalAlignment,
    transformFacadeVerticalAlignment,
} from '../utils';

describe('Test utils', () => {
    it('function covertCellValue', () => {
        expect(covertCellValue('=SUM(1)')).toStrictEqual({ f: '=SUM(1)', v: null, p: null });

        expect(covertCellValue('1')).toStrictEqual({ v: '1', f: null, p: null });
        expect(covertCellValue(1)).toStrictEqual({ v: 1, f: null, p: null });
        expect(covertCellValue(true)).toStrictEqual({ v: true, f: null, p: null });

        expect(covertCellValue({})).toStrictEqual({});
    });

    it('function covertCellValues', () => {
        expect(
            covertCellValues(
                [
                    [1, 2],
                    [3, 4],
                ],
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1, f: null, p: null }, 2: { v: 2, f: null, p: null } },
            2: { 1: { v: 3, f: null, p: null }, 2: { v: 4, f: null, p: null } },
        });

        expect(
            covertCellValues(
                {
                    1: { 1: 1, 2: 2 },
                    2: { 1: 3, 2: 4 },
                },
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1, f: null, p: null }, 2: { v: 2, f: null, p: null } },
            2: { 1: { v: 3, f: null, p: null }, 2: { v: 4, f: null, p: null } },
        });

        expect(
            covertCellValues(
                [
                    [{ v: 1 }, { v: 2 }],
                    [{ v: 3 }, { v: 4 }],
                ],
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1 }, 2: { v: 2 } },
            2: { 1: { v: 3 }, 2: { v: 4 } },
        });

        expect(
            covertCellValues(
                {
                    1: { 1: { v: 1 }, 2: { v: 2 } },
                    2: { 1: { v: 3 }, 2: { v: 4 } },
                },
                { startRow: 1, startColumn: 1, endRow: 2, endColumn: 2 }
            )
        ).toStrictEqual({
            1: { 1: { v: 1 }, 2: { v: 2 } },
            2: { 1: { v: 3 }, 2: { v: 4 } },
        });
    });

    it('transforms facade alignment values to core values and back', () => {
        expect(transformFacadeHorizontalAlignment('left')).toBe(HorizontalAlign.LEFT);
        expect(transformFacadeHorizontalAlignment('center')).toBe(HorizontalAlign.CENTER);
        expect(transformFacadeHorizontalAlignment('normal')).toBe(HorizontalAlign.RIGHT);
        expect(() => transformFacadeHorizontalAlignment('invalid' as never)).toThrowError('Invalid horizontal alignment: invalid');

        expect(transformCoreHorizontalAlignment(HorizontalAlign.LEFT)).toBe('left');
        expect(transformCoreHorizontalAlignment(HorizontalAlign.CENTER)).toBe('center');
        expect(transformCoreHorizontalAlignment(HorizontalAlign.RIGHT)).toBe('normal');
        expect(transformCoreHorizontalAlignment('invalid' as never)).toBe('general');

        expect(transformFacadeVerticalAlignment('top')).toBe(VerticalAlign.TOP);
        expect(transformFacadeVerticalAlignment('middle')).toBe(VerticalAlign.MIDDLE);
        expect(transformFacadeVerticalAlignment('bottom')).toBe(VerticalAlign.BOTTOM);
        expect(() => transformFacadeVerticalAlignment('invalid' as never)).toThrowError('Invalid vertical alignment: invalid');

        expect(transformCoreVerticalAlignment(VerticalAlign.TOP)).toBe('top');
        expect(transformCoreVerticalAlignment(VerticalAlign.MIDDLE)).toBe('middle');
        expect(transformCoreVerticalAlignment(VerticalAlign.BOTTOM)).toBe('bottom');
        expect(transformCoreVerticalAlignment('invalid' as never)).toBe('general');
    });

    it('identifies merged cells and converts ranges to full row or column ranges', () => {
        const singleCell = { startRow: 2, endRow: 2, startColumn: 3, endColumn: 3, startX: 30, startY: 20, endX: 40, endY: 30 };
        const mergedCell = { startRow: 2, endRow: 4, startColumn: 3, endColumn: 5, startX: 30, startY: 20, endX: 60, endY: 50 };
        const worksheet = {
            getColumnCount: () => 12,
            getRowCount: () => 20,
        };

        expect(isSingleCell(singleCell, { startRow: 2, endRow: 2, startColumn: 3, endColumn: 3 })).toBe(true);
        expect(isSingleCell(singleCell, { startRow: 2, endRow: 2, startColumn: 4, endColumn: 4 })).toBe(false);
        expect(isCellMerged(mergedCell, { startRow: 2, endRow: 4, startColumn: 3, endColumn: 5 })).toBe(true);
        expect(isCellMerged(singleCell, { startRow: 2, endRow: 2, startColumn: 3, endColumn: 3 })).toBe(false);
        expect(isCellMerged(mergedCell, { startRow: 2, endRow: 2, startColumn: 3, endColumn: 3 })).toBe(false);

        expect(covertToRowRange({ startRow: 5, endRow: 7, startColumn: 2, endColumn: 4 }, worksheet as never)).toEqual({
            startRow: 5,
            endRow: 7,
            startColumn: 0,
            endColumn: 11,
            rangeType: RANGE_TYPE.ROW,
        });
        expect(covertToColRange({ startRow: 5, endRow: 7, startColumn: 2, endColumn: 4 }, worksheet as never)).toEqual({
            startRow: 0,
            endRow: 19,
            startColumn: 2,
            endColumn: 4,
            rangeType: RANGE_TYPE.COLUMN,
        });
    });
});
