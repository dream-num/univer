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
import { baseAdjustability, glyphShrinkLeft, glyphShrinkRight, isJustifiable, isSpace } from '../glyph';
import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';

describe('Glyph utils test cases', () => {
    describe('test baseAdjustability', () => {
        it('should return correct adjustability for space', () => {
            const result = baseAdjustability(' ', 12);
            expect(result).toEqual({
                stretchability: [0, 6],
                shrinkability: [0, 4],
            });
        });

        it('should return correct adjustability for CJK left aligned punctuation', () => {
            const result = baseAdjustability('，', 10);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [0, 5],
            });
        });

        it('should return correct adjustability for CJK right aligned punctuation', () => {
            const result = baseAdjustability('“', 10);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [5, 0],
            });
        });

        it('should return correct adjustability for CJK center aligned punctuation', () => {
            const result = baseAdjustability('\u{30FB}', 12);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [3, 3],
            });
        });
    });

    describe('test isJustifiable', () => {
        it('should return true for space', () => {
            const result = isJustifiable(' ');
            expect(result).toBe(true);
        });

        it('should return true for Chinese', () => {
            const result = isJustifiable('中');
            expect(result).toBe(true);
        });

        it('should return true for CJK left aligned punctuation', () => {
            const result = isJustifiable('，');
            expect(result).toBe(true);
        });

        it('should return true for CJK right aligned punctuation', () => {
            const result = isJustifiable('“');
            expect(result).toBe(true);
        });

        it('should return true for CJK center aligned punctuation', () => {
            const result = isJustifiable('\u{30FB}');
            expect(result).toBe(true);
        });
    });

    describe('test isSpace', () => {
        it('should return true for space', () => {
            const result = isSpace(' ');
            expect(result).toBe(true);
        });

        it('should return true for non-breaking space', () => {
            const result = isSpace('\u{00A0}');
            expect(result).toBe(true);
        });

        it('should return true for full-width space', () => {
            const result = isSpace('　');
            expect(result).toBe(true);
        });

        it('should return false for other characters', () => {
            const result = isSpace('a');
            expect(result).toBe(false);
        });
    });

    describe('test glyphShrinkRight', () => {
        it('should shrink right', () => {
            const glyph = {
                adjustability: {
                    shrinkability: [10, 10],
                    stretchability: [10, 10],
                },
                width: 20,
            } as IDocumentSkeletonGlyph;
            glyphShrinkRight(glyph, 5);
            expect(glyph.adjustability.shrinkability).toEqual([10, 5]);
            expect(glyph.width).toBe(15);
        });
    });

    describe('test glyphShrinkLeft', () => {
        it('should shrink left', () => {
            const glyph = {
                adjustability: {
                    shrinkability: [10, 10],
                    stretchability: [10, 10],
                },
                xOffset: 0,
                width: 20,
            } as IDocumentSkeletonGlyph;
            glyphShrinkLeft(glyph, 5);
            expect(glyph.adjustability.shrinkability).toEqual([5, 10]);
            expect(glyph.width).toBe(15);
            expect(glyph.xOffset).toBe(-5);
        });
    });
});
