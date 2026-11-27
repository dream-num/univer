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
import { compareToken } from '../../../basics/token';
import { compareWithWildcard, isMatchWildcard, isWildcard, parseWildcardPattern, replaceWildcard, searchWildcard } from '../compare';

describe('Test compare', () => {
    it('Function isWildcard', () => {
        expect(isWildcard('test')).toBe(false);
        expect(isWildcard('test*')).toBe(true);
        expect(isWildcard('test?')).toBe(true);
    });

    it('Function isMatchWildcard', () => {
        expect(isMatchWildcard('test', 'test')).toBe(true);
        expect(isMatchWildcard('test', 'test*')).toBe(true);
        expect(isMatchWildcard('test', 'test?')).toBe(false);
        expect(isMatchWildcard('test1', 'test*')).toBe(true);
        expect(isMatchWildcard('test1', 'test?')).toBe(true);
        expect(isMatchWildcard('tes', 'test*')).toBe(false);
        expect(isMatchWildcard('test', 'test~*')).toBe(false);
        expect(isMatchWildcard('test*', 'test~*')).toBe(true);
        expect(isMatchWildcard('test', 'test~?')).toBe(false);
        expect(isMatchWildcard('test?', 'test~?')).toBe(true);

        expect(isMatchWildcard('[test]', '[test*]')).toBe(true);
        expect(isMatchWildcard('te', '[test*]')).toBe(false);
    });

    it('Function replaceWildcard', () => {
        expect(replaceWildcard('test*')).toBe('test ');
        expect(replaceWildcard('test?')).toBe('test ');
        expect(replaceWildcard('test~*')).toBe('test*');
        expect(replaceWildcard('test~?')).toBe('test?');
        expect(replaceWildcard('test~~*')).toBe('test~*');

        expect(replaceWildcard('[test*]')).toBe('[test ]');
    });

    it('Function compareWithWildcard', () => {
        expect(compareWithWildcard('test12', 'test*', compareToken.EQUALS)).toBe(true);
        expect(compareWithWildcard('hello', 'test*', compareToken.NOT_EQUAL)).toBe(true);
        expect(compareWithWildcard('test12', 'test*', compareToken.GREATER_THAN)).toBe(true);
        expect(compareWithWildcard('test12', 'test*', compareToken.GREATER_THAN_OR_EQUAL)).toBe(true);
        expect(compareWithWildcard('hello', 'test*', compareToken.LESS_THAN)).toBe(true);
        expect(compareWithWildcard('hello', 'test*', compareToken.LESS_THAN_OR_EQUAL)).toBe(true);
    });

    it('Function parseWildcardPattern', () => {
        expect(parseWildcardPattern('test').literal).toBe('test');
        expect(parseWildcardPattern('test*').literal).toBeNull();
        // ~ makes whatever follows it literal, and a trailing ~ adds nothing.
        expect(parseWildcardPattern('a~*b').literal).toBe('a*b');
        expect(parseWildcardPattern('a~?b').literal).toBe('a?b');
        expect(parseWildcardPattern('a~~b').literal).toBe('a~b');
        expect(parseWildcardPattern('a~~~*b').literal).toBe('a~*b');
        expect(parseWildcardPattern('a~b').literal).toBe('ab');
        expect(parseWildcardPattern('a~').literal).toBe('a');
    });

    it('Function searchWildcard', () => {
        const search = (text: string, pattern: string, fromIndex = 0) => searchWildcard(text, parseWildcardPattern(pattern), fromIndex);

        // The earliest match wins, and a leading * still reports where the match starts.
        expect(search('abc', 'b')).toBe(1);
        expect(search('abc', 'b*')).toBe(1);
        expect(search('abc', '*c')).toBe(0);
        expect(search('abc', '?c')).toBe(1);
        expect(search('abc', 'a?c')).toBe(0);
        // start_num moves the search start, it does not accept an earlier match.
        expect(search('abc', 'b', 2)).toBe(-1);
        expect(search('abc', 'c', 2)).toBe(2);
        expect(search('abc', '*', 2)).toBe(2);
        // Escapes are literal, and a trailing ~ matches nothing.
        expect(search('a*b', 'a~*b')).toBe(0);
        expect(search('a~b', '~~')).toBe(1);
        expect(search('a~*b', '~~~*')).toBe(1);
        expect(search('a~xb', '~x')).toBe(2);
        expect(search('a~b', '~')).toBe(0);
        expect(search('abc', 'x?z')).toBe(-1);
        // A ? covers one character: a surrogate pair such as an emoji is a single ?.
        expect(search('😀', '?')).toBe(0);
        expect(search('😀b', '?b')).toBe(0);
        expect(search('😀', '??')).toBe(-1);
        expect(search('abc', '????')).toBe(-1);
    });
});
