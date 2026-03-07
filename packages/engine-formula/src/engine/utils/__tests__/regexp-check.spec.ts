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
import { handleRegExp } from '../regexp-check';

describe('handleRegExp', () => {
    it('should reject lookbehind patterns', () => {
        const result = handleRegExp('(?<=a)b', false);

        expect(result.isError).toBe(true);
        expect(result.regExp).toBeNull();
    });

    it('should reject malformed patterns', () => {
        const result = handleRegExp('abc\\', false);

        expect(result.isError).toBe(true);
        expect(result.regExp).toBeNull();
    });

    it('should reject unsafe regex with nested catastrophic repetition', () => {
        const result = handleRegExp('(a+)+$', false);

        expect(result.isError).toBe(true);
        expect(result.regExp).toBeNull();
    });

    it('should build global unicode regexp when requested', () => {
        const result = handleRegExp('a+', true);

        expect(result.isError).toBe(false);
        expect(result.regExp).not.toBeNull();
        expect(result.regExp?.flags).toContain('g');
        expect(result.regExp?.flags).toContain('u');
        expect('baaac'.match(result.regExp!)?.[0]).toBe('aaa');
    });

    it('should support complex escaped patterns and back references', () => {
        const result = handleRegExp('(\\w+)\\s+\\1', false);

        expect(result.isError).toBe(false);
        expect(result.regExp?.test('hello hello')).toBe(true);
        expect(result.regExp?.test('hello world')).toBe(false);
    });

    it('should accept patterns that include lookbehind-like literals in a char set', () => {
        const result = handleRegExp('[(?<=a)]', false);

        expect(result.isError).toBe(false);
        expect(result.regExp).not.toBeNull();
        expect(result.regExp?.test('(')).toBe(true);
    });
});
