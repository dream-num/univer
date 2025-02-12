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
import { EMOJI_REG, hasArabic, hasSpace, hasTibetan, startWithEmoji } from '../../../../../basics/tools';
import { createSkeletonLetterGlyph, createSkeletonWordGlyph } from '../../model/glyph';
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
    // 组合阿拉伯语的词组
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
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
    paragraph: IParagraph
) {
    const config = getFontCreateConfig(index, viewModel, paragraphNode, sectionBreakConfig, paragraph);
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
    paragraph: IParagraph
) {
    // 组合藏语词组
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
