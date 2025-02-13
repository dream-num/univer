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
import { FInvRt } from '../index';

describe('Test fInvRt function', () => {
    const testFunction = new FInvRt(FUNCTION_NAMES_STATISTICAL.F_INV_RT);

    describe('FInvRt', () => {
        it('Value is normal', () => {
            const probability = NumberValueObject.create(0.01);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(15.206864861157555);
        });

        it('DegFreedom value test', () => {
            const probability = NumberValueObject.create(0.01);
            const degFreedom1 = NumberValueObject.create(0);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const degFreedom3 = NumberValueObject.create(10 ** 10 + 1);
            const result2 = testFunction.calculate(probability, degFreedom3, degFreedom2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const probability = StringValueObject.create('test');
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const probability = BooleanValueObject.create(true);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is null', () => {
            const probability = NullValueObject.create();
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);
        });

        it('Value is error', () => {
            const probability = ErrorValueObject.create(ErrorType.NAME);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const probability2 = NumberValueObject.create(0.01);
            const degFreedom3 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(probability2, degFreedom3, degFreedom2);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const result3 = testFunction.calculate(probability2, degFreedom1, degFreedom3);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const probability = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [1, ' ', 1.23, true, false, null],
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const result = testFunction.calculate(probability, degFreedom1, degFreedom2);
            expect(getObjectValue(result)).toStrictEqual([
                [0, ErrorType.VALUE, ErrorType.NUM, 0, ErrorType.NUM, ErrorType.NUM],
                [ErrorType.NUM, ErrorType.NUM, ErrorType.NUM, ErrorType.VALUE, ErrorType.NUM, ErrorType.NUM],
            ]);
        });
    });
});
