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
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Combin } from '../index';

function exactCombination(n: number, k: number): bigint {
    let result = 1n;
    const integerN = BigInt(n);
    for (let i = 1; i <= Math.min(k, n - k); i++) {
        result = result * (integerN - BigInt(i) + 1n) / BigInt(i);
    }
    return result;
}

function expectRelative(actual: unknown, expected: number) {
    expect(typeof actual).toBe('number');
    expect(Number.isFinite(actual)).toBe(true);
    expect(Math.abs((actual as number) / expected - 1)).toBeLessThan(1e-14);
}

describe('Test combin function', () => {
    const testFunction = new Combin(FUNCTION_NAMES_MATH.COMBIN);

    describe('Combin', () => {
        it('Value is normal number', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(28);
        });

        it('Value is big number', () => {
            const number = NumberValueObject.create(1000000);
            const numberChosen = NumberValueObject.create(2000);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number negative', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NumberValueObject.create(-2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = StringValueObject.create('1.5');
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(8);
        });

        it('Value is normal string', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = StringValueObject.create('test');
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = BooleanValueObject.create(true);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(8);
        });
        it('Value is blank cell', () => {
            const number = NumberValueObject.create(8);
            const numberChosen = NullValueObject.create();
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(1);
        });
        it('Value is error', () => {
            const number = ErrorValueObject.create(ErrorType.NAME);
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const number2 = NumberValueObject.create(8);
            const numberChosen2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(number2, numberChosen2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
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
            const numberChosen = NumberValueObject.create(2);
            const result = testFunction.calculate(number, numberChosen);
            expect(getObjectValue(result)).toStrictEqual([
                [ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, 4950, 1, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });

        it('evaluates finite combinations with scalar, string and array arguments', () => {
            const number = NumberValueObject.create;
            const expected = Number(exactCombination(1024, 512));
            expectRelative(getObjectValue(testFunction.calculate(number(1024), number(512))), expected);
            expectRelative(getObjectValue(testFunction.calculate(StringValueObject.create('1024.9'), number(512.9))), expected);
            const array = getObjectValue(testFunction.calculate(ArrayValueObject.createByArray([[1024, 1029]]), number(512))) as number[][];
            expect(array.map((row) => row.length)).toEqual([2]);
            expectRelative(array[0][0], expected);
            expectRelative(array[0][1], Number(exactCombination(1029, 512)));
        });

        it('preserves domain errors and genuine overflow', () => {
            const number = NumberValueObject.create;
            expect(getObjectValue(testFunction.calculate(number(1030), number(515)))).toBe(ErrorType.NUM);
            expect(getObjectValue(testFunction.calculate(number(2), number(3)))).toBe(ErrorType.NUM);
            expect(getObjectValue(testFunction.calculate(number(-1), number(0)))).toBe(ErrorType.NUM);
        });
    });
});
