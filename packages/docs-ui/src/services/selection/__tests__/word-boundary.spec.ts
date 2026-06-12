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

import { Direction } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getNextWordBoundaryOffset, getWordBoundaryByIndex } from '../word-boundary';

describe('word boundary helpers', () => {
    it('finds the word under an English character', () => {
        expect(getWordBoundaryByIndex('hello world', 1, 10)).toEqual({
            startOffset: 10,
            endOffset: 15,
        });
    });

    it('finds the word under a Chinese character using the same Segmenter path as double click', () => {
        expect(getWordBoundaryByIndex('中文测试', 1, 20)).toEqual({
            startOffset: 20,
            endOffset: 22,
        });
    });

    it('ignores punctuation and whitespace for direct word lookup', () => {
        expect(getWordBoundaryByIndex('hello, world', 5, 0)).toBeNull();
        expect(getWordBoundaryByIndex('hello world', 5, 0)).toBeNull();
    });

    it('moves to previous and next English word boundaries', () => {
        expect(getNextWordBoundaryOffset('hello world', 8, 10, Direction.LEFT)).toBe(16);
        expect(getNextWordBoundaryOffset('hello world', 1, 10, Direction.RIGHT)).toBe(15);
        expect(getNextWordBoundaryOffset('hello world', 5, 10, Direction.RIGHT)).toBe(21);
    });

    it('moves to previous and next Chinese word boundaries', () => {
        expect(getNextWordBoundaryOffset('中文测试', 3, 20, Direction.LEFT)).toBe(22);
        expect(getNextWordBoundaryOffset('中文测试', 1, 20, Direction.RIGHT)).toBe(22);
        expect(getNextWordBoundaryOffset('中文测试', 2, 20, Direction.RIGHT)).toBe(24);
    });
});
