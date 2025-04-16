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
import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Lookup } from '../index';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';

const arrayValueObject1 = ArrayValueObject.create(/*ts*/ `{
    1, "First";
    2, "Second";
    3, "Third";
    4, "Fourth";
    5, "Fifth";
    6, "Sixth";
    7, "Seventh";
    8, "Eighth"
}`);

const arrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
    1;
    2;
    3;
    4;
    5;
    6;
    7;
    8
}`);

const arrayValueObject3 = ArrayValueObject.create(/*ts*/ `{
    11;
    22;
    33;
    44;
    55;
    66;
    77;
    88
}`);

const matchArrayValueObject = ArrayValueObject.create(/*ts*/ `{
    1, 3;
    4, 6;
    8, 7
}`);

describe('Test lookup', () => {
    const testFunction = new Lookup(FUNCTION_NAMES_LOOKUP.LOOKUP);

    describe('Vector', () => {
        it('Search eight', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(8),
                arrayValueObject2,
                arrayValueObject3
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('88');
        });

        it('Exceeding columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(11),
                arrayValueObject2,
                arrayValueObject3
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('88');
        });

        it('Exceeding columns, smaller', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(0),
                arrayValueObject2,
                arrayValueObject3
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });

        it('Match string', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('999'),
                arrayValueObject2,
                arrayValueObject3
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(ErrorType.NA);
        });
    });

    describe('Array', () => {
        it('Search two', async () => {
            const resultObject = testFunction.calculate(NumberValueObject.create(2), arrayValueObject1) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('Second');
        });
    });
});
