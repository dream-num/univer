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

import { describe, expect, it } from 'vitest';

import { isCellV, isICellData } from '../i-cell-data';

describe('Test cell data', () => {
    it('function isICellData', () => {
        expect(isICellData({ s: '1' })).toBeTruthy();
        expect(isICellData({ p: { id: '1' } })).toBeTruthy();
        expect(isICellData({ v: '1' })).toBeTruthy();
        expect(isICellData({ f: '=SUM(1)' })).toBeTruthy();
        expect(isICellData({ si: '1' })).toBeTruthy();
        expect(isICellData({ t: 1 })).toBeTruthy();

        expect(isICellData({ a: '1' })).toBeFalsy();
        expect(isICellData(null)).toBeFalsy();
        expect(isICellData(undefined)).toBeFalsy();
        expect(isICellData({})).toBeFalsy();
    });

    it('function isCellV', () => {
        expect(isCellV('1')).toBeTruthy();
        expect(isCellV(1)).toBeTruthy();
        expect(isCellV(true)).toBeTruthy();

        expect(isCellV({ v: '1' })).toBeFalsy();
        expect(isCellV(null)).toBeFalsy();
        expect(isCellV(undefined)).toBeFalsy();
        expect(isCellV({})).toBeFalsy();
    });
});
