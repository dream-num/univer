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

import { cellToRange } from '@univerjs/core';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';

import { currencySymbols } from '../base/const/currency-symbols';
import { getCurrencyType } from '../utils/currency';
import {
    getDecimalFromPattern,
    getDecimalString,
    isPatternEqualWithoutDecimal,
    setPatternDecimal,
} from '../utils/decimal';
import { mergeNumfmtMutations } from '../utils/mutation';

describe('test numfmt utils function', () => {
    it('getCurrencyType', () => {
        expect(getCurrencyType(`_(${currencySymbols[3]} 123123`)).toBe(currencySymbols[3]);
        expect(getCurrencyType('_(# 123123')).toBeUndefined();
        expect(getCurrencyType(`_(${currencySymbols[3]} 123123 ${currencySymbols[4]}`)).toBe(currencySymbols[3]);
    });
    it('getDecimalFromPattern', () => {
        expect(getDecimalFromPattern('_(###0.000);--###0.00')).toBe(3);
        expect(getDecimalFromPattern('_(###0);-###0.00')).toBe(0); // the function decimal just use positive,negative configuration ignored
        expect(getDecimalFromPattern('_(###0.0);--###0.00')).toBe(1);
        expect(getDecimalFromPattern('_(###0.);--###0.00')).toBe(0);
    });
    it('isPatternEqualWithoutDecimal', () => {
        expect(isPatternEqualWithoutDecimal('_(###0.000);-###0.00', '[red]_(###0.0000);-###0.00')).toBe(true); // the positive color ignored
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###00.0;-###0.00', '_(###0;[red]-###0.00')).toBe(false);
        expect(isPatternEqualWithoutDecimal('_(###0;-###0.00', '_(###0.00;-###0.00')).toBe(true);
    });
    it('getDecimalString', () => {
        expect(getDecimalString(3)).toBe('000'); // the positive color ignored
        expect(getDecimalString(-1)).toBe(''); // the positive color ignored
        expect(getDecimalString(0)).toBe(''); // the positive color ignored
    });
    it('setPatternDecimal', () => {
        expect(setPatternDecimal('0.', 4)).toBe('0.0000'); // the positive color ignored
        expect(setPatternDecimal('.', 4)).toBe('.0000'); // the positive color ignored
        expect(setPatternDecimal('0.0', 4)).toBe('0.0000'); // the positive color ignored
        expect(setPatternDecimal('0.0', 0)).toBe('0'); // the positive color ignored
    });

    it('mergeNumfmtMutations', () => {
        const result = mergeNumfmtMutations([
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: '', type: '' } },
                },
            },
            {
                id: RemoveNumfmtMutation.id,
                params: {
                    ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)],
                },
            },
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(4, 6), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: '', type: '' } },
                },
            },
        ]);

        expect(result[0].id === RemoveNumfmtMutation.id).toBeTruthy();
        expect(result[1].id === SetNumfmtMutation.id).toBeTruthy();
        expect((result as any)[0].params.ranges).toEqual([
            {
                startRow: 2,
                endRow: 2,
                startColumn: 3,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 5,
            },
        ]);
        expect((result as any)[1].params.values['1'].ranges).toEqual([
            {
                startRow: 2,
                endRow: 2,
                startColumn: 3,
                endColumn: 4,
            },
            {
                startRow: 4,
                endRow: 4,
                startColumn: 5,
                endColumn: 6,
            },
        ]);
    });

    it('mergeNumfmtMutations multiple data formats of different types', () => {
        const result = mergeNumfmtMutations([
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: 'a', type: '' } },
                },
            },
            {
                id: RemoveNumfmtMutation.id,
                params: {
                    ranges: [cellToRange(2, 3), cellToRange(2, 4), cellToRange(4, 5)],
                },
            },
            {
                id: SetNumfmtMutation.id,
                params: {
                    values: {
                        a: { ranges: [cellToRange(4, 6), cellToRange(4, 5)] },
                    },
                    refMap: { a: { pattern: 'b', type: '' } },
                },
            },
        ]);
        expect(result).toEqual([
            {
                id: 'sheet.mutation.remove.numfmt',
                params: {
                    ranges: [
                        {
                            startRow: 2,
                            endRow: 2,
                            startColumn: 3,
                            endColumn: 4,
                        },
                        {
                            startRow: 4,
                            endRow: 4,
                            startColumn: 5,
                            endColumn: 5,
                        },
                    ],
                    unitId: undefined,
                    subUnitId: undefined,
                },
            },
            {
                id: 'sheet.mutation.set.numfmt',
                params: {
                    values: {
                        1: {
                            ranges: [
                                {
                                    startRow: 2,
                                    endRow: 2,
                                    startColumn: 3,
                                    endColumn: 4,
                                },
                                {
                                    startRow: 4,
                                    endRow: 4,
                                    startColumn: 5,
                                    endColumn: 5,
                                },
                            ],
                        },
                        2: {
                            ranges: [
                                {
                                    startRow: 4,
                                    endRow: 4,
                                    startColumn: 5,
                                    endColumn: 6,
                                },
                            ],
                        },
                    },
                    refMap: {
                        1: {
                            pattern: 'a',
                            type: '',
                        },
                        2: {
                            pattern: 'b',
                            type: '',
                        },
                    },
                    unitId: undefined,
                    subUnitId: undefined,
                },
            },
        ]);
    });
});
