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

import { ListGlyphType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getBulletOrderedSymbol } from '../bullet-ruler';

describe('bullet-ruler', () => {
    describe('getBulletOrderedSymbol with DECIMAL', () => {
        it('returns "1" for startIndex=0, startNumber=1', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.DECIMAL)).toBe('1');
        });

        it('returns "10" for startIndex=9, startNumber=1', () => {
            expect(getBulletOrderedSymbol(9, 1, ListGlyphType.DECIMAL)).toBe('10');
        });

        it('returns "7" for startIndex=5, startNumber=2', () => {
            expect(getBulletOrderedSymbol(5, 2, ListGlyphType.DECIMAL)).toBe('7');
        });
    });

    describe('getBulletOrderedSymbol with DECIMAL_ZERO', () => {
        it('prefixes single digit with zero', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.DECIMAL_ZERO)).toBe('01');
            expect(getBulletOrderedSymbol(8, 1, ListGlyphType.DECIMAL_ZERO)).toBe('09');
        });

        it('does not prefix double digits', () => {
            expect(getBulletOrderedSymbol(9, 1, ListGlyphType.DECIMAL_ZERO)).toBe('10');
            expect(getBulletOrderedSymbol(10, 1, ListGlyphType.DECIMAL_ZERO)).toBe('11');
        });
    });

    describe('getBulletOrderedSymbol with UPPER_LETTER', () => {
        it('returns single uppercase letters', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.UPPER_LETTER)).toBe('A');
            expect(getBulletOrderedSymbol(25, 1, ListGlyphType.UPPER_LETTER)).toBe('Z');
        });

        it('returns multi-letter sequences', () => {
            expect(getBulletOrderedSymbol(26, 1, ListGlyphType.UPPER_LETTER)).toBe('AA');
            expect(getBulletOrderedSymbol(51, 1, ListGlyphType.UPPER_LETTER)).toBe('ZZ');
            expect(getBulletOrderedSymbol(52, 1, ListGlyphType.UPPER_LETTER)).toBe('AAA');
        });
    });

    describe('getBulletOrderedSymbol with LOWER_LETTER', () => {
        it('returns single lowercase letters', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.LOWER_LETTER)).toBe('a');
            expect(getBulletOrderedSymbol(25, 1, ListGlyphType.LOWER_LETTER)).toBe('z');
        });

        it('returns multi-letter sequences', () => {
            expect(getBulletOrderedSymbol(26, 1, ListGlyphType.LOWER_LETTER)).toBe('aa');
            expect(getBulletOrderedSymbol(51, 1, ListGlyphType.LOWER_LETTER)).toBe('zz');
            expect(getBulletOrderedSymbol(52, 1, ListGlyphType.LOWER_LETTER)).toBe('aaa');
        });
    });

    describe('getBulletOrderedSymbol with UPPER_ROMAN', () => {
        it('returns basic roman numerals', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.UPPER_ROMAN)).toBe('I');
            expect(getBulletOrderedSymbol(3, 1, ListGlyphType.UPPER_ROMAN)).toBe('IV');
            expect(getBulletOrderedSymbol(8, 1, ListGlyphType.UPPER_ROMAN)).toBe('IX');
        });

        it('returns complex roman numerals', () => {
            expect(getBulletOrderedSymbol(9, 1, ListGlyphType.UPPER_ROMAN)).toBe('X');
            expect(getBulletOrderedSymbol(49, 1, ListGlyphType.UPPER_ROMAN)).toBe('L');
            expect(getBulletOrderedSymbol(99, 1, ListGlyphType.UPPER_ROMAN)).toBe('C');
            expect(getBulletOrderedSymbol(1993, 1, ListGlyphType.UPPER_ROMAN)).toBe('MCMXCIV');
        });
    });

    describe('getBulletOrderedSymbol with LOWER_ROMAN', () => {
        it('returns basic roman numerals', () => {
            expect(getBulletOrderedSymbol(0, 1, ListGlyphType.LOWER_ROMAN)).toBe('i');
            expect(getBulletOrderedSymbol(3, 1, ListGlyphType.LOWER_ROMAN)).toBe('iv');
            expect(getBulletOrderedSymbol(8, 1, ListGlyphType.LOWER_ROMAN)).toBe('ix');
        });

        it('returns complex roman numerals', () => {
            expect(getBulletOrderedSymbol(1993, 1, ListGlyphType.LOWER_ROMAN)).toBe('mcmxciv');
        });
    });

    describe('getBulletOrderedSymbol fallback', () => {
        it('falls back to decimal for unknown glyphType', () => {
            expect(getBulletOrderedSymbol(4, 1, 'unknown' as unknown as ListGlyphType)).toBe('5');
        });
    });
});
