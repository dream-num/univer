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
import { createSortCompare } from '../sort-compare';
import { getSortIndices } from '../sort-order';
import oracle from './sort-comparison-nls.json';
import permutations from './sort-jamo-excel-com.json';
import largePermutations from './sort-jamo-large-excel-com.json';

describe('Excel word sorting', () => {
    it.each(oracle.cases)('matches CompareStringEx for $left and $right', ({ left, right, expected }) => {
        // An ignored non-ASCII prefix bypasses Excel's ASCII shortcut and isolates NLS.
        expect(createSortCompare()(`\u034F${left}`, `\u034F${right}`)).toBe(expected);
    });

    it('matches every UTF-16 character against independent NLS comparison pivots', () => {
        let hash = 14695981039346656037n;
        const append = (value: number) => {
            hash = BigInt.asUintN(64, (hash ^ BigInt(value)) * 1099511628211n);
        };
        const compare = createSortCompare();
        for (let code = 0; code < 65536; code++) {
            const text = String.fromCharCode(code);
            append(code >>> 8);
            append(code & 255);
            for (const pivot of oracle.oracle.utf16Pivots) append(compare(`\u034F${text}`, `\u034F${pivot}`) + 1);
        }
        expect(hash.toString(16).padStart(16, '0')).toBe(oracle.oracle.utf16ComparisonFnv64);
    });

    it('keeps the ASCII shortcut consistent with NLS for mixed comparisons', () => {
        const compare = createSortCompare();
        for (const [left, right, expected] of [
            ['A', 'a', 0],
            ['A', 'á', -1],
            ['SS', 'ß', 0],
            ['SS', 'ss', 0],
            ['ae', 'æ', 0],
            ['a', 'aa', -1],
            ['10', '9', -1],
            ['Z', 'z', 0],
        ] as const) {
            expect(compare(left, right)).toBe(expected);
            expect(compare(right, left)).toBe(expected === 0 ? 0 : -expected);
        }
    });

    it('compares Jamo extra weights only against other Jamo weights', () => {
        const compare = createSortCompare();
        expect(compare('\u1161', '\u1162')).toBe(-1);
        expect(compare('\u1161', '\uD7A2')).toBe(0);
        expect(compare('\u1162', '\uD7A2')).toBe(0);
        expect(compare('\u1100', '\u3131')).toBe(-1);
    });

    it('matches Excel ASCII prefix handling before combining marks', () => {
        const compare = createSortCompare();
        expect(compare('a\uFC5Eー', 'a\u064C\u0651ー')).toBe(0);
        expect(compare('a', 'a\u00AD')).toBe(-1);
    });

    it('matches Excel natural runs and original-position ties for Jamo', () => {
        const input = ['\u1161', '\u1162', '\uD7A2'];
        const compare = createSortCompare();
        expect(getSortIndices(input.length, (left, right) => -compare(input[left], input[right]))).toEqual([1, 0, 2]);
    });

    it.each(permutations.cases)('matches Excel Jamo sorting positions for $input in order $order', ({ input, order, indices }) => {
        const compare = createSortCompare();
        expect(getSortIndices(input.length, (left, right) => order * compare(input[left], input[right]))).toEqual(indices);
    });

    it.each(largePermutations.cases)('matches Excel block boundaries for $length items, seed $seed, order $order', ({ length, seed, order, indicesFnv64 }) => {
        const chars = ['\u1161', '\u1162', '\uD7A2'];
        const input = Array.from({ length }, (_, index) => chars[(((index + 1) * 17 + seed) % 31) % 3]);
        const compare = createSortCompare();
        const indices = getSortIndices(length, (left, right) => order * compare(input[left], input[right]));
        let hash = 14695981039346656037n;
        for (const index of indices) {
            for (const byte of [index >>> 8, index & 255]) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1099511628211n);
        }
        expect(hash.toString(16).padStart(16, '0')).toBe(indicesFnv64);
    });

    it('keeps equivalent keys stable in both directions', () => {
        const input = ['ß', 'ss', 'SS', 'æ', 'ae', 'Æ'];
        const compare = createSortCompare();
        expect(input.slice().sort(compare)).toEqual(['æ', 'ae', 'Æ', 'ß', 'ss', 'SS']);
        expect(input.slice().sort((left, right) => -compare(left, right))).toEqual(input);
    });

    it('builds long kana keys without overflowing the JavaScript argument stack', () => {
        const input = 'ｧ'.repeat(32767);
        expect(createSortCompare()(input, input.slice(1))).toBeGreaterThan(0);
    });
});
