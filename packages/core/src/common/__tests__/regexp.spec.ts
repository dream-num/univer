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
import { regexp } from '../regexp';

describe('regexp utilities', () => {
    it('escapes regular expression syntax characters', () => {
        expect(regexp.escapeRegExp('a+b*c?.[test]')).toBe(String.raw`a\+b\*c\?\.\[test\]`);
        expect(new RegExp(regexp.escapeRegExp('a+b*c?.[test]')).test('a+b*c?.[test]')).toBe(true);
    });

    it('converts wildcard text to an anchored regular expression', () => {
        const regex = regexp.createFromWildcard('file-??-*.ts');

        expect(regex.test('file-ab-index.ts')).toBe(true);
        expect(regex.test('FILE-12-.ts')).toBe(true);
        expect(regex.test('prefix-file-ab-index.ts')).toBe(false);
        expect(regex.test('file-a-index.ts')).toBe(false);
    });

    it('builds literal regexes from text containing regex syntax', () => {
        const regex = regexp.createLiteralRegExp('a.b+(test)?', 'g');

        expect('a.b+(test)? aXb+(test)?'.replace(regex, 'hit')).toBe('hit aXb+(test)?');
    });

    it('builds character sets with union, subtraction, and intersection', () => {
        const letters = regexp.charset(['a', 'f']).subtract('b', ['d', 'e']);
        const reg = letters.toRegExp();

        expect(letters.toString()).toBe('[acf]');
        expect(reg.test('a')).toBe(true);
        expect(reg.test('b')).toBe(false);
        expect(reg.test('c')).toBe(true);
        expect(reg.test('d')).toBe(false);
        expect(reg.test('e')).toBe(false);
        expect(reg.test('f')).toBe(true);

        const intersection = regexp.charset(['a', 'z']).intersect(['m', 'p']);
        expect(intersection.toString()).toBe('[m-p]');
    });

    it('validates dynamic regexp flags before constructing regexes', () => {
        expect(regexp.charset(['a', 'z']).toRegExp('iu').flags).toBe('iu');
        expect(regexp.or('SUM', 'AVERAGE').toRegExp('i').test('sum')).toBe(true);

        expect(() => regexp.charset(['a', 'z']).toRegExp('ii')).toThrow('Invalid regular expression flags');
        expect(() => regexp.charset(['a', 'z']).toRegExp('x')).toThrow('Invalid regular expression flags');
        expect(() => regexp.or('SUM').toRegExp('gg')).toThrow('Invalid regular expression flags');
    });

    it('builds alternatives from strings and character sets', () => {
        const keyword = regexp.or('SUM', 'SUMIF', regexp.charset('A', 'B'));
        const reg = new RegExp(`^${keyword}$`);

        expect(keyword.toString()).toBe('(?:[A-B]|SUM|SUMIF)');
        expect(reg.test('A')).toBe(true);
        expect(reg.test('SUM')).toBe(true);
        expect(reg.test('SUMIF')).toBe(true);
        expect(reg.test('AVERAGE')).toBe(false);
    });
});
