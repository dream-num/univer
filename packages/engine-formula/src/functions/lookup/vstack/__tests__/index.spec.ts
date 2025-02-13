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
import { Vstack } from '../index';
import { BooleanValueObject, NullValueObject, NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test vstack function', () => {
    const testFunction = new Vstack(FUNCTION_NAMES_LOOKUP.VSTACK);

    describe('Vstack', () => {
        it('Value is normal', async () => {
            const array1 = StringValueObject.create('a');
            const array2 = StringValueObject.create('b');
            const array3 = StringValueObject.create('c');
            const array4 = StringValueObject.create('d');
            const resultObject = testFunction.calculate(array1, array2, array3, array4);
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['a'],
                ['b'],
                ['c'],
                ['d'],
            ]);
        });

        it('Array variant columns less than max columns, fill #N/A', async () => {
            const array1 = StringValueObject.create('a');
            const array2 = StringValueObject.create('b');
            const array3 = StringValueObject.create('c');
            const array4 = StringValueObject.create('d');
            const array5 = ArrayValueObject.create('{e,f}');
            const resultObject = testFunction.calculate(array1, array2, array3, array4, array5);
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['a', ErrorType.NA],
                ['b', ErrorType.NA],
                ['c', ErrorType.NA],
                ['d', ErrorType.NA],
                ['e', 'f'],
            ]);
        });

        it('Array value is error', async () => {
            const array1 = ErrorValueObject.create(ErrorType.NAME);
            const array2 = NumberValueObject.create(1);
            const resultObject = testFunction.calculate(array1, array2);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);
        });

        it('Array value is blank cell', async () => {
            const array1 = ArrayValueObject.create('{1,2,3;2,3,4}');
            const array2 = NullValueObject.create();
            const resultObject = testFunction.calculate(array1, array2);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 2, 3],
                [2, 3, 4],
                [0, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('Array value is boolean', async () => {
            const array1 = ArrayValueObject.create('{1,2,3;2,3,4}');
            const array2 = BooleanValueObject.create(true);
            const array3 = BooleanValueObject.create(false);
            const resultObject = testFunction.calculate(array1, array2, array3);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 2, 3],
                [2, 3, 4],
                [true, ErrorType.NA, ErrorType.NA],
                [false, ErrorType.NA, ErrorType.NA],
            ]);
        });

        it('Array value is different number of rows', async () => {
            const array1 = ArrayValueObject.create('{1,2}');
            const array2 = ArrayValueObject.create('{"test";"a";"b"}');
            const array3 = ArrayValueObject.create('{4,5,6;5,6,7}');
            const resultObject = testFunction.calculate(array1, array2, array3);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 2, ErrorType.NA],
                ['test', ErrorType.NA, ErrorType.NA],
                ['a', ErrorType.NA, ErrorType.NA],
                ['b', ErrorType.NA, ErrorType.NA],
                [4, 5, 6],
                [5, 6, 7],
            ]);
        });
    });
});
