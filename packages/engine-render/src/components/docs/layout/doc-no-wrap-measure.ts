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

import type { IDocumentData, ITextRun, ITextStyle } from '@univerjs/core';
import { getFontStyleString } from '../../../basics/tools';
import { LineBreaker } from './line-breaker';
import { FontCache } from './shaping-engine/font-cache';

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
    const visibleText = text.slice(0, getDocumentNoWrapMeasureTrailingWhitespaceStart(text));
    const previous = { char: '', cjkWidth: 0 };

    return measureDocumentNoWrapTextByStyle(visibleText, textStyle) +
        measureDocumentNoWrapCJKLatinSpacing(visibleText, textStyle, previous);
}

function measureDocumentNoWrapRunsWidth(
    dataStream: string,
    textRuns: ITextRun[],
    fallbackTextStyle: ITextStyle | undefined
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

    const appendRange = (text: string, textStyle: ITextStyle | undefined) => {
        const segments = splitDocumentNoWrapMeasureLines(text);

        segments.forEach((segment, index) => {
            if (index > 0) {
                finishLine();
            }

            appendSegment(segment, textStyle);
        });
    };

    let cursor = 0;
    [...textRuns]
        .sort((a, b) => a.st - b.st)
        .forEach((run) => {
            const start = Math.max(0, run.st);
            const end = Math.max(start, run.ed);
            if (start > cursor) {
                appendRange(dataStream.slice(cursor, start), fallbackTextStyle);
            }
            const effectiveStart = Math.max(start, cursor);
            if (end > effectiveStart) {
                appendRange(dataStream.slice(effectiveStart, end), run.ts);
            }
            cursor = Math.max(cursor, end);
        });
    if (cursor < dataStream.length) {
        appendRange(dataStream.slice(cursor), fallbackTextStyle);
    }

    return Math.max(maxLineWidth, currentLineWidth);
}

export function measureDocumentNoWrapTextRangeWidth(documentData: IDocumentData, start: number, end: number): number {
    const body = documentData.body;
    const dataStream = body?.dataStream ?? '';
    const rangeStart = Math.max(0, Math.min(dataStream.length, start));
    const rangeEnd = Math.max(rangeStart, Math.min(dataStream.length, end));
    const rangeText = dataStream.slice(rangeStart, rangeEnd);
    const textRuns = (body?.textRuns ?? [])
        .map((run): ITextRun | null => {
            const runStart = Math.max(rangeStart, run.st);
            const runEnd = Math.min(rangeEnd, run.ed);
            if (runEnd <= runStart) {
                return null;
            }

            return {
                ...run,
                st: runStart - rangeStart,
                ed: runEnd - rangeStart,
            };
        })
        .filter((run): run is ITextRun => run !== null);

    if (textRuns.length) {
        return measureDocumentNoWrapRunsWidth(rangeText, textRuns, documentData.documentStyle?.textStyle);
    }

    return measureDocumentNoWrapLineByStyle(rangeText, documentData.documentStyle?.textStyle);
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
    const textRuns = body?.textRuns;

    if (textRuns?.length) {
        return measureDocumentNoWrapRunsWidth(
            dataStream,
            textRuns,
            documentData?.documentStyle?.textStyle
        );
    }

    const fallbackTextStyle = documentData?.documentStyle?.textStyle;

    return Math.max(
        0,
        ...splitDocumentNoWrapMeasureLines(dataStream).map((line) => measureDocumentNoWrapLineByStyle(line, fallbackTextStyle))
    );
}

/**
 * Measures the widest segment that docs line breaking keeps together. This is
 * useful when a host may wrap normally but still needs enough width to avoid
 * clipping an individual word, CJK glyph, or punctuation segment.
 */
export function measureDocumentUnbreakableTextWidth(documentData: IDocumentData | null | undefined): number {
    const dataStream = documentData?.body?.dataStream ?? '';
    if (!documentData || !dataStream) {
        return 0;
    }

    const breaker = new LineBreaker(dataStream);
    let start = 0;
    let maxWidth = 0;
    let breakPoint = breaker.nextBreakPoint();

    while (breakPoint) {
        maxWidth = Math.max(maxWidth, measureDocumentNoWrapTextRangeWidth(documentData, start, breakPoint.position));
        start = breakPoint.position;
        breakPoint = breaker.nextBreakPoint();
    }

    return maxWidth;
}
