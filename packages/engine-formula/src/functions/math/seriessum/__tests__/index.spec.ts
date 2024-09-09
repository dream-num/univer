/**
 * Copyright 2023-present DreamNum Inc.
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

import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Seriessum } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';

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
        });
    });
});
