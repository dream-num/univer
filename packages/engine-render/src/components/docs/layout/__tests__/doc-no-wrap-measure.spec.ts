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
import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { getFontStyleString } from '../../../../basics/tools';
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
    it.each([undefined, DocumentFlavor.UNSPECIFIED, DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN, DocumentFlavor.DRAWINGML])(
        'honors the East Asian spacing switch across runs and ranges without changing its default (%s)',
        (documentFlavor) => {
            const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
                width: Array.from(text).reduce((width, char) => width + (/[中文]/.test(char) ? 16 : 8), 0),
            }) as never);
            try {
                const document = createDocument('A中1文B\r\n');
                document.documentStyle.documentFlavor = documentFlavor;
                for (const runs of [[], [{ st: 0, ed: 1, ts: { bl: 1 } }, { st: 1, ed: 2, ts: { bl: 1 } }]]) {
                    document.body!.textRuns = runs;
                    for (const flag of [undefined, BooleanNumber.TRUE, BooleanNumber.FALSE]) {
                        document.documentStyle.spaceWidthEastAsian = flag;
                        expect(measureDocumentNoWrapTextWidth(document)).toBe(flag === BooleanNumber.FALSE ? 56 : 72);
                        expect(measureDocumentNoWrapTextRangeWidth(document, 0, 3)).toBe(flag === BooleanNumber.FALSE ? 32 : 40);
                    }
                }
            } finally {
                measureSpy.mockRestore();
            }
        }
    );

    it.each([DocumentFlavor.MODERN, DocumentFlavor.DRAWINGML])('shares small-cap fonts for inherited styles and source ranges (%s)', (flavor) => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text, font) => ({
            width: Array.from(text).length * Number(font.match(/([\d.]+)pt/)![1]),
        }) as never);
        try {
            const document = createDocument('Hh x  \r\n');
            document.documentStyle.documentFlavor = flavor;
            document.documentStyle.textStyle = { fs: 12, smallCaps: true };
            const small = flavor === DocumentFlavor.DRAWINGML ? 9.6 : 9.5;
            expect(measureDocumentNoWrapTextWidth(document)).toBeCloseTo(24 + small * 2);
            expect(measureDocumentNoWrapTextRangeWidth(document, 1, 2)).toBeCloseTo(small);
            document.body!.textRuns = [{ st: 3, ed: 4, ts: { smallCaps: false } }];
            expect(measureDocumentNoWrapTextWidth(document)).toBeCloseTo(36 + small);
            document.body!.textRuns = [{ st: 3, ed: 4, ts: { caps: true } }];
            expect(measureDocumentNoWrapTextWidth(document)).toBeCloseTo(36 + small);
            expect(document.body!.dataStream).toBe('Hh x  \r\n');
        } finally {
            measureSpy.mockRestore();
        }
    });

    it('measures inherited display capitals with direct off and unchanged source ranges', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: Array.from(text).reduce((width, char) => width + (/[A-Z]/.test(char) ? 10 : 5), 0),
        }) as never);
        try {
            const document = createDocument('ab cd\r\n');
            document.documentStyle.textStyle = { caps: true, fs: 12 };
            document.body!.textRuns = [{ st: 0, ed: 2, ts: { bl: 1 } }, { st: 3, ed: 5, ts: { caps: false } }];
            expect(measureDocumentNoWrapTextWidth(document)).toBe(35);
            expect(measureDocumentNoWrapTextRangeWidth(document, 0, 2)).toBe(20);
            expect(measureDocumentNoWrapTextRangeWidth(document, 3, 5)).toBe(10);
            expect(document.body!.dataStream).toBe('ab cd\r\n');
        } finally {
            measureSpy.mockRestore();
        }
    });

    it('preserves space-letter kerning across styled runs but not across line or font changes', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text, _font, mode) => ({
            width: text.length * 10 - (mode === 'normal' ? (text.match(/ V/g)?.length ?? 0) * 2 : 0),
        }) as never);
        try {
            const document = createDocument('A V  \r\n');
            const style = { ff: 'Space kerning regression', fs: 12, kerning: 12 };
            document.body!.textRuns = [
                { st: 0, ed: 2, ts: style },
                { st: 2, ed: 5, ts: { ...style, bl: 0 } },
            ];
            expect(measureDocumentNoWrapTextWidth(document)).toBe(28);
            expect(measureDocumentNoWrapTextRangeWidth(document, 0, 2)).toBe(10);
            document.body!.textRuns[1].ts!.fs = 13;
            expect(measureDocumentNoWrapTextWidth(document)).toBe(30);
            document.body!.textRuns[1].ts!.fs = 12;
            document.body!.dataStream = 'A\rV  \r\n';
            expect(measureDocumentNoWrapTextWidth(document)).toBe(10);
        } finally {
            measureSpy.mockRestore();
        }
    });

    it.each([false, true])('measures explicit line separators without reserving an advance (styled: %s)', (styled) => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({ width: text.length * 10 }) as never);
        try {
            const document = createDocument('AA \u2028BBBB\r\n');
            if (styled) {
                document.body!.textRuns = [{ st: 0, ed: 8, ts: { fs: 12 } }];
            }
            expect(measureDocumentNoWrapTextWidth(document)).toBe(40);
            expect(measureDocumentNoWrapTextRangeWidth(document, 0, 4)).toBe(20);
            expect(measureDocumentNoWrapTextRangeWidth(document, 0, 8)).toBe(40);
            expect(measureDocumentUnbreakableTextWidth(document)).toBe(40);
        } finally {
            measureSpy.mockRestore();
        }
    });

    it('includes run tracking without inflating East Asian automatic spacing or trailing whitespace', () => {
        const font = getFontStyleString({ fs: 12, ff: 'Tracking no-wrap' }).fontCache;
        for (const text of ['A', 'B', '中', ' ']) {
            FontCache.setFontMeasureCache(font, text, {
                width: text === '中' ? 20 : 10,
                fontBoundingBoxAscent: 12,
                fontBoundingBoxDescent: 3,
                actualBoundingBoxAscent: 10,
                actualBoundingBoxDescent: 2,
            });
        }
        try {
            const document = createDocument('A中B  \r\n');
            document.body!.textRuns = [{ st: 0, ed: 5, ts: { fs: 12, ff: 'Tracking no-wrap', sc: -3 } }];
            // Three -3 pt tracking intervals become -12 layout pixels; trailing spaces do not count.
            expect(measureDocumentNoWrapTextWidth(document)).toBe(40 + 10 - 9 / 0.75);
            expect(measureDocumentNoWrapTextRangeWidth(document, 0, 3)).toBe(40 + 10 - 9 / 0.75);
        } finally {
            FontCache.clearFontMeasureCache(font);
        }
    });

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
