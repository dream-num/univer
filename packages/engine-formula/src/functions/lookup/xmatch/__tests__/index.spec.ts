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
import { ErrorValueObject } from '../../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../../engine/value-object/primitive-object';
import { getObjectValue } from '../../../util';
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

describe('XMATCH descending binary search', () => {
    const xmatch = new Xmatch(FUNCTION_NAMES_LOOKUP.XMATCH);
    const descending = ArrayValueObject.createByArray([[9, 7, 5, 3, 1]]);
    const searchMode = NumberValueObject.create(-2);

    it('finds exact and nearest numeric matches in rows and columns', () => {
        const cases: [number, number, number | ErrorType][] = [
            [9, 0, 1],
            [5, 0, 3],
            [1, 0, 5],
            [6, 0, ErrorType.NA],
            [6, -1, 3],
            [6, 1, 2],
            [0, -1, ErrorType.NA],
            [10, 1, ErrorType.NA],
            [0, 1, 5],
            [10, -1, 1],
        ];
        for (const lookupArray of [descending, descending.transpose()]) {
            for (const [lookup, matchMode, expected] of cases) {
                const result = xmatch.calculate(NumberValueObject.create(lookup), lookupArray, NumberValueObject.create(matchMode), searchMode);
                expect(getObjectValue(result)).toBe(expected);
            }
        }
    });

    it('finds case-insensitive text matches and neighboring text', () => {
        const lookupArray = ArrayValueObject.createByArray([['zebra', 'pear', 'apple']]);
        const cases: [string, number, number | ErrorType][] = [
            ['PEAR', 0, 2],
            ['melon', 0, ErrorType.NA],
            ['melon', -1, 3],
            ['melon', 1, 2],
        ];
        for (const [lookup, matchMode, expected] of cases) {
            const result = xmatch.calculate(StringValueObject.create(lookup), lookupArray, NumberValueObject.create(matchMode), searchMode);
            expect(getObjectValue(result)).toBe(expected);
        }
    });

    it('broadcasts lookup and match-mode arrays with descending binary search', () => {
        const lookups = ArrayValueObject.createByArray([[9, 6, 0]]);
        const matchModes = ArrayValueObject.createByArray([[-1, 1, 1]]);
        expect(getObjectValue(xmatch.calculate(lookups, descending, matchModes, searchMode))).toStrictEqual([[1, 2, 5]]);
    });

    it('accepts a numeric string search mode and retains invalid-mode errors', () => {
        const lookup = NumberValueObject.create(5);
        expect(getObjectValue(xmatch.calculate(lookup, descending, undefined, StringValueObject.create('-2')))).toBe(3);
        const searchModes = ArrayValueObject.createByArray([[-2, 0, -3, 3, 2.5]]);
        expect(getObjectValue(xmatch.calculate(lookup, descending, undefined, searchModes))).toStrictEqual([
            [3, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE, ErrorType.VALUE],
        ]);
    });

    it('retains lookup and optional-argument error propagation', () => {
        const error = ErrorValueObject.create(ErrorType.REF);
        const lookup = NumberValueObject.create(5);
        expect(xmatch.calculate(error, descending, undefined, searchMode)).toBe(error);
        expect(xmatch.calculate(lookup, descending, error, searchMode)).toBe(error);
        expect(xmatch.calculate(lookup, descending, undefined, error)).toBe(error);
    });

    it('rejects wildcard matching with descending binary search', () => {
        const wildcardMode = NumberValueObject.create(2);
        const textArray = ArrayValueObject.createByArray([['cc', 'bb', 'aa']]);
        for (const lookupArray of [textArray, textArray.transpose()]) {
            expect(getObjectValue(xmatch.calculate(StringValueObject.create('b*'), lookupArray, wildcardMode, searchMode))).toBe(ErrorType.VALUE);
        }
        expect(getObjectValue(xmatch.calculate(StringValueObject.create('x'), descending, wildcardMode, searchMode))).toBe(ErrorType.VALUE);
        expect(getObjectValue(xmatch.calculate(StringValueObject.create('b*'), textArray, StringValueObject.create('2'), StringValueObject.create('-2')))).toBe(ErrorType.VALUE);
    });

    it('validates the wildcard combination per broadcast cell and preserves sequential searches', () => {
        const lookupArray = ArrayValueObject.createByArray([['cc', 'bb', 'ba', 'aa']]);
        const searchModes = ArrayValueObject.createByArray([[-2, 1, -1]]);
        expect(getObjectValue(xmatch.calculate(StringValueObject.create('b*'), lookupArray, NumberValueObject.create(2), searchModes))).toStrictEqual([
            [ErrorType.VALUE, 2, 3],
        ]);
        const matchModes = ArrayValueObject.createByArray([[0, -1, 1, 2]]);
        expect(getObjectValue(xmatch.calculate(NumberValueObject.create(5), descending, matchModes, searchMode))).toStrictEqual([
            [3, 3, 3, ErrorType.VALUE],
        ]);
    });
});

