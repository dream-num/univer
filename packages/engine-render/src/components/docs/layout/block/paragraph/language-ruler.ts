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

import type { IParagraph } from '@univerjs/core';

import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import { getFirstGrapheme, hasArabic, hasSpace, hasThai, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { createSkeletonLetterGlyph, createSkeletonWordGlyph } from '../../model/glyph';
import { FontCache } from '../../shaping-engine/font-cache';
import { getFontCreateConfig } from '../../tools';

// Handle English word, English punctuation, number characters.
// https://en.wikipedia.org/wiki/CJK_characters
export function otherHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    const glyphGroup = [];
    let step = 0;
    let src = charArray;

    while (src.length) {
        const char = src.match(/^[\s\S]/gu)?.[0];

        if (char == null) {
            break;
        }

        if (hasSpace(char) || startWithEmoji(charArray.substring(step))) {
            break;
        }

        const config = getFontCreateConfig(index + step, viewModel, paragraphNode, sectionBreakConfig, paragraph);
        const glyph = createSkeletonLetterGlyph(char, config);

        glyphGroup.push(glyph);

        src = src.substring(char.length);

        step += char.length;
    }

    return {
        step,
        glyphGroup,
    };
}

export function ArabicHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    // Combine consecutive Arabic characters into a single glyph so the
    // browser's text-shaping engine (used by `ctx.fillText` /
    // `ctx.measureText`) can apply Arabic cursive joining
    // (initial / medial / final / isolated forms) correctly.
    //
    // IMPORTANT: characters MUST be kept in their original (logical) order.
    // An earlier implementation reversed the characters here as a poor-man's
    // RTL "trick" (so that LTR Canvas painting produced visually right-aligned
    // text). That reversal corrupted shaping because the renderer recomputed
    // joining forms on the reversed string, producing the wrong contextual
    // glyphs. RTL visual reordering is now handled at the glyph-sequence level
    // by `applyBidiReorderToLine`, so we only need to keep the logical order
    // intact here.
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const chars: string[] = [];
    let step = 0;

    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasArabic(newChar)) {
            chars.push(newChar);
            step++;
        } else {
            break;
        }
    }

    const content = chars.join('');
    const glyph = createSkeletonLetterGlyph(content, config);

    // Caret-aware cluster: an Arabic word is rendered as a single
    // shaped glyph (so the browser can apply cursive joining), but the
    // editor must still let the caret land *inside* the cluster. We
    // measure prefix advances now and attach them; the hit-test, caret
    // painter and keyboard step-by-char path all key off
    // `glyph.charAdvances` to operate sub-cluster. Only attach when the
    // cluster has more than one logical character — a one-char "word"
    // has trivial geometry and the legacy path is sufficient.
    //
    // We deliberately scope this to `ArabicHandler` (instead of the
    // generic `_createSkeletonWordOrLetter`) because other multi-char
    // glyphs (e.g. the emoji handler's grapheme-cluster glyph, the
    // Tibetan phrase glyph) should *not* be sub-divisible by the
    // caret: a user dragging through an emoji or a Tibetan syllable
    // expects to step over it as one visual unit. Arabic is the
    // outlier where the shaper joins what users perceive as multiple
    // characters.
    if (content.length > 1 && glyph.fontStyle) {
        const advances = new Array<number>(content.length);
        let prev = 0;
        for (let i = 1; i <= content.length; i++) {
            const box = FontCache.getTextSize(content.slice(0, i), glyph.fontStyle);
            advances[i - 1] = Math.max(box.width, prev);
            prev = advances[i - 1];
        }
        // Pin the last advance to the glyph's painted `width` so
        // downstream consumers can use `charAdvances[count-1]` and
        // `glyph.width` interchangeably (the per-prefix measurement
        // would otherwise drift by sub-pixel rounding).
        advances[content.length - 1] = glyph.width;
        glyph.charAdvances = advances;
    }

    return {
        step,
        glyphGroup: [glyph],
    };
}

export function emojiHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const firstGrapheme = getFirstGrapheme(charArray) || charArray[0];

    return {
        step: firstGrapheme.length,
        glyphGroup: [createSkeletonLetterGlyph(firstGrapheme, config)],
    };
}

export function TibetanHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    // Combine Tibetan phrases
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const glyph = [];
    let step = 0;
    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasTibetan(newChar)) {
            glyph.push(newChar);
            step++;
        } else {
            break;
        }
    }

    return {
        step,
        glyphGroup: [createSkeletonWordGlyph(glyph.join(''), config)],
    };
}

export function ThaiHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraph: IParagraph
) {
    // Combine Thai phrases so complex text layout works correctly.
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
    const glyph = [];
    let step = 0;
    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasThai(newChar)) {
            glyph.push(newChar);
            step++;
        } else {
            break;
        }
    }

    return {
        step,
        glyphGroup: [createSkeletonWordGlyph(glyph.join(''), config)],
    };
}
