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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sqrtpi } from '../index';
import '../../../../facade/f-univer';

describe('Test sqrtpi function', () => {
    const testFunction = new Sqrtpi(FUNCTION_NAMES_MATH.SQRTPI);

    describe('Sqrtpi', () => {
        it('Value is normal number', () => {
            const value = NumberValueObject.create(1);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(1.77245385091);
        });

        it('Value is number negative', () => {
            const value = NumberValueObject.create(-2);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const value = StringValueObject.create('1.5');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(2.17080376367);
        });

        it('Value is normal string', () => {
            const value = StringValueObject.create('test');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const value = BooleanValueObject.create(true);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(1.77245385091);
        });

        it('Value is blank cell', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const value = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const valueArray = ArrayValueObject.create({
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
            const result = testFunction.calculate(valueArray);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });
    });
});

describe('SQRTPI finite large inputs', () => {
    const fn = new Sqrtpi(FUNCTION_NAMES_MATH.SQRTPI);

    it('returns finite square roots when multiplication by pi overflows', () => {
        // Independent 100-digit sqrt(x*pi) references at the exact binary inputs.
        const fixtures: [number, number][] = [
            [1e+308, 1.7724538509055162e+154],
            [1.7976931348623157e+308, 2.376472079762827e+154],
            [8.98846567431158e+307, 1.680419522900793e+154],
            [5.722292193863772e+307, 1.340787496881465e+154],
        ];
        for (const [value, expected] of fixtures) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(value))) as number;
            expect(Number.isFinite(result)).toBe(true);
            expect(Math.abs(result / expected - 1)).toBeLessThan(1e-15);
        }
    });

    it('uses the finite result for scalar strings and single-cell arrays', () => {
        const expected = 1.7724538509055162e154;
        for (const input of [StringValueObject.create('1e308'), ArrayValueObject.createByArray([[1e308]])]) {
            const result = getObjectValue(fn.calculate(input)) as number;
            expect(Number.isFinite(result)).toBe(true);
            expect(Math.abs(result / expected - 1)).toBeLessThan(1e-15);
        }
    });

    it('preserves the direct calculation for finite products', () => {
        for (const value of [0, -0, Number.MIN_VALUE, 1e-308, 1e-100, 1, 2, 100, Number.MAX_VALUE / Math.PI / 2]) {
            const result = getObjectValue(fn.calculate(NumberValueObject.create(value)));
            expect(Object.is(result, Math.sqrt(value * Math.PI))).toBe(true);
        }
    });

    it('preserves non-finite inputs, negative values and errors', () => {
        expect(getObjectValue(fn.calculate(NumberValueObject.create(Infinity)))).toBe(Infinity);
        expect(getObjectValue(fn.calculate(NumberValueObject.create(NaN)))).toBeNaN();
        expect(getObjectValue(fn.calculate(NumberValueObject.create(-Number.MAX_VALUE)))).toBe(ErrorType.NUM);
        expect(getObjectValue(fn.calculate(ErrorValueObject.create(ErrorType.REF)))).toBe(ErrorType.REF);
    });

    it('executes a constructed area-to-circumference workflow through the public formula API', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'geometry-workflow',
                appVersion: '3.0.0-alpha',
                locale: LocaleType.EN_US,
                name: 'Circle circumference',
                sheetOrder: ['geometry'],
                styles: {},
                sheets: {
                    geometry: {
                        id: 'geometry',
                        name: 'Geometry',
                        rowCount: 10,
                        columnCount: 5,
                        cellData: { 0: { 0: { v: 6e307 } }, 1: { 0: { v: 5.7e307 } } },
                    },
                },
            });
            const api = FUniver.newAPI(univer);
            const formulas = ['=SQRTPI(A1)', '=2*SQRTPI(A1)', '=2*SQRTPI(A1)/SQRT(A1)', '=SQRTPI(A2)'];
            const result = await api.getFormula().executeFormulas({ 'geometry-workflow': { geometry: { 0: { 1: formulas } } } }, 2000);
            const values = result['geometry-workflow']?.geometry?.[0]?.[1]?.map((value) => value.value);
            expect(Number.isFinite(values?.[0])).toBe(true);
            expect(Number.isFinite(values?.[1])).toBe(true);
            expect(values?.[2]).toBeCloseTo(2 * Math.sqrt(Math.PI), 14);
            expect(values?.[3]).toBe(Math.sqrt(5.7e307 * Math.PI));
        } finally {
            univer.dispose();
        }
    });
});
