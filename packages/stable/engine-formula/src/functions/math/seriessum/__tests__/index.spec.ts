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
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Seriessum } from '../index';

describe('Test seriessum function', () => {
    const testFunction = new Seriessum(FUNCTION_NAMES_MATH.SERIESSUM);

    describe('Seriessum', () => {
        it('Value is normal number', () => {
            const x = NumberValueObject.create(0.785398163);
            const n = NumberValueObject.create(0);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(0.7071032152046538);

            const coefficients2 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(x, n, m, coefficients2);
            expect(getObjectValue(result2)).toBe(1);
        });

        it('Value is number negative', () => {
            const x = NumberValueObject.create(0.785398163);
            const n = NumberValueObject.create(-1);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(0.9003117762635432);
        });

        it('Value is number string', () => {
            const x = NumberValueObject.create(0.785398163);
            const n = StringValueObject.create('1.5');
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(0.49217282836063);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const n = NumberValueObject.create(0);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const n = NumberValueObject.create(0);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is blank cell', () => {
            const x = NumberValueObject.create(0.785398163);
            const n = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(0.7071032152046538);
        });

        it('Value is null', () => {
            const x = NumberValueObject.create(0.785398163);
            const n = NullValueObject.create();
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.NA);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const n = NumberValueObject.create(0);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(0.785398163);
            const coefficients2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, n, m, coefficients2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
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
            const n = NumberValueObject.create(0);
            const m = NumberValueObject.create(2);
            const coefficients = ArrayValueObject.create('{1, -0.5, 0.041666667, -0.001388889}');
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);

            const x2 = NumberValueObject.create(0.785398163);
            const coefficients2 = ArrayValueObject.create({
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
            const result2 = testFunction.calculate(x2, n, m, coefficients2);
            expect(getObjectValue(result2)).toBe(ErrorType.VALUE);

            const coefficients3 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ErrorType.NAME, 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, ' '],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result3 = testFunction.calculate(x2, n, m, coefficients3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const coefficients4 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, true, ' ', 1.23, false, null],
                    [0, '100', '2.34', 'test', -3, ErrorType.NAME],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result4 = testFunction.calculate(x2, n, m, coefficients4);
            expect(getObjectValue(result4)).toBe(ErrorType.VALUE);
        });

        it('Result is NaN or Infinity', () => {
            const x = NumberValueObject.create(9000);
            const n = NumberValueObject.create(-0.5);
            const m = NumberValueObject.create(90000);
            const coefficients = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.785398163, 0.785398163],
                    [9000, 1],
                    [-0.5, -0.5],
                    [0.041666667, 0.041666667],
                    [-0.001388889, -0.001388889],
                ]),
                rowCount: 5,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(x, n, m, coefficients);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });
    });
});
