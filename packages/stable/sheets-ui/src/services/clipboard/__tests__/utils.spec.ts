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

import type { IMutationInfo, IRange } from '@univerjs/core';
import { SetRangeValuesMutation } from '@univerjs/sheets';

import { describe, expect, it } from 'vitest';

import { getRepeatRange, mergeSetRangeValues } from '../utils';

describe('test getRepeatRange', () => {
    it('repeat row 2 times', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 1, endColumn: 1 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 1, endColumn: 1 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 1, endColumn: 1 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 1, endColumn: 1 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 0 },
            },
        ]);
    });

    it('repeat col 2 times', () => {
        const originRange: IRange = { startRow: 1, endRow: 1, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 1, endRow: 1, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 1, endRow: 1, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 1, endRow: 1, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('repeat col 2 times and repeat row 2 times', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target row mod origin row is not 0', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 10, startColumn: 6, endColumn: 9 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 8, endColumn: 8 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
        const result2 = getRepeatRange(originRange, targetRange, true);
        expect(result2).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target col mod origin col is not 0', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 9, startColumn: 6, endColumn: 10 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
            {
                startRange: { startRow: 8, endRow: 8, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
        const result2 = getRepeatRange(originRange, targetRange, true);
        expect(result2).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });

    it('the target range is cell', () => {
        const originRange: IRange = { startRow: 3, endRow: 4, startColumn: 3, endColumn: 4 };
        const targetRange: IRange = { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 };
        const result = getRepeatRange(originRange, targetRange);
        expect(result).toEqual([
            {
                startRange: { startRow: 6, endRow: 6, startColumn: 6, endColumn: 6 },
                repeatRelativeRange: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            },
        ]);
    });
});

describe('test "mergeSetRangeValues"', () => {
    it('empty array, will do nothing', () => {
        const mutations: IMutationInfo[] = [];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([]);
    });

    it('no setRangeValues mutations, will no nothing', () => {
        const mutations: IMutationInfo[] = [{ id: 'whatever', params: {} }];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([{ id: 'whatever', params: {} }]);
    });

    it('setRangeValues mutations are not applied in same worksheet, will do nothing', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ];
        expect(mergeSetRangeValues(mutations)).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ]);
    });
    it('part of setRangeValues mutations are applied in same worksheet, will merge these part', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ];
        expect(mergeSetRangeValues(mutations as IMutationInfo[])).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' }, 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '3', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: 'whatever', params: {} },
        ]);
    });

    it('If some setRangeValues appear discontinuously, they will be merged separately.', () => {
        const mutations: IMutationInfo[] = [
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { f: 'formula' } } } } },
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 3: { v: 'value' } } } } },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 4: { v: 'value' } } } } },
        ];
        expect(mergeSetRangeValues(mutations as IMutationInfo[])).toStrictEqual([
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value', f: 'formula' } } } } },
            { id: 'whatever', params: {} },
            { id: SetRangeValuesMutation.id, params: { unitId: '1', subUnitId: '2', cellValue: { 1: { 2: { v: 'value' }, 3: { v: 'value' }, 4: { v: 'value' } } } } },
        ]);
    });
});
