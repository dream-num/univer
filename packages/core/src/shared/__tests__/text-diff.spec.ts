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
import { diffText, getTextChangeRange } from '../text-diff';

describe('diffText', () => {
    it('keeps the same occurrence when repeated text admits several edit scripts', () => {
        expect(diffText('aba', 'bab')).toEqual([[-1, 'a'], [0, 'ba'], [1, 'b']]);
        expect(diffText('abcabc', 'abc')).toEqual([[0, 'abc'], [-1, 'abc']]);
    });

    it('retains the span between separate edits and keeps surrogate pairs in one operation', () => {
        expect(diffText('a😀b😇c', 'b😀d😇c')).toEqual([
            [-1, 'a'],
            [1, 'b'],
            [0, '😀'],
            [-1, 'b'],
            [1, 'd'],
            [0, '😇c'],
        ]);
        expect(diffText('😀', '😁')).toEqual([[-1, '😀'], [1, '😁']]);
    });

    it('can represent a splice between UTF-16 surrogate halves', () => {
        const before = '🧑';
        const after = '\uD83Ea\uDDD1';
        const edits = diffText(before, after);
        expect(edits.filter(([kind]) => kind !== 1).map(([, text]) => text).join('')).toBe(before);
        expect(edits.filter(([kind]) => kind !== -1).map(([, text]) => text).join('')).toBe(after);
    });
});

describe('getTextChangeRange', () => {
    it('returns the smallest single UTF-16 replacement even inside a surrogate pair', () => {
        expect(getTextChangeRange('x😀y', 'x😁y')).toEqual({ start: 2, deleteLength: 1, insertLength: 1 });
        expect(getTextChangeRange('aaaa', 'aaaa')).toEqual({ start: 4, deleteLength: 0, insertLength: 0 });
    });

    it('counts entire formula or paragraph tokens when the caller supplies a token list', () => {
        expect(getTextChangeRange(['SUM', 'A12', 'A12'], ['SUM', 'A13', 'A12'])).toEqual({ start: 1, deleteLength: 1, insertLength: 1 });
    });
});
