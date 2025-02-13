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

import type { IDocumentBody, Nullable } from '@univerjs/core';
import { checkParagraphHasIndentByStyle, DataStreamTreeTokenType } from '@univerjs/core';

import type { IDocumentSkeletonGlyph } from './i-document-skeleton-cached';
import { GlyphType } from './i-document-skeleton-cached';

export function hasListGlyph(glyph: Nullable<IDocumentSkeletonGlyph>) {
    const divide = glyph?.parent;

    if (divide == null) {
        return false;
    }

    const glyphGroup = divide.glyphGroup;

    return glyphGroup[0]?.glyphType === GlyphType.LIST;
}

export function isIndentByGlyph(glyph: Nullable<IDocumentSkeletonGlyph>, body?: IDocumentBody) {
    const paragraph = getParagraphByGlyph(glyph, body);
    if (paragraph == null) {
        return false;
    }
    const { paragraphStyle } = paragraph;

    if (paragraphStyle == null) {
        return false;
    }

    return checkParagraphHasIndentByStyle(paragraphStyle);
}

export function isLastGlyph(glyph: Nullable<IDocumentSkeletonGlyph>) {
    const divide = glyph?.parent;

    const line = divide?.parent;

    const glyphGroup = divide?.glyphGroup;

    const divides = line?.divides;

    if (glyphGroup && glyph && divides && divide) {
        const glyphIndex = glyphGroup.indexOf(glyph);
        const divideIndex = divides.indexOf(divide);

        if (divideIndex === divides.length - 1 && glyphIndex === glyphGroup.length - 1) {
            return true;
        }
    }

    return false;
}

export function isFirstGlyph(glyph: Nullable<IDocumentSkeletonGlyph>) {
    const divide = glyph?.parent;
    const line = divide?.parent;
    const glyphGroup = divide?.glyphGroup;
    const divides = line?.divides;

    if (glyphGroup && glyph && divides && divide) {
        const glyphIndex = glyphGroup.indexOf(glyph);
        const divideIndex = divides.indexOf(divide);

        if (divideIndex === 0 && glyphIndex === 0) {
            return true;
        }

        if (divideIndex === 0 && glyphIndex === 1 && glyphGroup[0].glyphType === GlyphType.LIST) {
            return true;
        }
    }

    return false;
}

export function getParagraphByGlyph(glyph: Nullable<IDocumentSkeletonGlyph>, body?: IDocumentBody) {
    const line = glyph?.parent?.parent;
    if (line == null || body == null) {
        return;
    }
    const paragraphs = body.paragraphs;

    if (paragraphs == null) {
        return;
    }

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const prevParagraph = paragraphs[i - 1];
        if (paragraph.startIndex === line.paragraphIndex) {
            return {
                ...paragraph,
                paragraphStart: (prevParagraph?.startIndex ?? -1) + 1,
                paragraphEnd: paragraph.startIndex,
            };
        }
    }
}

export function isPlaceholderOrSpace(glyph: Nullable<IDocumentSkeletonGlyph>) {
    if (glyph == null) {
        return false;
    }

    if (
        [DataStreamTreeTokenType.PARAGRAPH, DataStreamTreeTokenType.TAB, DataStreamTreeTokenType.SECTION_BREAK].indexOf(
            glyph.streamType
        ) !== -1 ||
        glyph.content === DataStreamTreeTokenType.SPACE
    ) {
        return true;
    }

    return false;
}

export function isSameLine(glyph1: Nullable<IDocumentSkeletonGlyph>, glyph2: Nullable<IDocumentSkeletonGlyph>) {
    if (glyph1 == null) {
        return false;
    }

    if (glyph2 == null) {
        return false;
    }

    if (glyph1.parent == null) {
        return false;
    }

    if (glyph2.parent == null) {
        return false;
    }

    return glyph1.parent.parent === glyph2.parent.parent;
}
