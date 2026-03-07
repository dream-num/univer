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
import { BooleanNumber } from '@univerjs/core';
import { DEFAULT_FONTFACE_PLANE } from '../../../../basics/const';
import { EMOJI_REG } from '../../../../basics/tools';
import { fontLibrary } from './font-library';
import { prepareTextChunks } from './utils';

interface IBoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;

}

interface IOpenTypeGlyph {
    index: number;
    advanceWidth?: number;
    getBoundingBox(): IBoundingBox;
}

interface IOpenTypeFont {
    unitsPerEm: number;
    ascender: number;
    descender: number;
    stringToGlyphs(content: string): IOpenTypeGlyph[];
    getKerningValue(leftGlyph: IOpenTypeGlyph, rightGlyph: IOpenTypeGlyph): number;
}

type OpenTypeParse = (buffer: ArrayBuffer) => IOpenTypeFont;
interface IOpenTypeModule { parse?: OpenTypeParse }

let openTypeParser: Nullable<OpenTypeParse> = null;
let openTypeParserPromise: Nullable<Promise<Nullable<OpenTypeParse>>> = null;

function getOpenTypeParser(): Nullable<OpenTypeParse> {
    if (openTypeParser) {
        return openTypeParser;
    }

    // Trigger async lazy-loading so this works in browser runtimes too.
    void loadOpenTypeParser();

    return null;
}

function loadOpenTypeParser(): Promise<Nullable<OpenTypeParse>> {
    if (openTypeParserPromise) {
        return openTypeParserPromise;
    }

    // @ts-expect-error No need to be able to specify the type here since we check the shape of the module in the promise resolution.
    openTypeParserPromise = import('opentype.js/dist/opentype.module')
        .then((mod) => {
            const parse = (mod as IOpenTypeModule).parse;
            openTypeParser = typeof parse === 'function' ? parse : null;

            return openTypeParser;
        })
        .catch(() => {
            openTypeParser = null;

            return null;
        });

    return openTypeParserPromise;
}

export interface IOpenTypeGlyphInfo {
    char: string;
    start: number;
    end: number;
    glyph: Nullable<IOpenTypeGlyph>;
    font: Nullable<IOpenTypeFont>;
    kerning: number;
    boundingBox: Nullable<IBoundingBox>;
}

const fontCache = new Map<string, IOpenTypeFont>();
const glyphCache: Map<string, IOpenTypeGlyphInfo[]> = new Map();

function createFallbackGlyphInfos(content: string, charPosition: number): IOpenTypeGlyphInfo[] {
    const chars = content.match(/[\s\S]/gu) ?? [];
    const fallback: IOpenTypeGlyphInfo[] = [];
    let startIndex = 0;

    for (const char of chars) {
        fallback.push({
            char,
            start: startIndex + charPosition,
            end: startIndex + charPosition + char.length,
            glyph: null,
            font: null,
            kerning: 0,
            boundingBox: null,
        });

        startIndex += char.length;
    }

    return fallback;
}

function shapeChunk(
    content: string,
    charPosition: number,
    used: Set<string>,
    families: string[],
    style: IStyleBase,
    parseFont: OpenTypeParse
): IOpenTypeGlyphInfo[] {
    let fi = 0;
    let fontFamily = families[fi];

    while (used.has(fontFamily)) {
        fi++;
        fontFamily = families[fi];
    }

    if (!fontFamily) {
        return createFallbackGlyphInfos(content, charPosition);
    }

    used.add(fontFamily);

    const { font: fontInfo, buffer: fontBuffer } = fontLibrary.findBestMatchFontByStyle({
        ff: fontFamily,
        bl: style.bl ?? BooleanNumber.FALSE,
        it: style.it ?? BooleanNumber.FALSE,
    })!;

    let font = fontCache.get(fontInfo.fullName);
    if (!font) {
        font = parseFont(fontBuffer);
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
            const emojiMatch = subStr.match(EMOJI_REG);

            if (emojiMatch) {
                let acc = 0;
                do {
                    acc += chars[gi].length;
                    startIndex += chars[gi].length;
                    gi++;
                } while (acc < emojiMatch[0].length);

                results.push(...shapeChunk(content.slice(start, start + emojiMatch[0].length), charPosition + start, used, families, style, parseFont));

                continue;
            } else {
                let nextGlyph = glyphs[gi + 1];
                let nextChar = chars[gi + 1];

                while (nextGlyph?.index === 0 && !EMOJI_REG.test(nextChar)) {
                    startIndex += chars[gi].length;
                    gi++;
                    nextGlyph = glyphs[gi + 1];
                    nextChar = chars[gi + 1];
                }

                results.push(...shapeChunk(content.slice(start, startIndex + chars[gi].length), charPosition + start, used, families, style, parseFont));
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

    const parseFont = getOpenTypeParser();
    if (!parseFont) {
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
        let fontFamilies = DEFAULT_FONTFACE_PLANE.split(',').map((family) => family.trim().replace(/["']/g, ''));

        fontFamilies.unshift(style.ff ?? 'Arial');

        fontFamilies = fontLibrary.getValidFontFamilies(fontFamilies);

        glyphs.push(...shapeChunk(content, charPosition, new Set(), fontFamilies, style, parseFont));

        charPosition += content.length;
    }

    kerningAdjustment(glyphs);

    glyphCache.set(key, glyphs);

    return glyphs;
}
