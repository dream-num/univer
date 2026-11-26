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
import { Xmatch } from '../index';

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
    101, 800;
    401, 2000;
    901, 5000;
    501, 2300;
    1000, 6000;
    601, 2900;
    0, 500;
    201, 1200;
    301, 1700;
    801, 3500
}`);

describe('Test xmatch', () => {
    const testFunction = new Xmatch(FUNCTION_NAMES_LOOKUP.XLOOKUP);

    describe('The value of the lookup', () => {
        it('Search single string', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('Second'),
                arrayValueObject1.slice(undefined, [1, 2])!
            );
            expect(resultObject.getValue()).toBe(2);
        });

        it('reads ? and * as ordinary characters in exact match mode', async () => {
            const lookupArray = ArrayValueObject.create('{"ab";"a?";"banana";"b*"}');
            const cases: [string, number | undefined, number | string][] = [
                ['a?', undefined, 2],
                ['A?', 0, 2],
                ['b*', 0, 4],
                ['c*', 0, ErrorType.NA],
                ['a?', 2, 1],
                ['b*', 2, 3],
            ];
            for (const [lookup, matchMode, expected] of cases) {
                const resultObject = testFunction.calculate(
                    StringValueObject.create(lookup),
                    lookupArray,
                    matchMode === undefined ? undefined : NumberValueObject.create(matchMode)
                );
                expect(resultObject.getValue()).toBe(expected);
            }
        });

        it('reads ? and * as ordinary characters in the exact part of match modes -1 and 1', async () => {
            const lookupArray = ArrayValueObject.create('{"ab";"a?";"banana";"b*"}');
            const cases: [string, number, ArrayValueObject, number][] = [
                ['a?', -1, lookupArray, 2],
                ['a?', 1, lookupArray, 2],
                ['B*', -1, lookupArray, 4],
                ['b*', 1, lookupArray, 4],
                // No literal "b*": "apple" is the next smaller item, and "banana" is not an exact match.
                ['b*', -1, ArrayValueObject.create('{"apple";"banana"}'), 1],
            ];
            for (const [lookup, matchMode, lookups, expected] of cases) {
                const resultObject = testFunction.calculate(
                    StringValueObject.create(lookup),
                    lookups,
                    NumberValueObject.create(matchMode)
                );
                expect(resultObject.getValue()).toBe(expected);
            }
        });

        it('orders the fallback candidates of match modes -1 and 1 by value', async () => {
            const cases: [string, number, ArrayValueObject, number | string][] = [
                // The nearest smaller or larger item by text order, not the first candidate found.
                ['c', -1, ArrayValueObject.create('{"a";"b"}'), 2],
                ['c', 1, ArrayValueObject.create('{"a";"b"}'), ErrorType.NA],
                ['dog', -1, ArrayValueObject.create('{"ant";"cat"}'), 2],
                // ? and * are ordinary characters, and "b!" < "b?" < "b0" in text order.
                ['b?', -1, ArrayValueObject.create('{"b!";"b0"}'), 1],
                ['b?', 1, ArrayValueObject.create('{"b!";"b0"}'), 2],
                ['b?', -1, ArrayValueObject.create('{"b0";"b!"}'), 2],
                ['b?', 1, ArrayValueObject.create('{"b0";"b1"}'), 1],
                ['b?', -1, ArrayValueObject.create('{"b0";"b1"}'), ErrorType.NA],
                ['c*', -1, ArrayValueObject.create('{"a";"b"}'), 2],
                ['a*', -1, ArrayValueObject.create('{"ab";"zz"}'), ErrorType.NA],
                ['a*c', -1, ArrayValueObject.create('{"abc";"abd"}'), ErrorType.NA],
            ];
            for (const [lookup, matchMode, lookups, expected] of cases) {
                const resultObject = testFunction.calculate(
                    StringValueObject.create(lookup),
                    lookups,
                    NumberValueObject.create(matchMode)
                );
                expect(resultObject.getValue()).toBe(expected);
            }
        });

        it('reads a single wildcard character and a tilde literally, and keeps match mode 2 wildcards', async () => {
            const literalCases: [string, string, number][] = [
                ['?', '{"a";"?"}', 2],
                ['*', '{"a";"*"}', 2],
                ['~*', '{"*";"~*"}', 2],
                ['a*', '{"ab";"a*"}', 2],
            ];
            for (const [lookup, lookups, expected] of literalCases) {
                const resultObject = testFunction.calculate(
                    StringValueObject.create(lookup),
                    ArrayValueObject.create(lookups),
                    NumberValueObject.create(0)
                );
                expect(resultObject.getValue()).toBe(expected);
            }

            // Match mode 2 still reads ? and * as wildcards, including the tilde escape.
            const wildcardCases: [string, string, number][] = [
                ['~*', '{"*"}', 1],
                ['a*', '{"ab";"zz"}', 1],
                ['b?', '{"b0";"b1"}', 1],
            ];
            for (const [lookup, lookups, expected] of wildcardCases) {
                const resultObject = testFunction.calculate(
                    StringValueObject.create(lookup),
                    ArrayValueObject.create(lookups),
                    NumberValueObject.create(2)
                );
                expect(resultObject.getValue()).toBe(expected);
            }
        });

        it('keeps the first fallback candidate in the search direction', async () => {
            const duplicateText = ArrayValueObject.create('{"b";"b"}');
            const forward = testFunction.calculate(
                StringValueObject.create('c'),
                duplicateText,
                NumberValueObject.create(-1)
            );
            expect(forward.getValue()).toBe(1);

            const reverse = testFunction.calculate(
                StringValueObject.create('c'),
                duplicateText,
                NumberValueObject.create(-1),
                NumberValueObject.create(-1)
            );
            expect(reverse.getValue()).toBe(2);

            const duplicateNumber = ArrayValueObject.create('{1;1}');
            const numberForward = testFunction.calculate(
                NumberValueObject.create(2),
                duplicateNumber,
                NumberValueObject.create(-1)
            );
            expect(numberForward.getValue()).toBe(1);

            const numberReverse = testFunction.calculate(
                NumberValueObject.create(2),
                duplicateNumber,
                NumberValueObject.create(-1),
                NumberValueObject.create(-1)
            );
            expect(numberReverse.getValue()).toBe(2);
        });

        it('Search single string horizon', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('Second'),
                arrayValueObject1.transpose().slice([1, 2])!
            );
            expect(resultObject.getValue()).toBe(2);
        });

        it('Search single number ', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(5),
                arrayValueObject1.slice(undefined, [0, 1])!
            );
            expect(resultObject.getValue()).toBe(5);
        });

        it('Search array', async () => {
            const resultObject = testFunction.calculate(
                arrayValueObject2.slice(undefined, [1, 2])!,
                arrayValueObject1.slice(undefined, [1, 2])!
            );
            expect((resultObject as ArrayValueObject).toValue()).toStrictEqual([[6], [1], [4]]);
        });
    });

    describe('Approximate match test', () => {
        it('Approximate match1', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('s*'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                NumberValueObject.create(2)
            );
            expect(resultObject.getValue()).toBe(2);
        });

        it('Approximate asc', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                NumberValueObject.create(2)
            );
            expect(resultObject.getValue()).toBe(5);
        });

        it('Approximate desc', async () => {
            const resultObject = testFunction.calculate(
                StringValueObject.create('???th'),
                arrayValueObject1.slice(undefined, [1, 2])!,
                NumberValueObject.create(2),
                NumberValueObject.create(-1)
            );
            expect(resultObject.getValue()).toBe(6);
        });

        it('match_mode is -1', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                NumberValueObject.create(-1)
            );
            expect(resultObject.getValue()).toBe(2);
        });

        it('match_mode 1', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(110),
                arrayValueObject3.slice(undefined, [0, 1])!,
                NumberValueObject.create(1)
            );
            expect(resultObject.getValue()).toBe(3);
        });

        it('match_mode binary asc', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                NumberValueObject.create(0),
                NumberValueObject.create(2)
            );
            // FIXME: fix this test
            // expect(resultObject.getValue()).toBe(ErrorType.NA);
        });

        it('match_mode binary desc', async () => {
            const resultObject = testFunction.calculate(
                NumberValueObject.create(660),
                arrayValueObject4.slice(undefined, [0, 1])!,
                NumberValueObject.create(0),
                NumberValueObject.create(-2)
            );
            // FIXME: fix this test
            // expect(resultObject.getValue()).toBe(ErrorType.NA);
        });
    });
});
