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
import { Choose } from '../index';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { ErrorType } from '../../../../basics/error-type';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';

describe('Test choose function', () => {
    const testFunction = new Choose(FUNCTION_NAMES_LOOKUP.CHOOSE);

    describe('Choose', () => {
        it('Index num and value', async () => {
            const indexNum = NumberValueObject.create(2);
            const value1 = NumberValueObject.create(11);
            const value2 = NumberValueObject.create(22);

            const resultObject = testFunction.calculate(indexNum, value1, value2);
            expect(getObjectValue(resultObject)).toStrictEqual(22);
        });

        it('Index num error', async () => {
            const indexNum = ErrorValueObject.create(ErrorType.NAME);
            const value1 = NumberValueObject.create(11);

            const resultObject = testFunction.calculate(indexNum, value1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.NAME);
        });

        it('Index num and value, exceeding quantity', async () => {
            const indexNum = NumberValueObject.create(3);
            const value1 = NumberValueObject.create(11);
            const value2 = NumberValueObject.create(22);

            const resultObject = testFunction.calculate(indexNum, value1, value2);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);
        });

        it('Index num array', async () => {
            const indexNum = ArrayValueObject.create(/*ts*/ `{
                1,2,3
            }`);
            const value1 = NumberValueObject.create(11);
            const value2 = StringValueObject.create('second');

            const resultObject = testFunction.calculate(indexNum, value1, value2);
            expect(getObjectValue(resultObject)).toStrictEqual([[11, 'second', ErrorType.VALUE]]);
        });

        it('Index num number, value1 array', async () => {
            const indexNum = NumberValueObject.create(1.9);

            const value1 = ArrayValueObject.create(/*ts*/ `{
                2;
                3;
                4
            }`);
            const resultObject = testFunction.calculate(indexNum, value1);
            expect(getObjectValue(resultObject)).toStrictEqual([[2], [3], [4]]);
        });

        it('Index num number negative', async () => {
            const indexNum = NumberValueObject.create(-2);

            const value1 = ArrayValueObject.create(/*ts*/ `{
                2;
                3;
                4
            }`);
            const resultObject = testFunction.calculate(indexNum, value1);
            expect(getObjectValue(resultObject)).toStrictEqual(ErrorType.VALUE);
        });

        it('Index num number, value1 array with blank cell', async () => {
            const indexNum = NumberValueObject.create(1);

            const value1 = ArrayValueObject.create({
                calculateValueList: transformToValueObject([
                    [null],
                ]),
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
            const resultObject = testFunction.calculate(indexNum, value1);
            expect(getObjectValue(resultObject)).toStrictEqual([[0]]);
        });

        it('All params with array', async () => {
            const indexNum = ArrayValueObject.create(/*ts*/ `{
                1;
                2;
                3
            }`);

            const value1 = ArrayValueObject.create(/*ts*/ `{
                11,22,33,44
            }`);

            const value2 = ArrayValueObject.create(/*ts*/ `{
                44,77;
                55,88;
                66,99
            }`);
            const value3 = NumberValueObject.create(3);

            const resultObject = testFunction.calculate(indexNum, value1, value2, value3);
            expect(getObjectValue(resultObject)).toStrictEqual([[11, 22, 33, 44], [55, 88, ErrorType.NA, ErrorType.NA], [3, 3, 3, 3]]);
        });
    });
});
