import { Nullable } from '@univer/core';
import { createSkeletonLetterSpan, createSkeletonWordSpan } from '../..';
import { hasArabic, hasCJK, hasTibetan, IDocumentSkeletonSpan, IFontCreateConfig } from '../../../..';

interface LanguageResult {
    charIndex: number;
    spanGroup: IDocumentSkeletonSpan[];
}

export function composeCharForLanguage(char: string, charIndex: number, charArray: string[], config: IFontCreateConfig): Nullable<LanguageResult> {
    if (hasArabic(char)) {
        return ArabicHandler(char, charIndex, charArray, config);
    }
    if (hasTibetan(char)) {
        return TibetanHandler(char, charIndex, charArray, config);
    }
    if (!hasCJK(char)) {
        return notCJKHandler(char, charIndex, charArray, config);
    }
}

function notCJKHandler(char: string, charIndex: number, charArray: string[], config: IFontCreateConfig) {
    // Chinese, Japanese, and Korean (CJK) characters.
    // https://en.wikipedia.org/wiki/CJK_characters
    const { pageWidth = Infinity } = config;
    const charSke = createSkeletonLetterSpan(char, config);
    const spanGroup = [charSke];
    let allWidth = charSke.width;
    let newCharIndex = charIndex;
    for (let i = charIndex + 1; i < charArray.length; i++) {
        const newChar = charArray[i];
        if (!hasCJK(newChar)) {
            const newSpan = createSkeletonLetterSpan(newChar, config);
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

function ArabicHandler(char: string, charIndex: number, charArray: string[], config: IFontCreateConfig) {
    // 组合阿拉伯语的词组
    const span = [char];
    let newCharIndex = charIndex;
    for (let i = charIndex + 1; i < charArray.length; i++) {
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

function TibetanHandler(char: string, charIndex: number, charArray: string[], config: IFontCreateConfig) {
    // 组合藏语词组
    const span = [char];
    let newCharIndex = charIndex;
    for (let i = charIndex + 1; i < charArray.length; i++) {
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
