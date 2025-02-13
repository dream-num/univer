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
import { type BaseValueObject, ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import {
    NullValueObject,
    NumberValueObject,
    StringValueObject,
} from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../__tests__/create-function-test-bed';
import { FUNCTION_NAMES_LOOKUP } from '../../function-names';
import { Xlookup } from '../index';

const arrayValueObject1 = ArrayValueObject.create(/*ts*/ `{
    1, "First", 100, 89;
    2, "Second", 68, 66;
    3, "Third", 100, 75;
    4, "Fourth", 93, 70;
    5, "Fifth", 87, 69;
    6, "Sixth", 96, 82
}`);

const arrayValueObject2 = ArrayValueObject.create(/*ts*/ `{
    6, "Sixth";
    1, "First";
    4, "Fourth"
}`);

const arrayValueObject3 = ArrayValueObject.create(/*ts*/ `{
    0, 500;
    101, 800;
    301, 1000;
    1000, 3000
}`);

const arrayValueObject4 = ArrayValueObject.create(/*ts*/ `{
    701, 3000;
    201, 800;
    401, 2000;
    901, 5000;
    501, 2300;
    1000, 6000;
    601, 2900;
    1, 500;
    201, 1200;
    101, 1700;
    801, 3500
}`);

const arrayValueObject5 = ArrayValueObject.create(/*ts*/ `{
    Red, 15;
    Blue, 16;
    Red, 17;
    Blue, 16.5;
    Gray, 28;
    Blue, 29;
    Black, 30;
    Black, 25;
    Gray, 26;
    Black2, 25;
    Red, 34
}`);

describe('Test xlookup', () => {
    const testFunction = new Xlookup(FUNCTION_NAMES_LOOKUP.XLOOKUP);

    describe('The value of the lookup', () => {
        it('Search normal', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('Second'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('66');
        });

        it('Search normal2', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('Second'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [0, 1])!
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2');
        });

        it('Search horizon', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('Second'),
                arrayValueObject1.transpose().slice([1, 2])!,
                arrayValueObject1.transpose().slice([0, 1])!
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2');
        });

        it('Search array', async () => {
            const resultObject = testFunction.calculate(
                arrayValueObject2.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                [82],
                [89],
                [70],
            ]);
        });

        it('Search across multiple columns', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(5),
                arrayValueObject1.slice(undefined, [0, 1])!,
                arrayValueObject1.slice(undefined, [1])!
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toStrictEqual([
                ['Fifth', 87, 69],
            ]);
        });
    });

    describe('Approximate match test', () => {
        it('Approximate match1', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('s*'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                NullValueObject.create(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('66');
        });

        it('Approximate asc', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                NullValueObject.create(),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('69');
        });

        it('Approximate desc', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [3, 4])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('82');
        });

        it('match_mode is -1', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                arrayValueObject3.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('800');
        });

        it('match_mode 1', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                arrayValueObject3.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1000');
        });

        it('match_mode binary asc', async () => {
            // match_mode 0
            let resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 0 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode -1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2000');

            // match_mode -1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('5000');

            // match_mode 1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('3000');

            // match_mode 2
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe(ErrorType.VALUE);

            // match_mode 2 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe(ErrorType.VALUE);
        });

        it('match_mode binary desc', async () => {
            // match_mode 0
            let resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 0, matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode -1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2900');

            // match_mode -1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode 1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('6000');

            // match_mode 1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode 2
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe(ErrorType.VALUE);

            // match_mode 2 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(-2)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe(ErrorType.VALUE);
        });

        it('match_mode search first-to-last', async () => {
            // match_mode 0
            let resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 0 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('800');

            // match_mode -1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2900');

            // match_mode -1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('800');

            // match_mode 1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('3000');

            // match_mode 1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('800');

            // match_mode 2
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 2 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('800');
        });

        it('match_mode search last-to-first', async () => {
            // match_mode 0
            let resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 0 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(0),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode -1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('2900');

            // match_mode -1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(-1),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode 1
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('3000');

            // match_mode 1 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(1),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');

            // match_mode 2
            resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject)).toBe(ErrorType.NA);

            // match_mode 2 matched
            resultObject = testFunction.calculate(
                NumberValueObject.create(201),
                arrayValueObject4.slice(undefined, [0, 1])!,
                arrayValueObject4.slice(undefined, [1])!,
                NullValueObject.create(),
                NumberValueObject.create(2),
                NumberValueObject.create(-1)
            ) as BaseValueObject;
            expect(getObjectValue(resultObject).toString()).toBe('1200');
        });
    });

    describe('More test', () => {
        it('MatchMode and searchMode default value test', async () => {
            const lookupValue = NumberValueObject.create(25);
            const lookupArray = arrayValueObject5.slice(undefined, [1])!;
            const returnArray = arrayValueObject5.slice(undefined, [0, 1])!;
            const nullObject = NullValueObject.create();
            const matchMode = NumberValueObject.create(0);
            const searchMode = NumberValueObject.create(1);
            const searchMode2 = NumberValueObject.create(-1);

            const result = testFunction.calculate(lookupValue, lookupArray, returnArray);
            expect(getObjectValue(result)).toBe('Black');

            const result2 = testFunction.calculate(lookupValue, lookupArray, returnArray, nullObject, matchMode);
            expect(getObjectValue(result2)).toBe('Black');

            const result3 = testFunction.calculate(lookupValue, lookupArray, returnArray, nullObject, nullObject, searchMode);
            expect(getObjectValue(result3)).toBe('Black');

            const result4 = testFunction.calculate(lookupValue, lookupArray, returnArray, nullObject, nullObject, searchMode2);
            expect(getObjectValue(result4)).toBe('Black2');
        });

        it('MatchMode and searchMode is error', async () => {
            const lookupValue = NumberValueObject.create(25);
            const lookupArray = arrayValueObject5.slice(undefined, [1])!;
            const returnArray = arrayValueObject5.slice(undefined, [0, 1])!;
            const nullObject = NullValueObject.create();
            const matchMode = ErrorValueObject.create(ErrorType.NAME);
            const searchMode = ErrorValueObject.create(ErrorType.NAME);

            const result = testFunction.calculate(lookupValue, lookupArray, returnArray, nullObject, matchMode);
            expect(getObjectValue(result)).toBe(ErrorType.NAME);

            const result2 = testFunction.calculate(lookupValue, lookupArray, returnArray, nullObject, nullObject, searchMode);
            expect(getObjectValue(result2)).toBe(ErrorType.NAME);
        });
    });
});
