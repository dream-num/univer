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
