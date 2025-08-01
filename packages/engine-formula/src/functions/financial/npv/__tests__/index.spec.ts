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
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
import { FUNCTION_NAMES_FINANCIAL } from '../../function-names';
import { Npv } from '../index';

describe('Test npv function', () => {
    const testFunction = new Npv(FUNCTION_NAMES_FINANCIAL.NPV);

    describe('Npv', () => {
        it('Value is normal', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(getObjectValue(result, true)).toBe(1188.44341233522);
        });

        it('Value is error', () => {
            const rate = ErrorValueObject.create(ErrorType.NAME);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const rate2 = NumberValueObject.create(0.1);
            const value2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(rate2, value1, value2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const value3 = ArrayValueObject.create({
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
            const result3 = testFunction.calculate(rate2, value1, value3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is boolean', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const value2 = BooleanValueObject.create(true);
            const result = testFunction.calculate(rate, value1, value2);
            expect(getObjectValue(result, true)).toBe(1189.06433365828);
        });

        it('Value is normal string', () => {
            const rate = NumberValueObject.create(0.1);
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const value2 = StringValueObject.create('test');
            const result = testFunction.calculate(rate, value1, value2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const rate2 = StringValueObject.create('test');
            const result2 = testFunction.calculate(rate2, value1);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);
        });

        it('Value is array', () => {
            const rate = ArrayValueObject.create('{0.1,-0.1,-1}');
            const value1 = ArrayValueObject.create('{-10000,3000,4200,6800}');
            const result = testFunction.calculate(rate, value1);
            expect(getObjectValue(result, true)).toStrictEqual([
                [1188.44341233522, 8718.18320378, ErrorType.DIV_BY_ZERO],
            ]);

            const value2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['1.02', 'test', true, false, null],
                    [-700000, 120000, 150000, 210000, 260000],
                ]),
                rowCount: 2,
                columnCount: 5,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(rate, value2);
            expect(getObjectValue(result2, true)).toStrictEqual([
                [-108744.975352133, 373909.055379242, ErrorType.DIV_BY_ZERO],
            ]);
        });
    });
});