describe('XMATCH numeric-looking text in binary search', () => {
    const xmatch = new Xmatch(FUNCTION_NAMES_LOOKUP.XMATCH);

    it.each([2, -2])('finds exact text IDs in rows and columns with search mode %i', (searchMode) => {
        const keys = searchMode === -2 ? ['9', '2', '10'] : ['10', '2', '9'];
        const row = ArrayValueObject.create(`{${keys.map((key) => JSON.stringify(key)).join(',')}}`);
        expect(row.get(0, 0)?.isString()).toBe(true);
        for (const lookupArray of [row, row.transpose()]) {
            for (const [index, key] of keys.entries()) {
                const result = xmatch.calculate(StringValueObject.create(key), lookupArray, NumberValueObject.create(0), NumberValueObject.create(searchMode));
                expect(getObjectValue(result)).toBe(index + 1);
            }
        }
    });

    it('does not conflate leading-zero text IDs with their numeric equivalents', () => {
        for (const searchMode of [2, -2]) {
            const keys = searchMode === -2 ? ['9', '2', '10'] : ['10', '2', '9'];
            const row = ArrayValueObject.create(`{${keys.map((key) => JSON.stringify(key)).join(',')}}`);
            for (const lookupArray of [row, row.transpose()]) {
                const result = xmatch.calculate(StringValueObject.create('02'), lookupArray, NumberValueObject.create(0), NumberValueObject.create(searchMode));
                expect(getObjectValue(result)).toBe(ErrorType.NA);
            }
        }
        const distinctIds = ArrayValueObject.create('{"2","10","02"}');
        expect(getObjectValue(xmatch.calculate(StringValueObject.create('02'), distinctIds, NumberValueObject.create(0), NumberValueObject.create(-2)))).toBe(3);
    });

    it.each([2, -2])('uses text ordering for nearest matches with search mode %i', (searchMode) => {
        const keys = searchMode === -2 ? ['9', '2', '10'] : ['10', '2', '9'];
        const lookupArray = ArrayValueObject.create(`{${keys.map((key) => JSON.stringify(key)).join(',')}}`);
        const cases: [string, number, string | undefined][] = [
            ['11', -1, '10'],
            ['11', 1, '2'],
            ['02', -1, undefined],
            ['02', 1, '10'],
            ['99', -1, '9'],
            ['99', 1, undefined],
        ];
        for (const [lookup, matchMode, expected] of cases) {
            const result = xmatch.calculate(StringValueObject.create(lookup), lookupArray, NumberValueObject.create(matchMode), NumberValueObject.create(searchMode));
            expect(getObjectValue(result)).toBe(expected === undefined ? ErrorType.NA : keys.indexOf(expected) + 1);
        }
    });

    it('broadcasts text lookups without converting individual IDs to numbers', () => {
        const lookupArray = ArrayValueObject.create('{"9","2","10"}');
        const lookups = ArrayValueObject.create('{"10","02","2"}');
        expect(getObjectValue(xmatch.calculate(lookups, lookupArray, NumberValueObject.create(0), NumberValueObject.create(-2)))).toStrictEqual([[3, ErrorType.NA, 2]]);
    });
});

describe('XMATCH exact descending binary-search duplicates', () => {
    const xmatch = new Xmatch(FUNCTION_NAMES_LOOKUP.XMATCH);
    const exact = NumberValueObject.create(0);
    const descending = NumberValueObject.create(-2);

    it.each([
        [[5, 2, 2, 2, 1], 2, 4],
        [[2, 2, 2, 2, 1], 2, 4],
        [[5, 2, 2, 2, 2], 2, 5],
        [[2, 2, 2, 2, 2], 2, 5],
        [[5, 5, 4, 3, 3, 1, 1], 3, 5],
        [[2], 2, 1],
    ] as const)('returns the last exact position in %j for %i', (keys, lookup, expected) => {
        const row = ArrayValueObject.createByArray([[...keys]]);
        for (const lookupArray of [row, row.transpose()]) {
            expect(getObjectValue(xmatch.calculate(NumberValueObject.create(lookup), lookupArray, exact, descending))).toBe(expected);
        }
    });

    it.each([
        ['{"z","b","B","b","a"}', 'B', 4],
        ['{"9","2","2","2","10","02"}', '2', 4],
        ['{"9","2","2","2","10","02"}', '02', 6],
    ] as const)('retains case-insensitive text identity for duplicates in %s', (keys, lookup, expected) => {
        const row = ArrayValueObject.create(keys);
        for (const lookupArray of [row, row.transpose()]) {
            expect(getObjectValue(xmatch.calculate(StringValueObject.create(lookup), lookupArray, exact, descending))).toBe(expected);
        }
    });

    it('returns original positions after numeric and text keys are separated', () => {
        const row = ArrayValueObject.create('{9,"9",2,"2",2,"2",1,"10"}');
        for (const lookupArray of [row, row.transpose()]) {
            expect(getObjectValue(xmatch.calculate(NumberValueObject.create(2), lookupArray, exact, descending))).toBe(5);
            expect(getObjectValue(xmatch.calculate(StringValueObject.create('2'), lookupArray, exact, descending))).toBe(6);
            expect(getObjectValue(xmatch.calculate(StringValueObject.create('02'), lookupArray, exact, descending))).toBe(ErrorType.NA);
        }
    });

    it('broadcasts duplicate lookups and preserves missing-key boundaries', () => {
        const row = ArrayValueObject.create('{5,2,2,2,1}');
        const lookups = ArrayValueObject.create('{2,5,1,3,0,6}');
        const expected = [[4, 1, 5, ErrorType.NA, ErrorType.NA, ErrorType.NA]];
        expect(getObjectValue(xmatch.calculate(lookups, row, exact, descending))).toStrictEqual(expected);
        expect(getObjectValue(xmatch.calculate(lookups.transpose(), row.transpose(), exact, descending))).toStrictEqual(expected[0].map((value) => [value]));
    });

    it('keeps sequential duplicate selection separate from binary tie selection', () => {
        const row = ArrayValueObject.create('{5,2,2,2,1}');
        const searches = ArrayValueObject.create('{-2,1,-1}');
        expect(getObjectValue(xmatch.calculate(NumberValueObject.create(2), row, exact, searches))).toStrictEqual([[4, 2, 4]]);
    });
});
