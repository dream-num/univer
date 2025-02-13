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
import { Filter } from '../index';
import { NumberValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test filter function', () => {
    const testFunction = new Filter(FUNCTION_NAMES_LOOKUP.FILTER);

    describe('Filter', () => {
        it('Value is normal', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const include = ArrayValueObject.create('{true;false}');
            const resultObject = testFunction.calculate(array, include);
            expect(getObjectValue(resultObject)).toStrictEqual([
                [1, 2, 3],
            ]);
        });

        it('Include value is not normal', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const include = ArrayValueObject.create('{1,2;2,3}');
            const resultObject = testFunction.calculate(array, include);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);

            const include2 = ArrayValueObject.create('{true;"test"}');
            const resultObject2 = testFunction.calculate(array, include2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.VALUE);

            const include3 = ArrayValueObject.create('{true;true;true}');
            const resultObject3 = testFunction.calculate(array, include3);
            expect(getObjectValue(resultObject3)).toStrictEqual(ErrorType.VALUE);
        });

        it('Value is error', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const include = NumberValueObject.create(11);
            const resultObject = testFunction.calculate(array, include);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);

            const array2 = ArrayValueObject.create('{1,2,3;2,3,4}');
            const include2 = ErrorValueObject.create(ErrorType.NULL);
            const resultObject2 = testFunction.calculate(array2, include2);
            expect(getObjectValue(resultObject2)).toStrictEqual(ErrorType.NULL);
        });

        it('IfEmpty value test', async () => {
            const array = ArrayValueObject.create('{1,2,3;2,3,4}');
            const include = ArrayValueObject.create('{false;false}');
            const resultObject = testFunction.calculate(array, include);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.CALC);

            const ifEmpty2 = ArrayValueObject.create('{"empty1";"empty2";"empty3"}');
            const resultObject2 = testFunction.calculate(array, include, ifEmpty2);
            expect(getObjectValue(resultObject2)).toStrictEqual([
                ['empty1'],
                ['empty2'],
                ['empty3'],
            ]);
        });
    });
});
