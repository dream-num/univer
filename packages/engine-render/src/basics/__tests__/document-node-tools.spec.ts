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

import { DataStreamTreeTokenType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import {
    getParagraphByGlyph,
    hasListGlyph,
    isFirstGlyph,
    isIndentByGlyph,
    isLastGlyph,
    isPlaceholderOrSpace,
    isSameLine,
} from '../document-node-tools';
import { GlyphType } from '../i-document-skeleton-cached';

function createGlyphLine() {
    const list = { glyphType: GlyphType.LIST, content: '•' } as any;
    const g1 = { glyphType: GlyphType.WORD, content: 'A' } as any;
    const g2 = { glyphType: GlyphType.WORD, content: 'B' } as any;

    const divide = {
        glyphGroup: [list, g1, g2],
    } as any;
    const line = {
        divides: [divide],
        paragraphIndex: 5,
    } as any;

    list.parent = divide;
    g1.parent = divide;
    g2.parent = divide;
    divide.parent = line;

    return { list, g1, g2, divide, line };
}

describe('document node tools', () => {
    it('detects list/first/last glyphs and same-line relations', () => {
        const { list, g1, g2, divide, line } = createGlyphLine();
        expect(hasListGlyph(g1)).toBe(true);
        expect(hasListGlyph(null)).toBe(false);

        expect(isFirstGlyph(list)).toBe(true);
        expect(isFirstGlyph(g1)).toBe(true);
        expect(isFirstGlyph(g2)).toBe(false);

        expect(isLastGlyph(g2)).toBe(true);
        expect(isLastGlyph(g1)).toBe(false);
        expect(isLastGlyph(null)).toBe(false);

        const line2 = { divides: [divide], paragraphIndex: 7 } as any;
        const g3 = { glyphType: GlyphType.WORD, content: 'C', parent: { parent: line2 } } as any;

        expect(isSameLine(g1, g2)).toBe(true);
        expect(isSameLine(g1, g3)).toBe(false);
        expect(isSameLine(null, g3)).toBe(false);
    });

    it('resolves paragraph context and placeholder/space states', () => {
        const { g1, line } = createGlyphLine();
        const body = {
            paragraphs: [
                { startIndex: 2, paragraphStyle: {} },
                { startIndex: 5, paragraphStyle: { indentStart: { v: 2 } } },
            ],
        } as any;

        const paragraph = getParagraphByGlyph(g1, body);
        expect(paragraph).toEqual(expect.objectContaining({
            startIndex: 5,
            paragraphStart: 3,
            paragraphEnd: 5,
        }));
        expect(isIndentByGlyph(g1, body)).toBe(true);

        line.paragraphIndex = 99;
        expect(getParagraphByGlyph(g1, body)).toBeUndefined();
        expect(isIndentByGlyph(g1, body)).toBe(false);

        const placeholder = { streamType: DataStreamTreeTokenType.PARAGRAPH, content: '' } as any;
        const tab = { streamType: DataStreamTreeTokenType.TAB, content: '' } as any;
        const sectionBreak = { streamType: DataStreamTreeTokenType.SECTION_BREAK, content: '' } as any;
        const space = { streamType: '', content: DataStreamTreeTokenType.SPACE } as any;
        const text = { streamType: '', content: 'x' } as any;

        expect(isPlaceholderOrSpace(placeholder)).toBe(true);
        expect(isPlaceholderOrSpace(tab)).toBe(true);
        expect(isPlaceholderOrSpace(sectionBreak)).toBe(true);
        expect(isPlaceholderOrSpace(space)).toBe(true);
        expect(isPlaceholderOrSpace(text)).toBe(false);
        expect(isPlaceholderOrSpace(null)).toBe(false);
    });
});
