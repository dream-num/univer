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

import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Irr } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test irr function', () => {
    const testFunction = new Irr(FUNCTION_NAMES_FINANCIAL.IRR);

    describe('Irr', () => {
        it('Value is normal', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(0.08663094803653168);
        });

        it('Value is normal, but no positive and negative number', () => {
            const values = ArrayValueObject.create('{700000,120000,150000,180000,210000,260000}');
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.NUM);
        });

        it('Value is error', () => {
            const values = ErrorValueObject.create(ErrorType.NAME);
            const guess = NumberValueObject.create(0.1);
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.NAME);

            const values2 = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const guess2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(values2, guess2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const guess = BooleanValueObject.create(true);
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(0.08663094803650478);
        });

        it('Value is normal string', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const guess = StringValueObject.create('test');
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const values = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                    [-700000, 120000, 150000, 180000, 210000, 260000],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const guess = NumberValueObject.create(16);
            const result = testFunction.calculate(values, guess);
            expect(result.getValue()).toStrictEqual(ErrorType.VALUE);

            const values2 = NumberValueObject.create(16);
            const guess2 = NullValueObject.create();
            const result2 = testFunction.calculate(values2, guess2);
            expect(result2.getValue()).toStrictEqual(ErrorType.NUM);

            const values3 = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const guess3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, ErrorType.NAME, null],
                ]),
                rowCount: 1,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(values3, guess3);
            expect(transformToValue(result3.getArrayValue())).toStrictEqual([
                [0.08663094803654446, ErrorType.VALUE, 0.08663094803650478, 0.08663094803653167, ErrorType.NAME, 0.08663094803653167],
            ]);
        });
    });
});
