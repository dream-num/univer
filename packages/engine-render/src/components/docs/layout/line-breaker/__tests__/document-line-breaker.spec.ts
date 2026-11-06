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

import type { IDocumentData } from '@univerjs/core';
import { BooleanNumber, DocumentFlavor, resolveDocumentParagraphStyle } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createDocumentLineBreaker } from '../document-line-breaker';

function segments(document: IDocumentData, text: string): string[] {
    const paragraph = document.body?.paragraphs?.[0];
    const style = resolveDocumentParagraphStyle(document.documentStyle, paragraph?.paragraphStyle, {
        styles: document.styles,
        paragraphStyleId: paragraph?.styleId,
    });
    const breaker = createDocumentLineBreaker(document, style, text, 0);
    const result: string[] = [];
    let start = 0;
    let point = breaker.nextBreakPoint();
    while (point) {
        result.push(text.slice(start, point.position));
        start = point.position;
        point = breaker.nextBreakPoint();
    }
    return result;
}

describe('document word wrapping', () => {
    it('uses authored Korean language for spreadsheet shapes while preserving Latin words in Korean runs', () => {
        const document: IDocumentData = {
            id: 'shape',
            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED, defaultParagraphStyle: { wordWrap: BooleanNumber.FALSE } },
            body: { dataStream: '오늘 전략을 abcdef', textRuns: [{ st: 0, ed: 13, ts: { lang: 'ko-KR' } }] },
        };
        expect(segments(document, document.body!.dataStream)).toEqual(['오늘 ', '전략을 ', 'abcdef']);
        document.documentStyle.defaultParagraphStyle!.wordWrap = BooleanNumber.TRUE;
        expect(segments(document, document.body!.dataStream)).toEqual(['오', '늘 ', '전', '략', '을 ', 'abcdef']);
        document.body!.textRuns = [];
        document.documentStyle.defaultParagraphStyle!.wordWrap = BooleanNumber.FALSE;
        expect(segments(document, document.body!.dataStream)).toEqual(['오', '늘 ', '전', '략', '을 ', 'abcdef']);
    });

    it('recognizes Korean in Word documents with English document defaults', () => {
        const document: IDocumentData = {
            id: 'doc',
            documentStyle: { documentFlavor: DocumentFlavor.MODERN, textStyle: { lang: 'en-US' } },
        };
        expect(segments(document, '오늘 전략을')).toEqual(['오늘 ', '전략을']);
    });

    it('keeps adjacent Latin and Hangul in one word without joining Chinese characters', () => {
        const document: IDocumentData = {
            id: 'mixed',
            documentStyle: { documentFlavor: DocumentFlavor.MODERN },
        };
        expect(segments(document, 'abc한글xyz 中文')).toEqual(['abc한글xyz ', '中', '文']);
    });

    it('does not require a persisted default to keep authored Korean shape text together', () => {
        const document: IDocumentData = {
            id: 'shape',
            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED, textStyle: { lang: 'ko-KR' } },
        };
        expect(segments(document, '오늘 전략을')).toEqual(['오늘 ', '전략을']);
        expect(document.documentStyle.defaultParagraphStyle).toBeUndefined();
    });

    it('resolves language from the matching run when shaping a later paragraph', () => {
        const text = 'before\r오늘 전략을';
        const document: IDocumentData = {
            id: 'shape',
            documentStyle: { documentFlavor: DocumentFlavor.UNSPECIFIED, defaultParagraphStyle: { wordWrap: BooleanNumber.FALSE } },
            body: { dataStream: text, textRuns: [{ st: 0, ed: 7, ts: { lang: 'en-US' } }, { st: 7, ed: text.length, ts: { lang: 'ko-KR' } }] },
        };
        const breaker = createDocumentLineBreaker(document, {}, text.slice(7), 7);
        expect(breaker.nextBreakPoint()?.position).toBe(3);
        expect(breaker.nextBreakPoint()?.position).toBe(6);
        expect(breaker.nextBreakPoint()).toBeNull();
    });

    it('keeps grapheme clusters intact and resolves language changes in mixed text', () => {
        const text = 'ab e\u0301f 오늘 전략을';
        const document: IDocumentData = {
            id: 'doc',
            documentStyle: { documentFlavor: DocumentFlavor.MODERN, defaultParagraphStyle: { wordWrap: BooleanNumber.TRUE } },
            body: { dataStream: text, textRuns: [{ st: 0, ed: 7, ts: { lang: 'en-US' } }, { st: 7, ed: text.length, ts: { lang: 'ko-KR' } }] },
        };
        expect(segments(document, text)).toEqual(['a', 'b ', 'e\u0301', 'f ', '오', '늘 ', '전', '략', '을']);
    });
});
