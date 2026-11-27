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

import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { describe, expect, it } from 'vitest';
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { UniverFormulaEnginePlugin } from '../../../../plugin';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Harmean } from '../index';
import '../../../../facade/f-univer';

describe('Test harmean function', () => {
    const testFunction = new Harmean(FUNCTION_NAMES_STATISTICAL.HARMEAN);

    describe('Harmean', () => {
        it('Value is normal', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [4, 5, 8, 7, 11, 4],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const number2 = NumberValueObject.create(3);
            const result = testFunction.calculate(number, number2);
            expect(getObjectValue(result, true)).toStrictEqual(5.02837596206);
        });

        it('Value is single cell = null/boolean/string/error/negtive number', () => {
            const number = NumberValueObject.create(3);
            const number2 = NullValueObject.create();
            const number3 = BooleanValueObject.create(true);
            const number4 = StringValueObject.create('test');
            const number5 = ErrorValueObject.create(ErrorType.NAME);
            const number6 = NumberValueObject.create(-3);
            const result = testFunction.calculate(number, number2, number3, number4);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.VALUE);

            const result2 = testFunction.calculate(number, number2, number3, number5);
            expect(getObjectValue(result2)).toStrictEqual(ErrorType.NAME);

            const result3 = testFunction.calculate(number, number2, number3, number6);
            expect(getObjectValue(result3)).toStrictEqual(ErrorType.NUM);
        });

        it('Value is not has number', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [true, false, null, 'test', null, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NA);
        });

        it('More test', () => {
            const number = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(number);
            expect(getObjectValue(result)).toStrictEqual(ErrorType.NAME);
        });
    });
});

describe('HARMEAN reciprocal range', () => {
    const fn = new Harmean(FUNCTION_NAMES_STATISTICAL.HARMEAN);

    function calculate(values: number[]) {
        return getObjectValue(fn.calculate(ArrayValueObject.createByArray([values]))) as number;
    }

    it('retains identical tiny positive values when reciprocals overflow', () => {
        for (const value of [Number.MIN_VALUE, 1e-309, 1e-308]) {
            expect(getObjectValue(fn.calculate(NumberValueObject.create(value)))).toBe(value);
            expect(calculate([value, value])).toBe(value);
        }
        expect(calculate(new Array(1000).fill(1e-306))).toBe(1e-306);
    });

    it('retains finite upper endpoints when inversion overflows', () => {
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MAX_VALUE)))).toBe(Number.MAX_VALUE);
        expect(calculate([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(Number.MAX_VALUE);
    });

    it('handles the full positive range independently of input order', () => {
        for (const values of [
            [Number.MIN_VALUE, Number.MAX_VALUE],
            [Number.MAX_VALUE, Number.MIN_VALUE],
        ]) {
            expect(calculate(values)).toBe(2 * Number.MIN_VALUE);
        }
        expect(calculate([Number.MIN_VALUE, 2 * Number.MIN_VALUE])).toBe(Number.MIN_VALUE);
        expect(calculate([2 * Number.MIN_VALUE, Number.MIN_VALUE])).toBe(Number.MIN_VALUE);
        expect(calculate([Number.MIN_VALUE, 2 * Number.MIN_VALUE, 4 * Number.MIN_VALUE])).toBe(2 * Number.MIN_VALUE);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MIN_VALUE), NumberValueObject.create(Infinity)))).toBe(2 * Number.MIN_VALUE);
    });

    it('rescales reciprocal sums across changing minima and argument groups', () => {
        const scale = 2 ** -1020;
        const values = Array.from({ length: 1536 }, (_, index) => scale * 2 ** (index % 3));
        // H(s, 2s, 4s) = 3 / ((1 + 1/2 + 1/4) / s) = 12s/7.
        const expected = 12 * scale / 7;
        for (const data of [values, [...values].reverse()]) {
            expect(Math.abs(calculate(data) / expected - 1)).toBeLessThan(1e-14);
            const result = fn.calculate(
                ArrayValueObject.createByArray([data.slice(0, 500)]),
                ArrayValueObject.createByArray([data.slice(500, 1000)]),
                ArrayValueObject.createByArray([data.slice(1000)])
            );
            expect(Math.abs((getObjectValue(result) as number) / expected - 1)).toBeLessThan(1e-14);
        }
    });

    it('retains ordinary results and non-finite input behavior', () => {
        expect(calculate([1, 2])).toBe(4 / 3);
        expect(calculate([1, 2, 4])).toBe(12 / 7);
        expect(calculate([3])).toBe(3);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(1), NumberValueObject.create(Infinity)))).toBe(2);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MAX_VALUE), NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Infinity), NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(calculate([1, Infinity])).toBe(ErrorType.NUM);
    });

    it('retains nonpositive, invalid and later-error precedence', () => {
        expect(calculate([Number.MIN_VALUE, 0])).toBe(ErrorType.NUM);
        expect(calculate([Number.MIN_VALUE, -1])).toBe(ErrorType.NUM);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Number.MIN_VALUE), NumberValueObject.create(0), ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[Number.MIN_VALUE, 0, ErrorType.NAME]])))).toBe(ErrorType.NAME);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[null, true, 'text']])))).toBe(ErrorType.NA);
        expect(getObjectValue(fn.calculate(ArrayValueObject.createByArray([[NaN]])))).toBe(ErrorType.NUM);
    });

    it('executes a constructed HARMEAN normalization workflow through the public formula API', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'mean-workflow',
                appVersion: '3.0.0-alpha',
                locale: LocaleType.EN_US,
                name: 'Normalized harmonic mean',
                sheetOrder: ['rates'],
                styles: {},
                sheets: {
                    rates: {
                        id: 'rates',
                        name: 'Rates',
                        rowCount: 10,
                        columnCount: 5,
                        cellData: Object.fromEntries(Array.from({ length: 5 }, (_, row) => [row, { 0: { v: 2.3e-308 } }])),
                    },
                },
            });
            const api = FUniver.newAPI(univer);
            const formulas = ['=HARMEAN(A1:A5)', '=HARMEAN(A1:A5)*1E308', '=HARMEAN(A1:A5)*1E308/2.3', '=HARMEAN(2,8)'];
            const result = await api.getFormula().executeFormulas({ 'mean-workflow': { rates: { 0: { 1: formulas } } } }, 2000);
            const values = result['mean-workflow']?.rates?.[0]?.[1]?.map((value) => value.value);
            expect(values?.[0]).toBe(2.3e-308);
            expect(values?.[1]).toBeCloseTo(2.3, 14);
            expect(values?.[2]).toBeCloseTo(1, 14);
            expect(values?.[3]).toBe(3.2);
        } finally {
            univer.dispose();
        }
    });
});
