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
import { TDist2t } from '../index';

describe('Test tDist2t function', () => {
    const testFunction = new TDist2t(FUNCTION_NAMES_STATISTICAL.T_DIST_2T);

    describe('TDist2t', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(1);
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result, true)).toBe(0.42264973081);
        });

        it('DegFreedom value test', () => {
            const x = NumberValueObject.create(1);
            const degFreedom = NumberValueObject.create(0);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const degFreedom2 = NumberValueObject.create(10 ** 10 + 1);
            const result2 = testFunction.calculate(x, degFreedom2);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result, true)).toBe(0.42264973081);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(1);
            const degFreedom2 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, degFreedom2);
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
            const degFreedom = NumberValueObject.create(2);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result, true)).toStrictEqual([
                [0.42264973081, ErrorType.VALUE, 0.34374561555, 0.42264973081, 1, 1],
                [1, 0.0000999850024996, 0.14415950895, ErrorType.VALUE, ErrorType.NUM, ErrorType.NAME],
            ]);
        });

        it('More test', () => {
            const x = NumberValueObject.create(0.1);
            const degFreedom = NumberValueObject.create(900000000);
            const result = testFunction.calculate(x, degFreedom);
            expect(getObjectValue(result, true)).toBe(0.920344291478);
        });
    });
});
