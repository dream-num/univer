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

import { hashAlgorithm } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { FormulaAstLRU } from '../cache-lru';

// Two AST cache keys that share a 32-bit hash. This is the pair from the reported
// workbook: P1169 holds `=A1*326+23354`, Q16084 holds `=A1*645+321655`.
const UNIT_ID = '00000000-0000-4000-8000-000000000001';
const KEY_A = `${UNIT_ID}:sheet1:15:1168:=A1*326+23354`;
const KEY_B = `${UNIT_ID}:sheet1:16:16083:=A1*645+321655`;

describe('formulaAstLRU', () => {
    it('keeps colliding keys as separate entries', () => {
        expect(hashAlgorithm(KEY_A)).toBe(hashAlgorithm(KEY_B));

        const lru = new FormulaAstLRU<number>(10);
        lru.set(KEY_A, 26614);
        lru.set(KEY_B, 328105);

        expect(lru.get(KEY_A)).toBe(26614);
        expect(lru.get(KEY_B)).toBe(328105);
    });

    it('keeps a cell without its own entry a miss even when another key collides', () => {
        const lru = new FormulaAstLRU<number>(10);
        lru.set(KEY_A, 26614);
        lru.set(KEY_B, 328105);

        const otherCellSameFormula = `${UNIT_ID}:sheet1:17:1168:=A1*326+23354`;
        expect(lru.get(otherCellSameFormula)).toBeUndefined();
    });

    it('exposes original keys through forEach', () => {
        const lru = new FormulaAstLRU<number>(10);
        lru.set(KEY_A, 26614);
        lru.set(KEY_B, 328105);

        const seen = new Map<string, number>();
        lru.forEach((value, key) => {
            seen.set(key, value);
        });

        expect(seen.get(KEY_A)).toBe(26614);
        expect(seen.get(KEY_B)).toBe(328105);
    });

    it('deletes only the requested key', () => {
        const lru = new FormulaAstLRU<number>(10);
        lru.set(KEY_A, 26614);

        lru.delete(KEY_B);

        expect(lru.get(KEY_A)).toBe(26614);

        lru.delete(KEY_A);

        expect(lru.get(KEY_A)).toBeUndefined();
    });

    it('keeps long and short keys independent', () => {
        const lru = new FormulaAstLRU<string>(10);
        lru.set('unit:sheet:0:0:=1+1', 'short');
        lru.set(KEY_A, 'long');

        expect(lru.get('unit:sheet:0:0:=1+1')).toBe('short');
        expect(lru.get(KEY_A)).toBe('long');
    });
});
