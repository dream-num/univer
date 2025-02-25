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

import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Chooserows } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test chooserows function', () => {
    const testFunction = new Chooserows(FUNCTION_NAMES_LOOKUP.CHOOSEROWS);

    describe('Chooserows', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const rowNum1 = NumberValueObject.create(1);
            const rowNum2 = NumberValueObject.create(2);
            const resultObject = testFunction.calculate(array, rowNum1, rowNum2);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 2, 3],
                [2, 3, 4],
            ]);
        });

        it('RowNum value is zero or exceeds the number of rows in the array', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const rowNum1 = NumberValueObject.create(0);
            const resultObject = testFunction.calculate(array, rowNum1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);

            const rowNum2 = NumberValueObject.create(4);
            const resultObject2 = testFunction.calculate(array, rowNum2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);
        });

        it('Array value is error', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const rowNum1 = NumberValueObject.create(11);
            const resultObject = testFunction.calculate(array, rowNum1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);
        });

        it('RowNum value is error or string or boolean or blank cell or multi-row array', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const rowNum1 = ErrorValueObject.create(ErrorType.NAME);
            const resultObject = testFunction.calculate(array, rowNum1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);

            const rowNum2 = StringValueObject.create('test');
            const resultObject2 = testFunction.calculate(array, rowNum2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);

            const rowNum3 = BooleanValueObject.create(true);
            const resultObject3 = testFunction.calculate(array, rowNum3);
            expect(getObjectValue(resultObject3)).toStrictEqual([
                [1, 2, 3],
            ]);

            const rowNum4 = BooleanValueObject.create(false);
            const resultObject4 = testFunction.calculate(array, rowNum4);
            expect(getObjectValue(resultObject4)).toStrictEqual(ErrorType.VALUE);

            const rowNum5 = NullValueObject.create();
            const resultObject5 = testFunction.calculate(array, rowNum5);
            expect(getObjectValue(resultObject5)).toStrictEqual(ErrorType.VALUE);

            const rowNum6 = ArrayValueObject.create('{1;2}');
            const resultObject6 = testFunction.calculate(array, rowNum6);
            expect(getObjectValue(resultObject6)).toStrictEqual(ErrorType.VALUE);
        });
    });
});
