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
import { compareWithWildcard, isMatchWildcard, isWildcard, replaceWildcard } from '../compare';

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
});
