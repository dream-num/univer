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

import type { IParagraphStyle, Nullable } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { IOpenTypeGlyphInfo } from '../../shaping-engine/text-shaping';
import type { ILayoutContext } from '../../tools';
import { BooleanNumber, DataStreamTreeTokenType, GridType, PositionedObjectLayoutType } from '@univerjs/core';
import { hasArabic, hasCJK, hasCJKPunctuation, hasCJKText, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { Lang } from '../../hyphenation/lang';
import { LineBreaker } from '../../line-breaker';
import { BreakPointType } from '../../line-breaker/break';
import { LineBreakerHyphenEnhancer } from '../../line-breaker/enhancers/hyphen-enhancer';
import { LineBreakerLinkEnhancer } from '../../line-breaker/enhancers/link-enhancer';
import { customBlockLineBreakExtension } from '../../line-breaker/extensions/custom-block-linebreak-extension';
import { tabLineBreakExtension } from '../../line-breaker/extensions/tab-linebreak-extension';
import { createSkeletonCustomBlockGlyph, createSkeletonLetterGlyph, createSkeletonTabGlyph, glyphShrinkLeft, glyphShrinkRight } from '../../model/glyph';
import { getBoundingBox } from '../../model/line';
import { fontLibrary } from '../../shaping-engine/font-library';
import { textShape } from '../../shaping-engine/text-shaping';
import { prepareParagraphBody } from '../../shaping-engine/utils';
import { getCharSpaceApply, getFontCreateConfig } from '../../tools';
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

function hyphenConfig(paragraphStyle: IParagraphStyle, sectionBreakConfig: ISectionBreakConfig) {
    const { suppressHyphenation = BooleanNumber.FALSE } = paragraphStyle;
    const { autoHyphenation = BooleanNumber.FALSE } = sectionBreakConfig;

    return suppressHyphenation === BooleanNumber.FALSE && autoHyphenation === BooleanNumber.TRUE;
}

export interface IShapedText {
    text: string;
    glyphs: IDocumentSkeletonGlyph[];
    breakPointType: BreakPointType;
}

export function shaping(
    ctx: ILayoutContext,
    content: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    useOpenType = false // Temporarily disable using opentype for shaping.
): IShapedText[] {
    const {
        gridType = GridType.LINES,
        charSpace = 0,
        defaultTabStop = 10.5,
        drawings = {},
    } = sectionBreakConfig;
    const shapedTextList: IShapedText[] = [];
    let breaker = new LineBreaker(content);
    const { endIndex } = paragraphNode;
    const paragraph = viewModel.getParagraph(endIndex) || { startIndex: 0 };
    const { paragraphStyle = {} } = paragraph;
    const { snapToGrid = BooleanNumber.TRUE } = paragraphStyle;
    let last = 0;
    let bk;
    let lastGlyphIndex = 0;

    const { hyphen, languageDetector } = ctx;

    const paragraphBody = prepareParagraphBody(viewModel.getBody()!, endIndex);

    // const now = +new Date();
    let glyphInfos: IOpenTypeGlyphInfo[] = [];

    if (useOpenType) {
        glyphInfos = textShape(paragraphBody);
    }
    // console.log('Text Shaping Time:', +new Date() - now);

    // Add custom extension for linebreak.
    tabLineBreakExtension(breaker);
    customBlockLineBreakExtension(breaker);

    breaker = new LineBreakerLinkEnhancer(breaker) as unknown as LineBreaker;

    const lang = languageDetector.detect(content);

    const needHyphen = hyphenConfig(paragraphStyle, sectionBreakConfig);
    const doNotHyphenateCaps = sectionBreakConfig.doNotHyphenateCaps === BooleanNumber.TRUE;

    if (lang !== Lang.UNKNOWN && needHyphen) {
        // Use hyphen enhancer when the lang pattern is loaded.
        if (hyphen.hasPattern(lang)) {
            breaker = new LineBreakerHyphenEnhancer(breaker, hyphen, lang, doNotHyphenateCaps) as unknown as LineBreaker;
        } else {
            hyphen.loadPattern(lang);
        }
    }

    // eslint-disable-next-line no-cond-assign
    while ((bk = breaker.nextBreakPoint())) {
        // get the string between the last break and this one
        const word = content.slice(last, bk.position);
        const shapedGlyphs: IDocumentSkeletonGlyph[] = [];

        if (fontLibrary.isReady && useOpenType) {
            const glyphInfosInWord = [];

            let i = 0;
            for (i = lastGlyphIndex; i < glyphInfos.length; i++) {
                const glyphInfo = glyphInfos[i];
                const { end } = glyphInfo;

                if (end > bk.position) {
                    break;
                }

                glyphInfosInWord.push(glyphInfo);
            }
            lastGlyphIndex = i;

            for (const glyphInfo of glyphInfosInWord) {
                const { start, char } = glyphInfo;
                const config = getFontCreateConfig(start, viewModel, paragraphNode, sectionBreakConfig, paragraph);

                if (char === DataStreamTreeTokenType.TAB) {
                    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
                    const newSpan = createSkeletonTabGlyph(config, charSpaceApply);
                    shapedGlyphs.push(newSpan);
                } else if (startWithEmoji(char)) {
                    const newSpan = createSkeletonLetterGlyph(char, config);
                    shapedGlyphs.push(newSpan);
                } else {
                    const newSpan = createSkeletonLetterGlyph(char, config, undefined, glyphInfo);
                    shapedGlyphs.push(newSpan);
                }
            }
        } else {
            let src = word;
            let i = last;
            while (src.length > 0) {
                const char = src.match(/^[\s\S]/gu)?.[0];

                if (char == null) {
                    break;
                }

                if (char === DataStreamTreeTokenType.CUSTOM_BLOCK) {
                    const config = getFontCreateConfig(i, viewModel, paragraphNode, sectionBreakConfig, paragraph);
                    let newGlyph: Nullable<IDocumentSkeletonGlyph> = null;
                    const customBlock = viewModel.getCustomBlockWithoutSetCurrentIndex(paragraphNode.startIndex + i);

                    if (customBlock != null) {
                        const { blockId } = customBlock;
                        const drawingOrigin = drawings[blockId];
                        if (drawingOrigin.layoutType === PositionedObjectLayoutType.INLINE) {
                            const { angle } = drawingOrigin.docTransform;
                            const { width = 0, height = 0 } = drawingOrigin.docTransform.size;
                            const top = 0;
                            const left = 0;
                            const boundingBox = getBoundingBox(angle, left, width, top, height);

                            newGlyph = createSkeletonCustomBlockGlyph(config, boundingBox.width, boundingBox.height, drawingOrigin.drawingId);
                        } else {
                            newGlyph = createSkeletonCustomBlockGlyph(config, 0, 0, drawingOrigin.drawingId);
                        }
                    }

                    if (newGlyph == null) {
                        newGlyph = createSkeletonLetterGlyph(char, config);
                    }

                    shapedGlyphs.push(newGlyph);
                    i += char.length;
                    src = src.substring(char.length);
                } else if (/\s/.test(char) || hasCJK(char)) {
                    const config = getFontCreateConfig(i, viewModel, paragraphNode, sectionBreakConfig, paragraph);
                    let newGlyph: Nullable<IDocumentSkeletonGlyph> = null;

                    if (char === DataStreamTreeTokenType.TAB) {
                        const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
                        newGlyph = createSkeletonTabGlyph(config, charSpaceApply);
                    } else if (char === DataStreamTreeTokenType.PARAGRAPH) {
                        const zeroWidthParagraphBreak = sectionBreakConfig.renderConfig?.zeroWidthParagraphBreak;

                        if (zeroWidthParagraphBreak === BooleanNumber.TRUE) {
                            newGlyph = createSkeletonLetterGlyph(char, config, 0);
                        } else {
                            newGlyph = createSkeletonLetterGlyph(char, config);
                        }
                    } else {
                        newGlyph = createSkeletonLetterGlyph(char, config);
                    }

                    shapedGlyphs.push(newGlyph);
                    i += char.length;
                    src = src.substring(char.length);
                } else if (startWithEmoji(src)) {
                    const { step, glyphGroup } = emojiHandler(
                        i,
                        src,
                        viewModel,
                        paragraphNode,
                        sectionBreakConfig,
                        paragraph
                    );
                    shapedGlyphs.push(...glyphGroup);
                    i += step;

                    src = src.substring(step);
                } else if (hasArabic(char)) {
                    const { step, glyphGroup } = ArabicHandler(
                        i,
                        src,
                        viewModel,
                        paragraphNode,
                        sectionBreakConfig,
                        paragraph
                    );
                    shapedGlyphs.push(...glyphGroup);
                    i += step;

                    src = src.substring(step);
                } else if (hasTibetan(char)) {
                    const { step, glyphGroup } = TibetanHandler(
                        i,
                        src,
                        viewModel,
                        paragraphNode,
                        sectionBreakConfig,
                        paragraph
                    );
                    shapedGlyphs.push(...glyphGroup);
                    i += step;

                    src = src.substring(step);
                } else {
                    const { step, glyphGroup } = otherHandler(
                        i,
                        src,
                        viewModel,
                        paragraphNode,
                        sectionBreakConfig,
                        paragraph
                    );
                    shapedGlyphs.push(...glyphGroup);
                    i += step;

                    src = src.substring(step);
                }
            }
        }

        // Continuous punctuation space adjustment.
        punctuationSpaceAdjustment(shapedGlyphs);

        const shapedGlyphsList: IDocumentSkeletonGlyph[][] = [[]];

        for (let i = 0; i < shapedGlyphs.length; i++) {
            const lastList = shapedGlyphsList[shapedGlyphsList.length - 1];
            const glyph = shapedGlyphs[i];

            // Inline Custom Block can open a new line.
            if (glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK && glyph.width !== 0) {
                if (lastList.length === 0) {
                    shapedGlyphsList.pop();
                }
                shapedGlyphsList.push([glyph]);
            } else {
                lastList.push(glyph);
            }
        }

        const lastShapedGlyphs = shapedGlyphsList[shapedGlyphsList.length - 1];

        for (const shapedGlyphs of shapedGlyphsList) {
            const word = shapedGlyphs.map((g) => g.content).join('');

            shapedTextList.push({
                text: word,
                glyphs: shapedGlyphs,
                breakPointType: shapedGlyphs === lastShapedGlyphs ? bk.type : BreakPointType.Normal,
            });
        }

        last = bk.position;
    }

    // Add some spacing between Han characters and western characters.
    addCJKLatinSpacing(shapedTextList);

    return shapedTextList;
}
