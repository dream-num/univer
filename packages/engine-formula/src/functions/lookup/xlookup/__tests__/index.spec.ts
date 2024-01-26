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

/* eslint-disable no-magic-numbers */
import { describe, expect, it } from 'vitest';

import { ArrayValueObject } from '../../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../../engine/value-object/base-value-object';
import {
    NullValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Xlookup } from '..';

const arrayValueObject1 = new ArrayValueObject(/*ts*/ `{
    1, "First", 100, 89;
    2, "Second", 68, 66;
    3, "Third", 100, 75;
    4, "Fourth", 93, 70;
    5, "Fifth", 87, 69;
    6, "Sixth", 96, 82
}`);

const arrayValueObject2 = new ArrayValueObject(/*ts*/ `{
    6, "Sixth";
    1, "First";
    4, "Fourth"
}`);

describe('Test vlookup', () => {
    const textFunction = new Xlookup(FUNCTION_NAMES_LOOKUP.XLOOKUP);

    describe('The value of the lookup', () => {
        it('Search normal', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('Second'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe(66);
        });

        it('Search array', async () => {
            const resultObject = textFunction.calculate(
                arrayValueObject2.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!
            ) as BaseValueObject;
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([[82], [89], [70]]);
        });

        it('Approximate match', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('s*'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                new NullValueObject(''),
                new NumberValueObject(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('66');
        });
    });

    // describe('Approximate match', () => {});
});
