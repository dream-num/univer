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
import { PercentileInc } from '../index';
import '../../../../facade/f-univer';

describe('Test percentileInc function', () => {
    const testFunction = new PercentileInc(FUNCTION_NAMES_STATISTICAL.PERCENTILE_INC);

    describe('PercentileInc', () => {
        it('Value is normal', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result, true)).toBe(3.7);
        });

        it('Value is number string', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['\'1', '\'2', '\'3', '\'4', '\'5', '\'6', '\'7', '\'8', '\'9', '\'10'],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Array value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, null, true, false, 'test', 6, 7, 8, 9, ErrorType.NAME],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.3);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const array2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null, true, false, 'test'],
                ]),
                rowCount: 1,
                columnCount: 4,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(array2, k);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const result3 = testFunction.calculate(BooleanValueObject.create(false), k);
            expect(getObjectValue(result3)).toBe(0);
        });

        it('K value test', () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                ]),
                rowCount: 1,
                columnCount: 10,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const k = NumberValueObject.create(0.1);
            const result = testFunction.calculate(array, k);
            expect(getObjectValue(result)).toBe(1.9);

            const k2 = NumberValueObject.create(0.9);
            const result2 = testFunction.calculate(array, k2);
            expect(getObjectValue(result2)).toBe(9.1);

            const k3 = BooleanValueObject.create(true);
            const result3 = testFunction.calculate(array, k3);
            expect(getObjectValue(result3)).toBe(10);

            const k4 = NullValueObject.create();
            const result4 = testFunction.calculate(array, k4);
            expect(getObjectValue(result4)).toBe(1);

            const k5 = StringValueObject.create('test');
            const result5 = testFunction.calculate(array, k5);
            expect(getObjectValue(result5)).toBe(ErrorType.VALUE);

            const k6 = ErrorValueObject.create(ErrorType.NAME);
            const result6 = testFunction.calculate(array, k6);
            expect(getObjectValue(result6)).toBe(ErrorType.NAME);

            const k7 = ArrayValueObject.create('{0.09,0.5,3}');
            const result7 = testFunction.calculate(array, k7);
            expect(getObjectValue(result7)).toStrictEqual([
                [1.81, 5.5, ErrorType.NUM],
            ]);

            const k8 = ArrayValueObject.create('{0.123}');
            const result8 = testFunction.calculate(array, k8);
            expect(getObjectValue(result8)).toBe(2.107);
        });
    });
});

function createArray(values: number[]) {
    return ArrayValueObject.create({
        calculateValueList: transformToValueObject([values]),
        rowCount: 1,
        columnCount: values.length,
        unitId: '',
        sheetId: '',
        row: 0,
        column: 0,
    });
}

describe('PercentileInc finite interpolation', () => {
    const instance = new PercentileInc(FUNCTION_NAMES_STATISTICAL.PERCENTILE_INC);
    const parameter = 0.5;

    it('interpolates opposite finite extremes without overflowing their difference', () => {
        const result = instance.calculate(createArray([1e308, -1e308]), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(0);
    });

    it.each([
        { values: [1e308, 1.6e308], expected: 1.3e308 },
        { values: [-1.6e308, -1e308], expected: -1.3e308 },
        { values: [1e308, 1e308], expected: 1e308 },
        { values: [-4, 2], expected: -1 },
        { values: [Number.MIN_VALUE, Number.MIN_VALUE], expected: Number.MIN_VALUE },
    ])('preserves ordinary, same-sign and subnormal interpolation: $values', ({ values, expected }) => {
        const result = instance.calculate(createArray(values), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(expected);
    });

    it.each([
        { values: [-1.6e308, 1e308], parameter: 0.25, expected: -9.5e307 },
        { values: [-1.6e308, 1e308], parameter: 0.75, expected: 3.5e307 },
    ])('keeps a finite weighted result for parameter $parameter', ({ values, parameter, expected }) => {
        const result = instance.calculate(createArray(values), NumberValueObject.create(parameter));
        expect(result.isNumber()).toBe(true);
        expect(Number.isFinite(result.getValue())).toBe(true);
        expect((result.getValue() as number) / expected).toBeCloseTo(1, 14);
    });

    it.each([0, 1])('retains the exact inclusive endpoint at $0', (parameter) => {
        const result = instance.calculate(createArray([-1e308, 1e308]), NumberValueObject.create(parameter));
        expect(result.getValue()).toBe(parameter === 0 ? -1e308 : 1e308);
    });

    it('evaluates a constructed quantile normalization workflow through the public formula API', async () => {
        const univer = new Univer({ locale: LocaleType.EN_US });
        try {
            univer.registerPlugin(UniverFormulaEnginePlugin);
            univer.createUnit(UniverInstanceType.UNIVER_SHEET, {
                id: 'quantile-workflow',
                appVersion: '3.0.0-alpha',
                locale: LocaleType.EN_US,
                name: 'Normalized quantiles',
                sheetOrder: ['observations'],
                styles: {},
                sheets: {
                    observations: {
                        id: 'observations',
                        name: 'Observations',
                        rowCount: 10,
                        columnCount: 10,
                        cellData: {
                            0: { 0: { v: -1e308 }, 1: { v: -4 } },
                            1: { 0: { v: 1e308 }, 1: { v: 2 } },
                        },
                    },
                },
            });
            const formulas = [
                '=PERCENTILE.INC(A1:A2,0.5)',
                '=PERCENTILE.EXC(A1:A2,0.5)',
                '=QUARTILE.INC(A1:A2,2)',
                '=QUARTILE.EXC(A1:A2,2)',
                '=AGGREGATE(16,6,A1:A2,0.5)',
                '=PERCENTILE.INC(A1:A2,0.25)/1E308',
                '=PERCENTILE.INC(A1:A2/1E308,0.25)',
                '=PERCENTILE.INC(B1:B2,0.5)',
            ];
            const api = FUniver.newAPI(univer);
            const result = await api.getFormula().executeFormulas({ 'quantile-workflow': { observations: { 0: { 2: formulas } } } }, 2000);
            const values = result['quantile-workflow']?.observations?.[0]?.[2]?.map((value) => value.value);
            expect(values).toStrictEqual([0, 0, 0, 0, 0, -0.5, -0.5, -1]);
        } finally {
            univer.dispose();
        }
    });
});
