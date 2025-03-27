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
import { FDist } from '../index';

describe('Test fDist function', () => {
    const testFunction = new FDist(FUNCTION_NAMES_STATISTICAL.F_DIST);

    describe('FDist', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(15.2069);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(0.9900000430027627);
        });

        it('DegFreedom value test', () => {
            const x = NumberValueObject.create(15.2069);
            const degFreedom1 = NumberValueObject.create(0);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NUM);

            const degFreedom3 = NumberValueObject.create(10 ** 10 + 1);
            const result2 = testFunction.calculate(x, degFreedom3, degFreedom2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);
        });

        it('Cumulative value test', () => {
            const x = NumberValueObject.create(15.2069);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(false);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(0.0012237917087831733);

            const x2 = NumberValueObject.create(0);
            const degFreedom3 = NumberValueObject.create(1);
            const result2 = testFunction.calculate(x2, degFreedom3, degFreedom3, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NUM);

            const degFreedom4 = NumberValueObject.create(2);
            const result3 = testFunction.calculate(x2, degFreedom4, degFreedom1, cumulative);
            expect(getObjectValue(result3)).toBe(1);

            const result4 = testFunction.calculate(x, degFreedom4, degFreedom4, cumulative);
            expect(getObjectValue(result4)).toBe(0.0038071509376540248);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(0.4751999999999995);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(0);
        });

        it('Value is error', () => {
            const x = ErrorValueObject.create(ErrorType.NAME);
            const degFreedom1 = NumberValueObject.create(6);
            const degFreedom2 = NumberValueObject.create(4);
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const x2 = NumberValueObject.create(15.2069);
            const degFreedom3 = ErrorValueObject.create(ErrorType.NAME);
            const result2 = testFunction.calculate(x2, degFreedom3, degFreedom2, cumulative);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);

            const result3 = testFunction.calculate(x2, degFreedom1, degFreedom3, cumulative);
            expect(getObjectValue(result3)).toBe(ErrorType.NAME);

            const cumulative2 = ErrorValueObject.create(ErrorType.NAME);
            const result4 = testFunction.calculate(x2, degFreedom1, degFreedom2, cumulative2);
            expect(getObjectValue(result4)).toBe(ErrorType.NAME);
        });

        it('Value is array', () => {
            const x = ArrayValueObject.create({
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
            const cumulative = BooleanValueObject.create(true);
            const result = testFunction.calculate(x, degFreedom1, degFreedom2, cumulative);
            expect(getObjectValue(result)).toStrictEqual([
                [0.4751999999999995, ErrorType.VALUE, 0.560330863013998, 0.4751999999999995, 0, 0],
                [0, 0.9997391714643776, 0.7849737228401481, ErrorType.VALUE, ErrorType.NUM, 0],
            ]);
        });
    });
});
