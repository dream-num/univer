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
import { Fisherinv } from '../index';

describe('Test fisherinv function', () => {
    const testFunction = new Fisherinv(FUNCTION_NAMES_STATISTICAL.FISHERINV);

    describe('Fisherinv', () => {
        it('Value is normal', () => {
            const x = NumberValueObject.create(0.75);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0.6351489523872873);
        });

        it('Value is big number', () => {
            const x = NumberValueObject.create(9999999.23658);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(1);
        });

        it('Value is number string', () => {
            const x = StringValueObject.create('0.5');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0.46211715726000974);
        });

        it('Value is normal string', () => {
            const x = StringValueObject.create('test');
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(ErrorType.VALUE);
        });

        it('Value is boolean', () => {
            const x = BooleanValueObject.create(true);
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0.7615941559557649);
        });

        it('Value is null', () => {
            const x = NullValueObject.create();
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toBe(0);
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
                    [0, '100', '2.34', 'test', -3, null],
                ]),
                rowCount: 2,
                columnCount: 6,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const result = testFunction.calculate(x);
            expect(getObjectValue(result)).toStrictEqual([
                [0.7615941559557649, ErrorType.VALUE, 0.8425793256589296, 0.7615941559557649, 0, 0],
                [0, 1, 0.9816125892654238, ErrorType.VALUE, -0.9950547536867306, 0],
            ]);
        });
    });
});
