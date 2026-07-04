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

import type { IDocumentData, ITextStyle } from '@univerjs/core';
import { getFontStyleString } from '../../../basics/tools';
import { FontCache } from './shaping-engine/font-cache';

interface IDocumentNoWrapTextRunLike {
    st?: number;
    ed?: number;
    ts?: ITextStyle;
}

function splitDocumentNoWrapMeasureLines(text: string): string[] {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function isDocumentNoWrapMeasureTrailingWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\u00A0';
}

function getDocumentNoWrapMeasureTrailingWhitespaceStart(text: string): number {
    let index = text.length;
    while (index > 0 && isDocumentNoWrapMeasureTrailingWhitespace(text[index - 1])) {
        index--;
    }
    return index;
}

function isDocumentNoWrapMeasureCJKText(char: string): boolean {
    return /[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(char);
}

function isDocumentNoWrapMeasureLatinText(char: string): boolean {
    return /[a-z\d]/i.test(char);
}

function measureDocumentNoWrapTextByStyle(text: string, textStyle: ITextStyle | undefined): number {
    if (!text) {
        return 0;
    }

    return FontCache.getMeasureText(text, getFontStyleString(textStyle).fontCache).width;
}

function measureDocumentNoWrapCJKLatinSpacing(
    segment: string,
    textStyle: ITextStyle | undefined,
    previous: { char: string; cjkWidth: number }
): number {
    let spacing = 0;

    for (const char of Array.from(segment)) {
        const isCJK = isDocumentNoWrapMeasureCJKText(char);
        const cjkWidth = isCJK ? measureDocumentNoWrapTextByStyle(char, textStyle) : 0;

        if (isCJK && isDocumentNoWrapMeasureLatinText(previous.char)) {
            spacing += cjkWidth / 4;
        }

        if (isDocumentNoWrapMeasureLatinText(char) && isDocumentNoWrapMeasureCJKText(previous.char)) {
            spacing += previous.cjkWidth / 4;
        }

        previous.char = char;
        previous.cjkWidth = cjkWidth;
    }

    return spacing;
}

function measureDocumentNoWrapLineByStyle(text: string, textStyle: ITextStyle | undefined): number {
    const previous = { char: '', cjkWidth: 0 };

    return measureDocumentNoWrapTextByStyle(text, textStyle) +
        measureDocumentNoWrapCJKLatinSpacing(text, textStyle, previous);
}

function measureDocumentNoWrapRunsWidth(
    dataStream: string,
    textRuns: IDocumentNoWrapTextRunLike[]
): number {
    let currentLineWidth = 0;
    let maxLineWidth = 0;
    let pendingTrailingWhitespaceWidth = 0;
    const previous = { char: '', cjkWidth: 0 };

    const appendSegment = (segment: string, textStyle: ITextStyle | undefined) => {
        if (!segment) {
            return;
        }

        const trailingStart = getDocumentNoWrapMeasureTrailingWhitespaceStart(segment);
        const visibleSegment = segment.slice(0, trailingStart);
        const trailingWhitespace = segment.slice(trailingStart);

        if (visibleSegment) {
            currentLineWidth += pendingTrailingWhitespaceWidth;
            pendingTrailingWhitespaceWidth = 0;
            currentLineWidth += measureDocumentNoWrapTextByStyle(visibleSegment, textStyle);
            currentLineWidth += measureDocumentNoWrapCJKLatinSpacing(visibleSegment, textStyle, previous);
        }

        if (trailingWhitespace) {
            pendingTrailingWhitespaceWidth += measureDocumentNoWrapTextByStyle(trailingWhitespace, textStyle);
            measureDocumentNoWrapCJKLatinSpacing(trailingWhitespace, textStyle, previous);
        }
    };

    const finishLine = () => {
        maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
        currentLineWidth = 0;
        pendingTrailingWhitespaceWidth = 0;
        previous.char = '';
        previous.cjkWidth = 0;
    };

    textRuns.forEach((run) => {
        const start = Math.max(0, run.st ?? 0);
        const end = Math.max(start, run.ed ?? start);
        const segments = splitDocumentNoWrapMeasureLines(dataStream.slice(start, end));

        segments.forEach((segment, index) => {
            if (index > 0) {
                finishLine();
            }

            appendSegment(segment, run.ts);
        });
    });

    return Math.max(maxLineWidth, currentLineWidth);
}

/**
 * Measures the widest no-wrap line using the same text-width policy that docs
 * layout relies on for lightweight shape/text-box autofit flows.
 *
 * This is intentionally not a full document layout replacement: callers that
 * need line breaking, pagination, floating objects, or final line metrics should
 * use `DocumentSkeleton`. This helper exists for consumers that must size a
 * no-wrap host before committing a full layout pass. Keep docs-specific glyph
 * width adjustments here so feature packages do not duplicate paragraph shaping
 * details such as CJK-Latin spacing.
 */
export function measureDocumentNoWrapTextWidth(documentData: IDocumentData | null | undefined): number {
    const body = documentData?.body;
    const dataStream = body?.dataStream ?? '';
    const textRuns = body?.textRuns as IDocumentNoWrapTextRunLike[] | undefined;

    if (textRuns?.length) {
        return measureDocumentNoWrapRunsWidth(dataStream, textRuns);
    }

    const fallbackTextStyle = documentData?.documentStyle?.textStyle;

    return Math.max(
        0,
        ...splitDocumentNoWrapMeasureLines(dataStream).map((line) => measureDocumentNoWrapLineByStyle(line, fallbackTextStyle))
    );
}
