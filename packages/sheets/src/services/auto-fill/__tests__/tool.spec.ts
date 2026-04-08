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

import { CellValueType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import AutoFillTools from '../tools';

const {
    chineseToNumber,
    numberToChinese,
    isChnNumber,
    matchExtendNumber,
    isChnWeek1,
    isChnWeek2,
    isChnWeek3,
    getLenS,
    isEqualDiff,
    getDataIndex,
    fillCopy,
    fillCopyStyles,
    isEqualRatio,
    getXArr,
    fillSeries,
    forecast,
    fillExtendNumber,
    fillOnlyFormat,
    fillChnWeek,
    fillChnNumber,
    isLoopSeries,
    getLoopSeriesInfo,
    fillLoopSeries,
    getAutoFillRepeatRange,
    needsUpdateCellValue,
    removeCellCustom,
    reverseIfNeed,
    generateNullCellValueRowCol,
} = AutoFillTools;

describe('Test tool', () => {
    it('Function needsUpdateCellValue', () => {
        expect(needsUpdateCellValue({ f: '=A1' })).toBeFalsy();
        expect(needsUpdateCellValue({ si: 'id1' })).toBeFalsy();
        expect(needsUpdateCellValue({ t: CellValueType.BOOLEAN })).toBeFalsy();
        expect(needsUpdateCellValue({ v: 1, t: CellValueType.NUMBER })).toBeTruthy();
    });

    it('converts chinese numbers correctly', () => {
        expect(chineseToNumber()).toBe(0);

        const numbers = [1, 9, 10, 11, 20, 101, 10005];
        numbers.forEach((n) => {
            expect(chineseToNumber(numberToChinese(n))).toBe(n);
        });
    });

    it('checks chinese text and week labels', () => {
        expect(isChnNumber('日')).toBeTruthy();
        expect(isChnNumber('十二')).toBeTruthy();
        expect(isChnNumber('abc')).toBeFalsy();
        expect(isChnNumber('十')).toBeFalsy();

        expect(isChnWeek1('日')).toBeTruthy();
        expect(isChnWeek1('八')).toBeFalsy();
        expect(isChnWeek2('周三')).toBeTruthy();
        expect(isChnWeek2('星期三')).toBeFalsy();
        expect(isChnWeek3('星期三')).toBeTruthy();
        expect(isChnWeek3('周三')).toBeFalsy();
    });

    it('matches and extends numeric suffix in text', () => {
        expect(matchExtendNumber('item12')).toEqual({
            isExtendNumber: true,
            matchTxt: 12,
            beforeTxt: 'item',
            afterTxt: '',
        });
        expect(matchExtendNumber('text')).toEqual({ isExtendNumber: false });
    });

    it('handles numeric helper utilities', () => {
        expect(getLenS([0, 2, 4], 3)).toBe(2);
        expect(isEqualDiff([1, 3, 5, 7])).toBeTruthy();
        expect(isEqualDiff([1, 3, 6])).toBeFalsy();
        expect(isEqualRatio([2, 4, 8])).toBeTruthy();
        expect(isEqualRatio([2, 4, 9])).toBeFalsy();
        expect(getXArr(4)).toEqual([1, 2, 3, 4]);
    });

    it('builds data index map for copy types', () => {
        const result = getDataIndex(4, 10, [0, 2]);
        expect(result[0]).toBe(0);
        expect(result[2]).toBe(1);
        expect(result[4]).toBe(2);
        expect(result[6]).toBe(3);
        expect(result[8]).toBe(4);
    });

    it('fills copy data and styles', () => {
        const data = [{ v: 1, s: 's1', custom: { a: 1 } }, { v: 2, s: 's2' }];

        const copied = fillCopy(data, 3);
        expect(copied.map((d) => d.v)).toEqual([1, 2, 1]);
        expect(copied[0].custom).toBeUndefined();
        expect(copied[0].p).toBeNull();

        const copiedStyles = fillCopyStyles(data, 3);
        expect(copiedStyles).toEqual([{ s: 's1' }, { s: 's2' }, { s: 's1' }]);
    });

    it('fills numeric series by regression and ratio', () => {
        const linearData = [{ v: 1 }, { v: 2 }, { v: 3 }];
        const linear = fillSeries(linearData, 2, 0);
        expect(linear.map((d) => d?.v)).toEqual([4, 5]);

        const ratioData = [{ v: 2 }, { v: 4 }, { v: 8 }];
        const ratio = fillSeries(ratioData, 2, 0);
        expect(ratio.map((d) => d?.v)).toEqual([16, 32]);

        const formulaData = [{ v: 1, f: '=A1' }, { v: 2 }, { v: 3 }];
        const formula = fillSeries(formulaData, 1, 0);
        expect(formula[0]?.v).toBe(1);
    });

    it('forecasts with fallback slope when x variance is zero', () => {
        expect(forecast(5, [2, 2, 2], [1, 1, 1], true)).toBe(6);
        expect(forecast(5, [2, 2, 2], [1, 1, 1], false)).toBe(-2);
    });

    it('fills extended text-number and format-only content', () => {
        const extended = fillExtendNumber([{ v: 'item12', s: 's1', custom: { flag: true } }], 2, 2);
        expect(extended.map((d) => d?.v)).toEqual(['item14', 'item16']);
        expect(extended[0]?.custom).toBeUndefined();

        const formatOnly = fillOnlyFormat([{ v: 1, s: 's1', custom: { flag: true } }], 1);
        expect(formatOnly[0]).toEqual({ s: 's1' });
    });

    it('fills chinese week and chinese number sequences', () => {
        const week = fillChnWeek([{ v: '日', custom: { flag: true } }], 3, 1, 0);
        expect(week.map((d) => d?.v)).toEqual(['一', '二', '三']);
        expect(week[0]?.custom).toBeUndefined();

        const weekBack = fillChnWeek([{ v: '一' }], 1, -2, 0);
        expect(weekBack[0]?.v).toBe('六');

        const chnNumber = fillChnNumber([{ v: '一' }], 2, 1);
        expect(chnNumber.map((d) => d?.v)).toEqual(['二', '三']);

        const belowZero = fillChnNumber([{ v: '一' }], 1, -2);
        expect(belowZero[0]?.v).toBe('零');
    });

    it('handles loop series detection and filling', () => {
        expect(isLoopSeries('Mon')).toBeTruthy();
        expect(isLoopSeries('NotInSeries')).toBeFalsy();

        const info = getLoopSeriesInfo('Mon');
        expect(info.name).toBe('enWeek1');
        expect(info.series).toHaveLength(7);

        const loop = fillLoopSeries([{ v: 'B' }], 2, 1, ['A', 'B', 'C']);
        expect(loop.map((d) => d?.v)).toEqual(['C', 'A']);

        const loopBack = fillLoopSeries([{ v: 'A' }], 1, -2, ['A', 'B', 'C']);
        expect(loopBack[0]?.v).toBe('B');
    });

    it('calculates auto-fill repeat ranges for each direction', () => {
        const sourceRange = {
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        };

        expect(getAutoFillRepeatRange(sourceRange, sourceRange)).toEqual([]);

        const down = getAutoFillRepeatRange(sourceRange, {
            startRow: 3,
            endRow: 5,
            startColumn: 1,
            endColumn: 2,
        });
        expect(down).toHaveLength(2);
        expect(down[0].repeatStartCell).toEqual({ row: 3, col: 1 });
        expect(down[1].relativeRange.endRow).toBe(0);

        const up = getAutoFillRepeatRange(sourceRange, {
            startRow: -1,
            endRow: 0,
            startColumn: 1,
            endColumn: 2,
        });
        expect(up[0].repeatStartCell).toEqual({ row: -1, col: 1 });

        const right = getAutoFillRepeatRange(sourceRange, {
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 5,
        });
        expect(right[0].repeatStartCell).toEqual({ row: 1, col: 3 });

        const left = getAutoFillRepeatRange(sourceRange, {
            startRow: 1,
            endRow: 2,
            startColumn: -2,
            endColumn: 0,
        });
        expect(left[0].repeatStartCell).toEqual({ row: 1, col: -1 });
    });

    it('removes custom field, reverses arrays and generates null matrix', () => {
        const cell = { v: 1, custom: { a: 1 } };
        removeCellCustom(cell);
        expect(cell.custom).toBeUndefined();

        expect(reverseIfNeed([1, 2, 3], false)).toEqual([1, 2, 3]);
        expect(reverseIfNeed([1, 2, 3], true)).toEqual([3, 2, 1]);

        const nullMatrix = generateNullCellValueRowCol([
            { rows: [0, 1], cols: [2] },
            { rows: [3], cols: [1, 2] },
        ]);
        expect(nullMatrix).toEqual({
            0: { 2: { v: null, p: null, f: null, si: null, custom: null } },
            1: { 2: { v: null, p: null, f: null, si: null, custom: null } },
            3: {
                1: { v: null, p: null, f: null, si: null, custom: null },
                2: { v: null, p: null, f: null, si: null, custom: null },
            },
        });
    });
});
