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

import { ErrorType } from '../../../../basics/error-type';
import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_DATE } from '../../function-names';
import { ToDate } from '../index';

describe('Test toDate function', () => {
    const testFunction = new ToDate(FUNCTION_NAMES_DATE.TO_DATE);

    describe('ToDate', () => {
        it('value is normal', () => {
            const value = NumberValueObject.create(40826.4375);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(40826.4375);
        });

        it('value is number string', () => {
            const value = StringValueObject.create('40826.4375');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe('40826.4375');
        });

        it('value is normal string', () => {
            const value = StringValueObject.create('test');
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe('test');

            const value2 = StringValueObject.create('50%');
            const result2 = testFunction.calculate(value2);
            expect(getObjectValue(result2)).toBe('50%');
        });

        it('value is blank cell', () => {
            const value = NullValueObject.create();
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(0);
        });

        it('value is boolean', () => {
            const value = BooleanValueObject.create(true);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(true);
        });

        it('value is error', () => {
            const value = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(value);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);
        });

        it('value is array', () => {
            const value = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, 2],
                ]),
                rowCount: 1,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(value);
            expect(result.getValue()).toBe(ErrorType.VALUE);

            const value2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [-1],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(value2);
            expect(result2.getValue()).toBe(-1);
        });
    });
});
