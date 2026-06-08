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

import type { IDocumentBody, IStyleBase, Nullable } from '@univerjs/core';
import type Opentype from 'opentype.js';
import { BooleanNumber } from '@univerjs/core';
import { parse } from 'opentype.js';
import { DEFAULT_FONTFACE_PLANE } from '../../../../basics/const';
import { getFirstGrapheme, isEmojiGrapheme } from '../../../../basics/tools';
import { fontLibrary } from './font-library';
import { prepareTextChunks } from './utils';

interface IBoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

}

export interface IOpenTypeGlyphInfo {
    char: string;
    start: number;
    end: number;
    glyph: Nullable<Opentype.Glyph>;
    font: Nullable<Opentype.Font>;
    kerning: number;
    boundingBox: Nullable<IBoundingBox>;
}

const fontCache = new Map<string, Opentype.Font>();
const glyphCache: Map<string, IOpenTypeGlyphInfo[]> = new Map();
const fontFamilyCache = new Map<string, string[]>();

function trimOuterQuotes(value: string): string {
    const firstChar = value.charCodeAt(0);
    const lastChar = value.charCodeAt(value.length - 1);
    const hasLeadingQuote = firstChar === 34 || firstChar === 39;
    const hasTrailingQuote = lastChar === 34 || lastChar === 39;

    if (hasLeadingQuote && hasTrailingQuote) {
        return value.slice(1, -1);
    }

    if (hasLeadingQuote) {
        return value.slice(1);
    }

    if (hasTrailingQuote) {
        return value.slice(0, -1);
    }

    return value;
}

function expandFontFamilies(fontFamily: Nullable<string>): string[] {
    if (!fontFamily?.trim()) {
        return [];
    }

    let families = fontFamilyCache.get(fontFamily);

    if (families) {
        return families;
    }

    families = fontFamily
        .split(',')
        .map((family) => trimOuterQuotes(family.trim()))
        .filter(Boolean);

    fontFamilyCache.set(fontFamily, families);

    return families;
}

const defaultFontFamilies = expandFontFamilies(DEFAULT_FONTFACE_PLANE);

function shapeChunk(
    content: string,
    charPosition: number,
    used: Set<string>,
    families: string[],
    style: IStyleBase
): IOpenTypeGlyphInfo[] {
    let fi = 0;
    let fontFamily = families[fi];

    while (used.has(fontFamily)) {
        fi++;
        fontFamily = families[fi];
    }

    if (!fontFamily) {
        return [{
            char: content,
            start: charPosition,
            end: charPosition + content.length,
            glyph: null,
            font: null,
            kerning: 0,
            boundingBox: null,
        }];
    }

    used.add(fontFamily);

    const { font: fontInfo, buffer: fontBuffer } = fontLibrary.findBestMatchFontByStyle({
        ff: fontFamily,
        bl: style.bl ?? BooleanNumber.FALSE,
        it: style.it ?? BooleanNumber.FALSE,
    })!;

    let font = fontCache.get(fontInfo.fullName);
    if (!font) {
        font = parse(fontBuffer) as Opentype.Font;
        fontCache.set(fontInfo.fullName, font);
    }

    // const option = {
    //     kerning: true,
    //     features: {
    //         liga: false,
    //     },
    // };

    const results = [];

    const glyphs = font.stringToGlyphs(content);
    const chars = content.match(/[\s\S]/gu) ?? [];

    let gi = 0;
    let startIndex = 0;

    while (gi < glyphs.length) {
        const glyph = glyphs[gi];
        if (glyph.index !== 0) {
            results.push({
                char: chars[gi],
                start: startIndex + charPosition,
                end: startIndex + charPosition + chars[gi].length,
                glyph,
                font,
                kerning: 0,
                boundingBox: glyph.getBoundingBox(),
            });
        } else {
            const start = startIndex;
            const subStr = content.substring(start);
            const firstGrapheme = getFirstGrapheme(subStr);

            if (firstGrapheme && isEmojiGrapheme(firstGrapheme)) {
                let acc = 0;
                do {
                    acc += chars[gi].length;
                    startIndex += chars[gi].length;
                    gi++;
                } while (acc < firstGrapheme.length);

                results.push(...shapeChunk(content.slice(start, start + firstGrapheme.length), charPosition + start, used, families, style));

                continue;
            } else {
                let nextGlyph = glyphs[gi + 1];
                let nextChar = chars[gi + 1];

                while (nextGlyph?.index === 0 && !isEmojiGrapheme(nextChar)) {
                    startIndex += chars[gi].length;
                    gi++;
                    nextGlyph = glyphs[gi + 1];
                    nextChar = chars[gi + 1];
                }

                results.push(...shapeChunk(content.slice(start, startIndex + chars[gi].length), charPosition + start, used, families, style));
            }
        }

        startIndex += chars[gi]?.length;
        gi++;
    }

    used.delete(fontFamily);

    return results;
}

function kerningAdjustment(glyphs: IOpenTypeGlyphInfo[]) {
    if (glyphs.length < 2) {
        return;
    }

    let lastFont = glyphs[0].font;
    let lastGlyph = glyphs[0].glyph;

    for (let i = 1; i < glyphs.length; i++) {
        const { font, glyph } = glyphs[i];
        if (lastFont !== font || font == null || lastGlyph == null || glyph == null) {
            lastFont = font;
            lastGlyph = glyph;
            continue;
        }

        const kerning = font.getKerningValue(lastGlyph, glyph);

        if (kerning !== 0) {
            glyphs[i].kerning = kerning;
        }

        lastFont = font;
        lastGlyph = glyph;
    }
}

export function textShape(body: IDocumentBody) {
    if (!fontLibrary.isReady) {
        return [];
    }

    const key = JSON.stringify(body);

    if (glyphCache.has(key)) {
        return glyphCache.get(key)!;
    }

    const chunks = prepareTextChunks(body);

    const glyphs = [];
    let charPosition = 0;

    for (const chunk of chunks) {
        const { content, style = {} } = chunk;
        let fontFamilies = [
            ...expandFontFamilies(style.ff ?? 'Arial'),
            ...defaultFontFamilies,
        ];

        fontFamilies = fontLibrary.getValidFontFamilies(fontFamilies);

        glyphs.push(...shapeChunk(content, charPosition, new Set(), fontFamilies, style));

        charPosition += content.length;
    }

    kerningAdjustment(glyphs);

    glyphCache.set(key, glyphs);

    return glyphs;
}
