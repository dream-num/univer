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
import { textContain, textEqual, textNotContain, textNotEqual, textStartWith } from '../condition/textFuncGenerator';

describe('text condition test', () => {
    it('textEqual test', () => {
        // unit test for textEqual
        expect(textEqual('a', 'a')).toBe(true);
        expect(textEqual('a', 'b')).toBe(false);
        expect(textEqual('abc', 'abc')).toBe(true);
        expect(textEqual('abc', 'def')).toBe(false);
    });

    it('textNotEqual test', () => {
        // unit test for textNotEqual
        expect(textNotEqual('a', 'a')).toBe(false);
        expect(textNotEqual('a', 'b')).toBe(true);
        expect(textNotEqual('abc', 'abc')).toBe(false);
        expect(textNotEqual('abc', 'def')).toBe(true);
    });
    it('textContain test', () => {
        // unit test for textContain
        expect(textContain('a', 'a')).toBe(true);
        expect(textContain('a', 'b')).toBe(false);
        expect(textContain('abc', 'abc')).toBe(true);
        expect(textContain('abc', 'def')).toBe(false);
    });
    it('textNotContain test', () => {
        // unit test for textNotContain
        expect(textNotContain('a', 'a')).toBe(false);
        expect(textNotContain('a', 'b')).toBe(true);
        expect(textNotContain('abc', 'abc')).toBe(false);
        expect(textNotContain('abc', 'def')).toBe(true);
    });

    it('textNotContain test with empty strings', () => {
        // unit test for textNotContain with empty strings
        expect(textNotContain('', '')).toBe(false);
        expect(textNotContain('', 'a')).toBe(true);
        expect(textNotContain('abc', '')).toBe(false);
    });

    it('textContain test with empty strings', () => {
        // unit test for textContain with empty strings
        expect(textContain('', '')).toBe(true);
        expect(textContain('', 'a')).toBe(false);
        expect(textContain('abc', '')).toBe(true);
    });

    it('textEqual test with empty strings', () => {
        // unit test for textEqual with empty strings
        expect(textEqual('', '')).toBe(true);
        expect(textEqual('', 'a')).toBe(false);
        expect(textEqual('abc', '')).toBe(false);
    });

    it('textNotEqual test with empty strings', () => {
        // unit test for textNotEqual with empty strings
        expect(textNotEqual('', '')).toBe(false);
        expect(textNotEqual('', 'a')).toBe(true);
        expect(textNotEqual('abc', '')).toBe(true);
    });
    it('textStartWith test with empty strings', () => {
        // unit test for textStartWith with empty strings
        expect(textStartWith('', '')).toBe(true);
        expect(textStartWith('', 'a')).toBe(false);
        expect(textStartWith('abc', '')).toBe(true);
    });

    it('textStartWith test with different case', () => {
        // unit test for textStartWith with different case
        expect(textStartWith('abc', 'a')).toBe(true);
        expect(textStartWith('ABC', 'a')).toBe(false);
        expect(textStartWith('abc', 'A')).toBe(false);
        expect(textStartWith('ABC', 'A')).toBe(true);
    });

    it('textStartWith test with whitespace', () => {
        // unit test for textStartWith with whitespace
        expect(textStartWith('abc', 'a ')).toBe(false);
        expect(textStartWith('abc', ' a')).toBe(false);
        expect(textStartWith(' abc', 'a')).toBe(true);
        expect(textStartWith('a bc', 'a')).toBe(true);
    });
});
