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

const arrayValueObject3 = new ArrayValueObject(/*ts*/ `{
    0, 500;
    101, 800;
    301, 1000;
    1000, 3000
}`);

const arrayValueObject4 = new ArrayValueObject(/*ts*/ `{
    701, 3000;
    101, 800;
    401, 2000;
    901, 5000;
    501, 2300;
    1000, 6000
    601, 2900;
    0, 500;
    201, 1200;
    301, 1700;
    801, 3500
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
            expect(resultObject.getValue().toString()).toBe('66');
        });

        it('Search normal2', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('Second'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [0, 1])!
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('2');
        });

        it('Search horizon', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('Second'),
                arrayValueObject1.transpose().slice([1, 2])!,
                arrayValueObject1.transpose().slice([0, 1])!
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('2');
        });

        it('Search array', async () => {
            const resultObject = textFunction.calculate(
                arrayValueObject2.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!
            ) as BaseValueObject;
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([[82], [89], [70]]);
        });

        it('Search across multiple columns', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(5),
                arrayValueObject1.slice(undefined, [0, 1])!,
                arrayValueObject1.slice(undefined, [1])!
            ) as BaseValueObject;
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([['Fifth', 87, 69]]);
        });
    });

    describe('Approximate match test', () => {
        it('Approximate match1', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('s*'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                new NullValueObject(''),
                new NumberValueObject(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('66');
        });

        it('Approximate asc', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                new NullValueObject(''),
                new NumberValueObject(2)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('69');
        });

        it('Approximate desc', async () => {
            const resultObject = textFunction.calculate(
                new StringValueObject('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                new NullValueObject(''),
                new NumberValueObject(2),
                new NumberValueObject(-1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('82');
        });

        it('match_mode is -1', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                arrayValueObject3.slice(undefined, [1])!,
                new NullValueObject(''),
                new NumberValueObject(-1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('800');
        });

        it('match_mode 1', async () => {
            const resultObject = textFunction.calculate(
                new NumberValueObject(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                arrayValueObject3.slice(undefined, [1])!,
                new NullValueObject(''),
                new NumberValueObject(1)
            ) as BaseValueObject;
            expect(resultObject.getValue().toString()).toBe('1000');
        });

        // it('match_mode binary asc', async () => {
        //     const resultObject = textFunction.calculate(
        //         new NumberValueObject(660),
        //         arrayValueObject4.slice(undefined, [0, 1])!,
        //         arrayValueObject4.slice(undefined, [1])!,
        //         new NullValueObject(''),
        //         new NumberValueObject(0),
        //         new NumberValueObject(2)
        //     ) as BaseValueObject;
        //     expect(resultObject.getValue().toString()).toBe('2900');
        // });

        // it('match_mode binary desc', async () => {
        //     const resultObject = textFunction.calculate(
        //         new NumberValueObject(660),
        //         arrayValueObject4.slice(undefined, [0, 1])!,
        //         arrayValueObject4.slice(undefined, [1])!,
        //         new NullValueObject(''),
        //         new NumberValueObject(0),
        //         new NumberValueObject(-2)
        //     ) as BaseValueObject;
        //     expect(resultObject.getValue().toString()).toBe('2900');
        // });
    });
});
