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
import { hasRTLCharacter, isFirstStrongCharRTL } from '../text-direction';

describe('isFirstStrongCharRTL', () => {
    it('returns false for empty / nullish input', () => {
        expect(isFirstStrongCharRTL('')).toBe(false);
        expect(isFirstStrongCharRTL(null)).toBe(false);
        expect(isFirstStrongCharRTL(undefined)).toBe(false);
    });

    it('returns false for pure ASCII text', () => {
        expect(isFirstStrongCharRTL('Hello world')).toBe(false);
        expect(isFirstStrongCharRTL('123 abc')).toBe(false);
    });

    it('returns true for text starting with Arabic', () => {
        expect(isFirstStrongCharRTL('مرحبا')).toBe(true);
        expect(isFirstStrongCharRTL('كتاب')).toBe(true);
    });

    it('returns true for text starting with Hebrew', () => {
        expect(isFirstStrongCharRTL('שלום')).toBe(true);
        expect(isFirstStrongCharRTL('עברית')).toBe(true);
    });

    it('skips leading neutrals/digits/punctuation', () => {
        // Digits, punctuation, whitespace don't count as strong; the first
        // strong character is the Arabic letter.
        expect(isFirstStrongCharRTL('   كتاب')).toBe(true);
        expect(isFirstStrongCharRTL('123 كتاب')).toBe(true);
        expect(isFirstStrongCharRTL('"كتاب"')).toBe(true);
    });

    it('returns false when leading neutrals are followed by Latin', () => {
        expect(isFirstStrongCharRTL('   Hello')).toBe(false);
        expect(isFirstStrongCharRTL('123 Hello')).toBe(false);
    });

    it('returns false for CJK-leading strings (CJK is strong LTR per bidi)', () => {
        expect(isFirstStrongCharRTL('中文')).toBe(false);
        expect(isFirstStrongCharRTL('日本語')).toBe(false);
        expect(isFirstStrongCharRTL('한국어')).toBe(false);
    });
});

describe('hasRTLCharacter', () => {
    it('detects RTL anywhere in the string', () => {
        expect(hasRTLCharacter('Hello كتاب world')).toBe(true);
        expect(hasRTLCharacter('Hello world')).toBe(false);
        expect(hasRTLCharacter('')).toBe(false);
        expect(hasRTLCharacter(null)).toBe(false);
    });
});
