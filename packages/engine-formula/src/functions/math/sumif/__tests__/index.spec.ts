/**
 * Copyright 2023-present DreamNum Inc.
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

import { ArrayValueObject, transformToValue } from '../../../../engine/value-object/array-value-object';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Sumif } from '../index';
import { StringValueObject } from '../../../../engine/value-object/primitive-object';

describe('Test sumif function', () => {
    const textFunction = new Sumif(FUNCTION_NAMES_MATH.SUMIF);

    describe('Sumif', () => {
        it('Range and criteria', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = StringValueObject.create('>40');

            const resultObject = textFunction.calculate(range, criteria);
            expect(resultObject.getValue()).toBe(488);
        });

        it('Sum range with wildcard asterisk', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                Ada;
                test1;
                test12;
                Univer
            }`);

            const criteria = StringValueObject.create('test*');

            const sumRange = ArrayValueObject.create(/*ts*/ `{
                1;
                1;
                1;
                1
            }`);

            const resultObject = textFunction.calculate(range, criteria, sumRange);
            expect(resultObject.getValue()).toBe(2);
        });

        it('ArrayValueObject range and ArrayValueObject criteria', async () => {
            const range = ArrayValueObject.create(/*ts*/ `{
                1;
                4;
                44;
                444
            }`);

            const criteria = ArrayValueObject.create(/*ts*/ `{
                4;
                4;
                44;
                444
            }`);

            const resultObject = textFunction.calculate(range, criteria);
            expect(transformToValue(resultObject.getArrayValue())).toStrictEqual([[4], [4], [44], [444]]);
        });
    });
});
