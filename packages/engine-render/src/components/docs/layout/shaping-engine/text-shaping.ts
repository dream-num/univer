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

import type { IDocumentBody, IStyleBase } from '@univerjs/core';
import opentype from 'opentype.js/dist/opentype.module';
import { DEFAULT_FONTFACE_PLANE } from '../../../../basics/const';
import type { IDocumentSkeletonGlyph } from '../../../..';
import { EMOJI_REG } from '../../../..';
import { fontLibrary } from './font-library';

interface ITextChunk {
    content: string;
    style?: IStyleBase;
}

export function prepareParagraphBody(body: IDocumentBody, paragraphIndex: number): IDocumentBody {
    const { dataStream, paragraphs = [], textRuns = [] } = body;

    let last = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const { startIndex } = paragraph;

        if (startIndex === paragraphIndex) {
            break;
        }

        last = startIndex + 1;
    }

    const textRunChunks = [];

    for (const textRun of textRuns) {
        const { st, ed } = textRun;

        if (st >= last && st <= paragraphIndex) {
            textRunChunks.push({
                ...textRun,
                st: st - last,
                ed: Math.min(ed, paragraphIndex) - last,
            });
        } else if (ed >= last && ed <= paragraphIndex) {
            textRunChunks.push({
                ...textRun,
                st: Math.max(st, last) - last,
                ed: ed - last,
            });
        }
    }

    return {
        dataStream: dataStream.substring(last, paragraphIndex + 1),
        textRuns: textRunChunks,
    };
}

// Split the paragraph content into text chunks, and each chunk has the same style and font family.
function prepareTextChunks(body: IDocumentBody) {
    const { dataStream, textRuns = [] } = body;
    let offset = 0;
    const chunks: ITextChunk[] = [];

    for (const textRun of textRuns) {
        const { st, ed, ts = {} } = textRun;
        if (st !== offset) {
            chunks.push({
                content: dataStream.substring(offset, st),
            });
        }

        chunks.push({
            content: dataStream.substring(st, ed),
            style: ts,
        });

        offset = ed;
    }

    if (offset !== dataStream.length) {
        chunks.push({
            content: dataStream.substring(offset),
        });
    }

    return chunks;
}

function shapeChunk(content: string, used: Set<string>, families: string[]): IDocumentSkeletonGlyph[] {
    let fi = 0;
    let fontFamily = families[fi];

    while (used.has(fontFamily)) {
        fi++;
        fontFamily = families[fi];
    }

    if (!fontFamily) {
        console.log(content);
        return [];
    }

    used.add(fontFamily);

    const fontBuffer = fontLibrary.getFontByStyle({ ff: fontFamily })?.buffer;
    const font = opentype.parse(fontBuffer);

    const option = {
        kerning: true,
        features: {
            liga: false,
        },
    };

    const results = [];

    const glyphs = font.stringToGlyphs(content, option);
    let gi = 0;

    while (gi < glyphs.length) {
        const glyph = glyphs[gi];
        if (glyph.index !== 0) {
            results.push(glyph);
        } else {
            const start = gi;
            const subStr = content.substring(start);
            const emojiMatch = subStr.match(EMOJI_REG);

            if (emojiMatch) {
                let nextGlyph = glyphs[gi + 1];
                while (nextGlyph?.index === 0 || nextGlyph?.unicode === 8205) {
                    gi++;
                    nextGlyph = glyphs[gi + 1];
                }
                results.push(...shapeChunk(content.slice(start, start + emojiMatch[0].length), used, families));
            } else {
                let nextGlyph = glyphs[gi + 1];
                while (nextGlyph?.index === 0) {
                    gi++;
                    nextGlyph = glyphs[gi + 1];
                }

                results.push(...shapeChunk(content.slice(start, gi + 1), used, families));
            }
        }

        gi++;
    }

    return results;
}

export function textShape(body: IDocumentBody) {
    if (!fontLibrary.isReady) {
        return;
    }

    const chunks = prepareTextChunks(body);

    const glyphs = [];

    for (const chunk of chunks) {
        const { content, style = {} } = chunk;
        let fontFamilies = DEFAULT_FONTFACE_PLANE.split(',').map((family) => family.trim().replace(/["']/g, ''));

        fontFamilies.unshift(style.ff ?? 'Arial');

        fontFamilies = fontLibrary.getValidFontFamilies(fontFamilies);

        glyphs.push(...shapeChunk(content, new Set(), fontFamilies));
    }

    console.log(glyphs);

    return glyphs;
}
