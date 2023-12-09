import type { IParagraphStyle } from '@univerjs/core';

import type { IDocumentSkeletonSpan } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import { EMOJI_REG, hasArabic, hasSpace, hasTibetan, startWithEmoji } from '../../../../basics/tools';
import { createSkeletonLetterSpan, createSkeletonWordSpan } from '../../common/span';
import { getFontCreateConfig } from '../../common/tools';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';

export function composeWordForLayout(
    word: string,
    index: number,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    let src = word;
    let i = index;
    const spanGroup: IDocumentSkeletonSpan[] = [];

    while (src.length > 0) {
        const char = src[0];

        if (/\s/.test(char)) {
            const config = getFontCreateConfig(i, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
            const newSpan = createSkeletonLetterSpan(char, config);

            spanGroup.push(newSpan);
            i++;
            src = src.substring(1);
        } else if (startWithEmoji(src)) {
            const { step, spanGroup: sGroup } = emojiHandler(
                i,
                src,
                bodyModel,
                paragraphNode,
                sectionBreakConfig,
                paragraphStyle
            );
            spanGroup.push(...sGroup);
            i += step;

            src = src.substring(step);
        } else if (hasArabic(char)) {
            const { step, spanGroup: sGroup } = ArabicHandler(
                i,
                src,
                bodyModel,
                paragraphNode,
                sectionBreakConfig,
                paragraphStyle
            );
            spanGroup.push(...sGroup);
            i += step;

            src = src.substring(step);
        } else if (hasTibetan(char)) {
            const { step, spanGroup: sGroup } = TibetanHandler(
                i,
                src,
                bodyModel,
                paragraphNode,
                sectionBreakConfig,
                paragraphStyle
            );
            spanGroup.push(...sGroup);
            i += step;

            src = src.substring(step);
        } else {
            const { step, spanGroup: sGroup } = otherHandler(
                i,
                src,
                bodyModel,
                paragraphNode,
                sectionBreakConfig,
                paragraphStyle
            );
            spanGroup.push(...sGroup);
            i += step;

            src = src.substring(step);
        }
    }

    return spanGroup;
}

// Handle Chinese, Japanese, Korean (CJK), English word, number characters.
// https://en.wikipedia.org/wiki/CJK_characters
function otherHandler(
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const spanGroup = [];
    let step = 0;

    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];

        if (hasSpace(newChar)) {
            break;
        }

        const config = getFontCreateConfig(index + i, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
        const span = createSkeletonLetterSpan(newChar, config);

        spanGroup.push(span);
        step++;
    }

    return {
        step,
        spanGroup,
    };
}

function ArabicHandler(
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // 组合阿拉伯语的词组
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const span = [];
    let step = 0;

    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasArabic(newChar)) {
            span.unshift(newChar);
            step++;
        } else {
            break;
        }
    }

    return {
        step,
        spanGroup: [createSkeletonLetterSpan(span.join(''), config)],
    };
}

function emojiHandler(
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const match = charArray.match(EMOJI_REG); // NOSONAR

    return {
        step: match![0].length,
        spanGroup: [createSkeletonLetterSpan(match![0], config)],
    };
}

function TibetanHandler(
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // 组合藏语词组
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const span = [];
    let step = 0;
    for (let i = 0; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasTibetan(newChar)) {
            span.push(newChar);
            step++;
        } else {
            break;
        }
    }

    return {
        step,
        spanGroup: [createSkeletonWordSpan(span.join(''), config)],
    };
}
