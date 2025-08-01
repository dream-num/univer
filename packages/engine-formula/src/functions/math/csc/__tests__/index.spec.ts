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
import { Csc } from '../index';

describe('Test csc function', () => {
    const testFunction = new Csc(FUNCTION_NAMES_MATH.CSC);

    describe('Csc', () => {
        it('Value is normal number', () => {
            const value = NumberValueObject.create(1);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(1.18839510578);
        });

        it('Value is number 2**27', () => {
            const value = NumberValueObject.create(2 ** 27);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is number negative', () => {
            const value = NumberValueObject.create(-2);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(-1.09975017029);
        });

        it('Value is number string', () => {
            const value = StringValueObject.create('1.5');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result, true)).toBe(1.00251130425);
        });

        it('Value is normal string', () => {
            const value = StringValueObject.create('test');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const value = BooleanValueObject.create(false);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
        });
        it('Value is blank cell', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.DIV_BY_ZERO);
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
            expect(getObjectValue(result, true)).toStrictEqual([
                [1.18839510578, ErrorType.VALUE, 1.0610205638, 1.18839510578, ErrorType.DIV_BY_ZERO, ErrorType.DIV_BY_ZERO],
                [ErrorType.DIV_BY_ZERO, -1.97485753142, 1.39185664997, ErrorType.VALUE, -7.08616739574, ErrorType.NAME],
            ]);
        });
    });
});
