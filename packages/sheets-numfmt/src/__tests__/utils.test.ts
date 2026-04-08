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

import { cellToRange, DEFAULT_NUMBER_FORMAT, isPatternEqualWithoutDecimal, LocaleType } from '@univerjs/core';
import { RemoveNumfmtMutation, SetNumfmtMutation } from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { currencySymbols, getCurrencyFormat, getCurrencySymbolByLocale, getCurrencySymbolIconByLocale } from '../base/const/currency-symbols';
import { getCurrencyType } from '../utils/currency';
import { getDecimalFromPattern, getDecimalString, isPatternHasDecimal, setPatternDecimal } from '../utils/decimal';
import { mergeNumfmtMutations } from '../utils/mutation';
import { getCurrencyFormatOptions, getCurrencyOptions, getDateFormatOptions, getNumberFormatOptions } from '../utils/options';
import { getPatternPreview, getPatternPreviewIgnoreGeneral, getPatternType } from '../utils/pattern';

describe('test numfmt utils function', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

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

    it('isPatternHasDecimal', () => {
        expect(isPatternHasDecimal('0.00')).toBe(true);
        expect(isPatternHasDecimal('#,##0')).toBe(true);
        expect(isPatternHasDecimal('General')).toBe(false);
    });

    it('currency symbol helpers', () => {
        expect(getCurrencySymbolByLocale(LocaleType.ZH_CN)).toBe('¥');
        expect(getCurrencySymbolByLocale(LocaleType.KO_KR)).toBe('₩');
        expect(getCurrencySymbolIconByLocale(LocaleType.FR_FR)).toEqual({
            icon: 'EuroIcon',
            symbol: '€',
            locale: LocaleType.FR_FR,
        });
        expect(getCurrencySymbolIconByLocale(LocaleType.KO_KR)).toEqual({
            icon: 'DollarIcon',
            symbol: '$',
            locale: LocaleType.EN_US,
        });
        expect(getCurrencyFormat(LocaleType.ZH_CN, 3)).toContain('"¥"#,##0.000');
        expect(getCurrencyFormat(LocaleType.EN_US, 200)).toContain(`.${'0'.repeat(127)}`);
    });

    it('option helpers expose formatted labels and values', () => {
        expect(getCurrencyOptions()[0]).toEqual({ label: '$', value: '$' });
        expect(getCurrencyFormatOptions('€')[0]).toMatchObject({
            label: expect.stringContaining('€'),
            value: expect.stringContaining('€'),
        });
        expect(getDateFormatOptions()[0]).toMatchObject({
            label: expect.any(String),
            value: expect.any(String),
        });
        expect(getNumberFormatOptions()[0]).toMatchObject({
            label: expect.any(String),
            value: expect.any(String),
        });
    });

    it('pattern preview helpers return types and gracefully handle general or invalid formats', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);

        expect(getPatternType('0%')).toBe('percent');
        expect(getPatternPreview('0.00', 12.3)).toEqual({ result: '12.30' });
        expect(getPatternPreviewIgnoreGeneral(DEFAULT_NUMBER_FORMAT, 0.1 + 0.2)).toEqual({ result: '0.3' });
        expect(getPatternPreview('[invalid', 42)).toEqual({ result: '42' });
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

        const removeMutation = result[0] as { params: { ranges: unknown } };
        const setMutation = result[1] as { params: { values: Record<string, { ranges: unknown }> } };

        expect(result[0].id === RemoveNumfmtMutation.id).toBeTruthy();
        expect(result[1].id === SetNumfmtMutation.id).toBeTruthy();
        expect(removeMutation.params.ranges).toEqual([
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
        expect(setMutation.params.values['1'].ranges).toEqual([
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
