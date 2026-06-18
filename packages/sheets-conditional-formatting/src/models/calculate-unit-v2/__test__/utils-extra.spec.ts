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

import type { IConditionFormattingRule } from '../../type';
import { BooleanNumber, CellValueType, ColorKit, ObjectMatrix } from '@univerjs/core';
import { FormulaResultStatus } from '@univerjs/engine-formula';
import { describe, expect, it } from 'vitest';
import { CFNumberOperator, CFRuleType, CFSubRuleType, CFValueType } from '../../../base/const';
import {
    compareWithNumber,
    filterRange,
    getCacheStyleMatrix,
    getCellValue,
    getColorScaleFromValue,
    getMaxInFormulaResult,
    getOppositeOperator,
    getValueByType,
    isFloatsEqual,
    isNullable,
    serialTimeToTimestamp,
    toYMD_1900,
} from '../utils';

describe('conditional formatting calculate utilities', () => {
    it('normalizes cell values used by conditional formatting rules', () => {
        expect(isFloatsEqual(1, 1 + Number.EPSILON / 2)).toBe(true);
        expect(isNullable(null)).toBe(true);
        expect(isNullable(undefined)).toBe(true);
        expect(isNullable('   ')).toBe(true);
        expect(getCellValue()).toBeNull();
        expect(getCellValue({ t: CellValueType.BOOLEAN, v: BooleanNumber.TRUE })).toBe('TRUE');
        expect(getCellValue({ t: CellValueType.BOOLEAN, v: BooleanNumber.FALSE })).toBe('FALSE');
        expect(getCellValue({ v: '', p: { body: { dataStream: 'rich\r\n' } } as any })).toBe('rich');
        expect(getCellValue({ v: 'plain' })).toBe('plain');
    });

    it('converts spreadsheet serial dates and filters ranges to sheet bounds', () => {
        expect(toYMD_1900(0)).toEqual([1900, 1, 0]);
        expect(toYMD_1900(60)).toEqual([1900, 2, 29]);
        expect(toYMD_1900(59)).toEqual([1900, 2, 28]);
        expect(Number.isFinite(serialTimeToTimestamp(44927.5))).toBe(true);

        expect(filterRange([
            { startRow: 0, startColumn: 0, endRow: 10, endColumn: 10 },
            { startRow: 100, startColumn: 0, endRow: 101, endColumn: 1 },
        ], 5, 6)).toEqual([
            { startRow: 0, startColumn: 0, endRow: 5, endColumn: 6 },
        ]);
    });

    it('calculates threshold values from matrices for data bars, color scales and icon sets', () => {
        const matrix = new ObjectMatrix<number>();
        matrix.setValue(0, 0, 2);
        matrix.setValue(0, 1, 6);
        matrix.setValue(0, 2, 10);
        const context = {
            cfId: 'cf-1',
            unitId: 'unit',
            subUnitId: 'sheet',
            accessor: {
                get() {
                    throw new Error('formula service is not used by this test');
                },
            },
        } as any;

        expect(getValueByType({ type: CFValueType.max }, matrix, context)).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: 10,
        });
        expect(getValueByType({ type: CFValueType.min }, matrix, context)).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: 2,
        });
        expect(getValueByType({ type: CFValueType.percent, value: 50 }, matrix, context)).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: 6,
        });
        expect(getValueByType({ type: CFValueType.percentile, value: 50 }, matrix, context)).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: 6,
        });
        expect(getValueByType({ type: CFValueType.num, value: 'bad-number' }, matrix, context)).toEqual({
            status: FormulaResultStatus.SUCCESS,
            result: 0,
        });
    });

    it('compares numbers and derives opposite operators for icon range bands', () => {
        expect(compareWithNumber({ operator: CFNumberOperator.between, value: [10, 1] }, 5)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.notBetween, value: [1, 10] }, 12)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.equal, value: 3 }, 3)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.notEqual, value: 3 }, 4)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.greaterThan, value: 3 }, 4)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.greaterThanOrEqual, value: 3 }, 3)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.lessThan, value: 3 }, 2)).toBe(true);
        expect(compareWithNumber({ operator: CFNumberOperator.lessThanOrEqual, value: 3 }, 3)).toBe(true);
        expect(compareWithNumber({ operator: 'unknown' as CFNumberOperator, value: 3 }, 3)).toBe(false);
        expect(getOppositeOperator(CFNumberOperator.greaterThan)).toBe(CFNumberOperator.lessThanOrEqual);
        expect(getOppositeOperator(CFNumberOperator.greaterThanOrEqual)).toBe(CFNumberOperator.lessThan);
        expect(getOppositeOperator(CFNumberOperator.lessThan)).toBe(CFNumberOperator.greaterThanOrEqual);
        expect(getOppositeOperator(CFNumberOperator.lessThanOrEqual)).toBe(CFNumberOperator.greaterThan);
        expect(getOppositeOperator(CFNumberOperator.equal)).toBe(CFNumberOperator.equal);
    });

    it('interpolates colors, reads cached style results, and computes formula result maxima', () => {
        expect(getColorScaleFromValue([
            { value: 0, color: new ColorKit('#000000') },
            { value: 10, color: new ColorKit('#ffffff') },
        ], -1)).toBe('rgb(0,0,0)');
        expect(getColorScaleFromValue([
            { value: 0, color: new ColorKit('#000000') },
            { value: 10, color: new ColorKit('#ffffff') },
        ], 5)).toBe('rgb(128,128,128)');
        expect(getColorScaleFromValue([
            { value: 0, color: new ColorKit('#000000') },
            { value: 10, color: new ColorKit('#ffffff') },
        ], 20)).toBe('rgb(255,255,255)');

        const rule: IConditionFormattingRule = {
            cfId: 'cf-1',
            ranges: [{ startRow: 0, startColumn: 0, endRow: 1, endColumn: 1 }],
            stopIfTrue: false,
            rule: {
                type: CFRuleType.highlightCell,
                subType: CFSubRuleType.number,
                operator: CFNumberOperator.equal,
                style: {},
            },
        } as any;
        const matrix = getCacheStyleMatrix<string>('unit', 'sheet', rule, {
            accessor: {
                get() {
                    return {
                        getCellCfs(_unitId: string, _subUnitId: string, row: number, col: number) {
                            return row === 0 && col === 0
                                ? [{ cfId: 'cf-1', result: 'hit' }, { cfId: 'cf-2', result: 'miss' }]
                                : undefined;
                        },
                    };
                },
            },
        } as any);
        expect(matrix.getValue(0, 0)).toBe('hit');
        expect(matrix.getValue(1, 1)).toBeUndefined();
        expect(getMaxInFormulaResult({ 0: { 0: 1, 1: '9' } })).toBe(9);
    });
});
