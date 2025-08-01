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
import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Mirr } from '../index';

describe('Test mirr function', () => {
    const testFunction = new Mirr(FUNCTION_NAMES_FINANCIAL.MIRR);

    describe('Mirr', () => {
        it('Value is normal', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const financeRate = NumberValueObject.create(0.1);
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result, true)).toBe(0.0986691073372);
        });

        it('Value is normal, but no positive and negative number', () => {
            const values = ArrayValueObject.create('{700000,120000,150000,180000,210000,260000}');
            const financeRate = NumberValueObject.create(0.1);
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);

            const values2 = NullValueObject.create();
            const result2 = testFunction.calculate(values2, financeRate, reinvestRate);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const values3 = NumberValueObject.create(1);
            const result3 = testFunction.calculate(values3, financeRate, reinvestRate);
            expect(getObjectValue(result3)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('ReinvestRate === -1', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const financeRate = NumberValueObject.create(0.1);
            const reinvestRate = NumberValueObject.create(-1);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });

        it('Value is error', () => {
            const values = ErrorValueObject.create(ErrorType.NAME);
            const financeRate = NumberValueObject.create(0.1);
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const values2 = ArrayValueObject.create('{700000,120000,150000,180000,210000,260000}');
            const financeRate2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(values2, financeRate2, reinvestRate);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const reinvestRate2 = ErrorValueObject.create(ErrorType.NAME);
            const result3 = testFunction.calculate(values2, financeRate, reinvestRate2);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const financeRate = BooleanValueObject.create(true);
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result, true)).toBe(0.0986691073372);
        });

        it('Value is normal string', () => {
            const values = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const financeRate = StringValueObject.create('test');
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
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
            const financeRate = NumberValueObject.create(0.1);
            const reinvestRate = NumberValueObject.create(0.12);
            const result = testFunction.calculate(values, financeRate, reinvestRate);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const values2 = ArrayValueObject.create('{-700000,120000,150000,180000,210000,260000}');
            const financeRate2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.1, 0.12],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(values2, financeRate2, reinvestRate);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [0.0986691073372, 0.0986691073372],
            ]);
        });
    });
});
