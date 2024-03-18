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

import type { IParagraphStyle } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType, GridType } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';
import { LineBreaker } from '../../linebreak';
import { tabLineBreakExtension } from '../../linebreak/extensions/tab-linebreak-extension';
import { createSkeletonLetterGlyph, createSkeletonTabGlyph, glyphShrinkLeft, glyphShrinkRight } from '../../model/glyph';
import { getCharSpaceApply, getFontCreateConfig } from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import { hasArabic, hasCJK, hasCJKPunctuation, hasCJKText, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { ArabicHandler, emojiHandler, otherHandler, TibetanHandler } from './language-ruler';

// Now we apply consecutive punctuation adjustment, specified in Chinese Layout
// Requirements, section 3.1.6.1 Punctuation Adjustment Space, and Japanese Layout
// Requirements, section 3.1 Line Composition Rules for Punctuation Marks
function punctuationSpaceAdjustment(shapedGlyphs: IDocumentSkeletonGlyph[]) {
    const len = shapedGlyphs.length;
    for (let i = 0; i < len - 1; i++) {
        const curGlyph = shapedGlyphs[i];
        const nextGlyph = shapedGlyphs[i + 1];
        const { width, content } = curGlyph;
        const delta = width / 2;

        if (
            hasCJKPunctuation(content) &&
            hasCJKPunctuation(nextGlyph.content) &&
            curGlyph.adjustability.shrinkability[1] + nextGlyph.adjustability.shrinkability[0] >= delta
        ) {
            const leftDelta = Math.min(curGlyph.adjustability.shrinkability[1], delta);

            glyphShrinkRight(curGlyph, leftDelta);
            glyphShrinkLeft(nextGlyph, delta - leftDelta);
        }
    }
}

// Add some spacing between Han characters and western characters.
// See Requirements for Chinese Text Layout, Section 3.2.2 Mixed Text Composition in Horizontal
// Written Mode
function addCJKLatinSpacing(shapedTextList: IShapedText[]) {
    const shapedGlyphs = shapedTextList.flatMap((shapedText) => shapedText.glyphs);
    let prevGlyph = null;
    const len = shapedGlyphs.length;
    const LATIN_REG = /[a-z\d]/i;

    for (let i = 0; i < len; i++) {
        const curGlyph = shapedGlyphs[i];
        const nextGlyph = i < len - 1 ? shapedGlyphs[i + 1] : null;
        const { width } = curGlyph;

        // Case 1: CJ followed by a Latin character.
        if (hasCJKText(curGlyph.content) && nextGlyph && LATIN_REG.test(nextGlyph.content)) {
            curGlyph.width += width / 4;
            curGlyph.adjustability.shrinkability[1] += width / 8;
        }

        // Case 2: Latin followed by a CJ character.
        if (hasCJKText(curGlyph.content) && prevGlyph && LATIN_REG.test(prevGlyph.content)) {
            curGlyph.width += width / 4;
            curGlyph.xOffset += width / 4;
            curGlyph.adjustability.shrinkability[0] += width / 8;
        }

        prevGlyph = curGlyph;
    }
}

export interface IShapedText {
    text: string;
    glyphs: IDocumentSkeletonGlyph[];
}

export function shaping(
    content: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
): IShapedText[] {
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        defaultTabStop = 10.5,
    } = sectionBreakConfig;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    const shapedTextList: IShapedText[] = [];
    const breaker = new LineBreaker(content);
    let last = 0;
    let bk;

    // Add custom extension for linebreak.
    tabLineBreakExtension(breaker);

    // eslint-disable-next-line no-cond-assign
    while ((bk = breaker.nextBreak())) {
        // get the string between the last break and this one
        const word = content.slice(last, bk.position);
        let src = word;
        let i = last;
        const shapedGlyphs: IDocumentSkeletonGlyph[] = [];

        while (src.length > 0) {
            const char = src[0];

            if (/\s/.test(char) || hasCJK(char)) {
                const config = getFontCreateConfig(i, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
                let newSpan: IDocumentSkeletonGlyph;

                if (char === DataStreamTreeTokenType.TAB) {
                    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
                    newSpan = createSkeletonTabGlyph(config, charSpaceApply);
                } else {
                    newSpan = createSkeletonLetterGlyph(char, config);
                }

                shapedGlyphs.push(newSpan);
                i++;
                src = src.substring(1);
            } else if (startWithEmoji(src)) {
                const { step, glyphGroup } = emojiHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...glyphGroup);
                i += step;

                src = src.substring(step);
            } else if (hasArabic(char)) {
                const { step, glyphGroup } = ArabicHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...glyphGroup);
                i += step;

                src = src.substring(step);
            } else if (hasTibetan(char)) {
                const { step, glyphGroup } = TibetanHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...glyphGroup);
                i += step;

                src = src.substring(step);
            } else {
                // TODO: 处理一个单词超过 page width 情况
                const { step, glyphGroup } = otherHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...glyphGroup);
                i += step;

                src = src.substring(step);
            }
        }

        // Continuous punctuation space adjustment.
        punctuationSpaceAdjustment(shapedGlyphs);

        shapedTextList.push({
            text: word,
            glyphs: shapedGlyphs,
        });
        last = bk.position;
    }

    // Add some spacing between Han characters and western characters.
    addCJKLatinSpacing(shapedTextList);

    return shapedTextList;
}
