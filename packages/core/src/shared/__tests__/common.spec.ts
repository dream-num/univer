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
import { cellToRange, isFormulaId, isFormulaString } from '../common';

describe('Test common', () => {
    it('Test cellToRange', () => {
        expect(cellToRange(0, 1)).toStrictEqual({ startRow: 0, startColumn: 1, endRow: 0, endColumn: 1 });
    });

    it('Test isFormulaString', () => {
        expect(isFormulaString('=SUM(1)')).toBe(true);
        expect(isFormulaString('SUM(1)')).toBe(false);
        expect(isFormulaString('=')).toBe(false);
        expect(isFormulaString('')).toBe(false);
        expect(isFormulaString(1)).toBe(false);
        expect(isFormulaString(null)).toBe(false);
        expect(isFormulaString(undefined)).toBe(false);
        expect(isFormulaString(true)).toBe(false);
        expect(isFormulaString({})).toBe(false);
        expect(isFormulaString({ f: '' })).toBe(false);
    });

    it('Test isFormulaId', () => {
        expect(isFormulaId('id1')).toBe(true);
        expect(isFormulaId('')).toBe(false);
        expect(isFormulaId(1)).toBe(false);
        expect(isFormulaId(null)).toBe(false);
        expect(isFormulaId(undefined)).toBe(false);
        expect(isFormulaId(true)).toBe(false);
        expect(isFormulaId({})).toBe(false);
        expect(isFormulaId({ f: '' })).toBe(false);
    });
});
