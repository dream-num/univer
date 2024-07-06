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

import type { ISectionBreakConfig } from '../../../../../basics/interfaces';
import { EMOJI_REG, hasArabic, hasSpace, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { createSkeletonLetterGlyph, createSkeletonWordGlyph } from '../../model/glyph';
import { getFontCreateConfig } from '../../tools';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../../view-model/document-view-model';

// Handle English word, English punctuation, number characters.
// https://en.wikipedia.org/wiki/CJK_characters
export function otherHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const glyphGroup = [];
    let step = 0;

    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];

        if (hasSpace(newChar) || startWithEmoji(charArray.substring(i))) {
            break;
        }

        const config = getFontCreateConfig(index + i, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
        const glyph = createSkeletonLetterGlyph(newChar, config);

        glyphGroup.push(glyph);
        step++;
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
    paragraphStyle: IParagraphStyle
) {
    // 组合阿拉伯语的词组
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const glyph = [];
    let step = 0;

    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasArabic(newChar)) {
            glyph.unshift(newChar);
            step++;
        } else {
            break;
        }
    }

    return {
        step,
        glyphGroup: [createSkeletonLetterGlyph(glyph.join(''), config)],
    };
}

export function emojiHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const match = charArray.match(EMOJI_REG);

    return {
        step: match![0].length,
        glyphGroup: [createSkeletonLetterGlyph(match![0], config)],
    };
}

export function TibetanHandler(
    index: number,
    charArray: string,
    viewModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // 组合藏语词组
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraphStyle);
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
