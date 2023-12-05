import type { IParagraphStyle, Nullable } from '@univerjs/core';
import { DataStreamTreeTokenType } from '@univerjs/core';

import type { IDocumentSkeletonSpan } from '../../../../basics/i-document-skeleton-cached';
import type { ISectionBreakConfig } from '../../../../basics/interfaces';
import { hasArabic, hasCJK, hasSpaceAndTab, hasTibetan } from '../../../../basics/tools';
import { createSkeletonLetterSpan, createSkeletonWordSpan } from '../../common/span';
import { getFontCreateConfig } from '../../common/tools';
import type { DataStreamTreeNode } from '../../view-model/data-stream-tree-node';
import type { DocumentViewModel } from '../../view-model/document-view-model';

interface ILanguageResult {
    charIndex: number;
    spanGroup: IDocumentSkeletonSpan[];
}

export function composeCharForLanguage(
    char: string,
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
): Nullable<ILanguageResult> {
    if (char === DataStreamTreeTokenType.SPACE) {
        return;
    }

    if (hasArabic(char)) {
        return ArabicHandler(char, index, charArray, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    }

    if (hasTibetan(char)) {
        return TibetanHandler(char, index, charArray, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    }

    if (!hasCJK(char)) {
        return notCJKHandler(char, index, charArray, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    }
}

function notCJKHandler(
    char: string,
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // Chinese, Japanese, and Korean (CJK) characters.
    // https://en.wikipedia.org/wiki/CJK_characters
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const { pageWidth = Infinity } = config;
    const charSke = createSkeletonLetterSpan(char, config);
    const spanGroup = [charSke];
    let allWidth = charSke.width;
    let newCharIndex = index;

    for (let i = index + 1; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (!hasCJK(newChar) && !hasSpaceAndTab(newChar)) {
            const newConfig = getFontCreateConfig(i, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
            const newSpan = createSkeletonLetterSpan(newChar, newConfig);
            const newCharWidth = newSpan.width;
            if (allWidth + newCharWidth > pageWidth) {
                // 如果一连串的非cjk文字超过了一行宽度，直接绘制，不用自动换行了
                break;
            }
            spanGroup.push(newSpan);
            allWidth += newCharWidth;
            newCharIndex = i;
        } else {
            break;
        }
    }

    return {
        charIndex: newCharIndex,
        spanGroup,
    };
}

function ArabicHandler(
    char: string,
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // 组合阿拉伯语的词组
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const span = [char];
    let newCharIndex = index;
    for (let i = index + 1; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasArabic(newChar)) {
            span.unshift(newChar);
            newCharIndex = i;
        } else {
            break;
        }
    }
    return {
        charIndex: newCharIndex,
        spanGroup: [createSkeletonLetterSpan(span.join(''), config)],
    };
}

function TibetanHandler(
    char: string,
    index: number,
    charArray: string,
    bodyModel: DocumentViewModel,
    paragraphNode: DataStreamTreeNode,
    sectionBreakConfig: ISectionBreakConfig,
    paragraphStyle: IParagraphStyle
) {
    // 组合藏语词组
    const config = getFontCreateConfig(index, bodyModel, paragraphNode, sectionBreakConfig, paragraphStyle);
    const span = [char];
    let newCharIndex = index;
    for (let i = index + 1; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (hasTibetan(newChar)) {
            span.push(newChar);
            newCharIndex = i;
        } else {
            break;
        }
    }
    return {
        charIndex: newCharIndex,
        spanGroup: [createSkeletonWordSpan(span.join(''), config)],
    };
}
