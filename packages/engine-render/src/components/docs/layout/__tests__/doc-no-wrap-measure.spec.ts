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
import { describe, expect, it, vi } from 'vitest';
import {
    measureDocumentNoWrapTextRangeWidth,
    measureDocumentNoWrapTextWidth,
    measureDocumentUnbreakableTextWidth,
} from '../doc-no-wrap-measure';
import { FontCache } from '../shaping-engine/font-cache';

function createDocument(dataStream: string): IDocumentData {
    return {
        id: 'doc-no-wrap-measure-test',
        body: {
            dataStream,
            textRuns: [],
            paragraphs: [],
        },
        documentStyle: {
            pageSize: {
                width: 4000,
                height: Infinity,
            },
        },
    };
}

describe('measureDocumentNoWrapTextWidth', () => {
    it('uses docs CJK-Latin spacing for mixed no-wrap text', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: Array.from(text).reduce((total, char) => total + (/[\u2E80-\u9FFF\uF900-\uFAFF]/u.test(char) ? 20 : 10), 0),
        }) as never);

        expect(measureDocumentNoWrapTextWidth(createDocument('A好B\r\n'))).toBe(50);
        expect(measureDocumentNoWrapTextWidth(createDocument('ABC\r\n'))).toBe(30);
        expect(measureDocumentNoWrapTextWidth(createDocument('你好\r\n'))).toBe(40);

        measureSpy.mockRestore();
    });

    it('keeps trailing whitespace local to the current line', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 10,
        }) as never);

        expect(measureDocumentNoWrapTextWidth(createDocument('A  \r\nBBBB\r\n'))).toBe(40);

        measureSpy.mockRestore();
    });

    it('honors paragraph breaks that fall between text runs', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 10,
        }) as never);
        const document = createDocument('AA\rBBBB\r\n');
        document.body!.textRuns = [
            { st: 0, ed: 2, ts: { fs: 20 } },
            { st: 3, ed: 7, ts: { fs: 20 } },
        ];

        expect(measureDocumentNoWrapTextWidth(document)).toBe(40);

        measureSpy.mockRestore();
    });
});

describe('measureDocumentUnbreakableTextWidth', () => {
    it('uses the docs line-break policy for words, spaces, and CJK text', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: Array.from(text).reduce((total, char) => total + (/[⺀-鿿豈-﫿]/u.test(char) ? 20 : 10), 0),
        }) as never);

        expect(measureDocumentUnbreakableTextWidth(createDocument('short longest 你好\r\n'))).toBe(70);

        measureSpy.mockRestore();
    });

    it('preserves text-run styles while measuring a break segment', () => {
        const measuredFonts = new Set<string>();
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string, font: string) => {
            measuredFonts.add(font);
            return { width: text.length * 10 } as never;
        });
        const document = createDocument('ABCD E\r\n');
        document.body!.textRuns = [
            { st: 0, ed: 2, ts: { fs: 10 } },
            { st: 2, ed: 4, ts: { fs: 20 } },
        ];

        expect(measureDocumentUnbreakableTextWidth(document)).toBe(40);
        expect(measuredFonts.size).toBeGreaterThan(1);

        measureSpy.mockRestore();
    });

    it('measures a styled document range without creating a temporary document', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 10,
        }) as never);
        const document = createDocument('First Second\r\n');

        expect(measureDocumentNoWrapTextRangeWidth(document, 6, 12)).toBe(60);

        measureSpy.mockRestore();
    });
});
