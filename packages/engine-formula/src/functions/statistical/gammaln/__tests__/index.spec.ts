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
import { FUNCTION_NAMES_STATISTICAL } from '../../function-names';
import { Gammaln } from '../index';

describe('Test gammaln function', () => {
    const testFunction = new Gammaln(FUNCTION_NAMES_STATISTICAL.GAMMALN);

    describe('Gammaln', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(2.5);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result, true)).toBe(0.284682870473);
        });

        it('Value is 0 or negative integers', () => {
            const x = NumberValueObject.create(0);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const x2 = NumberValueObject.create(-1);
            const result2 = testFunction.calculate(x2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is number string', () => {
            const x = StringValueObject.create('4');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result, true)).toBe(1.79175946923);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const result = testFunction.calculate(x);
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
            const result = testFunction.calculate(x);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0, ErrorType.VALUE, -0.0934815108296, 0, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, 359.13420536968, 0.178622038391, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);

            const x2 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [0.123],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result2 = testFunction.calculate(x2);
            expect(getObjectValue(result2, true)).toBe(2.03632750342);
        });

        it('More test', () => {
            const x = NumberValueObject.create(2);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0);
        });
    });
});
