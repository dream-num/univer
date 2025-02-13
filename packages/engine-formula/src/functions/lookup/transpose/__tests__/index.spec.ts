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

import { ArrayValueObject, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Transpose } from '../index';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test transpose function', () => {
    const testFunction = new Transpose(FUNCTION_NAMES_LOOKUP.TRANSPOSE);

    describe('Transpose', () => {
        it('Array value is normal', async () => {
            const array = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    ['Year', null],
                    [2, 1],
                    [null, 3],
                    [11, 4],
                    [true, 5],
                    ['abc', 67],
                    ['test', 8],
                    [ErrorType.NAME, 11],
                    [false, 2],
                    [2, 222],
                ]),
                rowCount: 10,
                columnCount: 2,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject = testFunction.calculate(array);
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Year', 2, 0, 11, true, 'abc', 'test', ErrorType.NAME, false, 2],
                [0, 1, 3, 4, 5, 67, 8, 11, 2, 222],
            ]);
        });

        it('Array value is error', async () => {
            const array = ErrorValueObject.create(ErrorType.NAME);
            const resultObject = testFunction.calculate(array);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);
        });
    });
});
