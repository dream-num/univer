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
import type { IDocumentSkeletonSpan } from '../../../../../basics/i-document-skeleton-cached';
import { LineBreaker } from '../../linebreak';
import { tabLineBreakExtension } from '../../linebreak/extensions/tab-linebreak-extension';
import { createSkeletonLetterSpan, createSkeletonTabSpan } from '../../model/span';
import { getCharSpaceApply, getFontCreateConfig } from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';
import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import { hasArabic, hasCJK, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { ArabicHandler, emojiHandler, otherHandler, TibetanHandler } from './language-ruler';

export interface IShapedText {
    text: string;
    glyphs: IDocumentSkeletonSpan[];
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
        const shapedGlyphs: IDocumentSkeletonSpan[] = [];

        while (src.length > 0) {
            const char = src[0];

            if (/\s/.test(char) || hasCJK(char)) {
                const config = getFontCreateConfig(i, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
                let newSpan: IDocumentSkeletonSpan;

                if (char === DataStreamTreeTokenType.TAB) {
                    const charSpaceApply = getCharSpaceApply(charSpace, defaultTabStop, gridType, snapToGrid);
                    newSpan = createSkeletonTabSpan(config, charSpaceApply);
                } else {
                    newSpan = createSkeletonLetterSpan(char, config);
                }

                shapedGlyphs.push(newSpan);
                i++;
                src = src.substring(1);
            } else if (startWithEmoji(src)) {
                const { step, spanGroup } = emojiHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...spanGroup);
                i += step;

                src = src.substring(step);
            } else if (hasArabic(char)) {
                const { step, spanGroup } = ArabicHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...spanGroup);
                i += step;

                src = src.substring(step);
            } else if (hasTibetan(char)) {
                const { step, spanGroup } = TibetanHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...spanGroup);
                i += step;

                src = src.substring(step);
            } else {
                // TODO: 处理一个单词超过 page width 情况
                const { step, spanGroup } = otherHandler(
                    i,
                    src,
                    bodyModel,
                    paragraphNode,
                    sectionBreakConfig,
                    paragraphStyle
                );
                shapedGlyphs.push(...spanGroup);
                i += step;

                src = src.substring(step);
            }
        }

        shapedTextList.push({
            text: word,
            glyphs: shapedGlyphs,
        });
        last = bk.position;
    }

    return shapedTextList;
}
