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

import { HorizontalAlign, TextDirection } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { BreakPointType } from '../../../line-breaker/break';

import { lineAdjustment } from '../line-adjustment';

const createHyphenDashGlyphMock = vi.fn();
const glyphShrinkLeftMock = vi.fn();
const glyphShrinkRightMock = vi.fn();
const setGlyphGroupLeftMock = vi.fn();
const getFontConfigFromLastGlyphMock = vi.fn();

vi.mock('../../../model/glyph', () => ({
    createHyphenDashGlyph: (...args: unknown[]) => createHyphenDashGlyphMock(...args),
    glyphShrinkLeft: (...args: unknown[]) => glyphShrinkLeftMock(...args),
    glyphShrinkRight: (...args: unknown[]) => glyphShrinkRightMock(...args),
    setGlyphGroupLeft: (...args: unknown[]) => setGlyphGroupLeftMock(...args),
}));

vi.mock('../../../tools', () => ({
    getFontConfigFromLastGlyph: (...args: unknown[]) => getFontConfigFromLastGlyphMock(...args),
    getGlyphGroupWidth: (divide: any) => divide.glyphGroup.reduce((sum: number, glyph: any) => sum + glyph.width, 0),
    lineIterator: (pages: any[], cb: (line: any) => void) => {
        pages.forEach((page) => {
            page.sections.forEach((section: any) => {
                section.columns.forEach((column: any) => {
                    column.lines.forEach((line: any) => cb(line));
                });
            });
        });
    },
}));

function createGlyph(content: string, width: number, isJustifiable = false) {
    return {
        content,
        width,
        xOffset: 0,
        count: 1,
        isJustifiable,
        bBox: {
            width: Math.max(1, width - 1),
            ba: 7,
            bd: 3,
        },
        adjustability: {
            shrinkability: [1, 1],
            stretchability: [1, 1],
        },
    } as any;
}

function createPages() {
    const divide1 = {
        width: 40,
        isFull: true,
        breakType: BreakPointType.Normal,
        paddingLeft: 0,
        glyphGroup: [
            createGlyph('（', 8, false),
            createGlyph('A', 10, true),
            createGlyph('。', 8, false),
        ],
    } as any;

    const divide2 = {
        width: 24,
        isFull: true,
        breakType: BreakPointType.Normal,
        paddingLeft: 0,
        glyphGroup: [
            createGlyph('中', 14, false),
        ],
    } as any;
    divide2.glyphGroup[0].xOffset = 2;
    divide2.glyphGroup[0].bBox.width = 8;

    const divide3 = {
        width: 30,
        isFull: true,
        breakType: BreakPointType.Hyphen,
        paddingLeft: 0,
        glyphGroup: [
            createGlyph('w', 10, true),
            createGlyph('o', 8, true),
            createGlyph('r', 7, true),
            createGlyph('d', 7, true),
        ],
    } as any;
    divide3.glyphGroup[divide3.glyphGroup.length - 1].content = 'a';

    const line = {
        paragraphIndex: 0,
        divides: [divide1, divide2, divide3],
    } as any;

    [divide1, divide2, divide3].forEach((divide) => {
        divide.glyphGroup.forEach((glyph: any, idx: number) => {
            glyph.left = divide.glyphGroup.slice(0, idx).reduce((sum: number, g: any) => sum + g.width, 0);
            glyph.parent = divide;
        });
    });

    return [
        {
            sections: [
                {
                    columns: [
                        {
                            lines: [line],
                        },
                    ],
                },
            ],
        },
    ] as any[];
}

describe('line adjustment', () => {
    it('adjusts punctuation/hyphen/alignment for paragraph lines', () => {
        createHyphenDashGlyphMock.mockReturnValue({
            content: '-',
            width: 3,
            count: 1,
            left: 0,
            bBox: { width: 3, ba: 7, bd: 3 },
            adjustability: { shrinkability: [0, 0], stretchability: [0, 0] },
        });
        getFontConfigFromLastGlyphMock.mockReturnValue({ fs: 12 });

        const viewModel = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.JUSTIFIED,
                },
            }),
        } as any;
        const paragraphNode = { endIndex: 1 } as any;
        const pages = createPages();

        lineAdjustment(pages as any, viewModel, paragraphNode, {} as any);

        const line = pages[0].sections[0].columns[0].lines[0];
        expect(glyphShrinkLeftMock).toHaveBeenCalled();
        expect(glyphShrinkRightMock).toHaveBeenCalled();
        expect(setGlyphGroupLeftMock).toHaveBeenCalled();
        expect(getFontConfigFromLastGlyphMock).toHaveBeenCalled();

        const hyphenDivide = line.divides[2];
        expect(hyphenDivide.glyphGroup[hyphenDivide.glyphGroup.length - 1].content).toBe('-');
        expect(hyphenDivide.width).toBe(27);

        expect(line.divides[0].paddingLeft).toBeGreaterThanOrEqual(0);
    });

    // Regression: each RTL line must compute paddingRight independently
    // from *its own* glyphGroupWidth so a short Arabic line above a long
    // one still pins to the divide's right edge instead of inheriting the
    // long line's offset. See `_horizontalHandler` for the page-level
    // counterpart of this fix.
    it('pins every RTL line to its own divide right edge for UNSPECIFIED align', () => {
        // Two divides on the same line representing two paragraphs of
        // different glyph-group widths but the same divide.width (cell
        // column width). Without the per-line paddingRight, the shorter
        // run would render with paddingRight=0 and visually drift to the
        // divide's left edge under page-level right alignment.
        const shortRun = {
            width: 100,
            isFull: false,
            breakType: BreakPointType.Normal,
            paddingLeft: 0,
            glyphGroup: [createGlyph('ك', 10, false), createGlyph('ت', 10, false)],
        } as any;
        const longRun = {
            width: 100,
            isFull: false,
            breakType: BreakPointType.Normal,
            paddingLeft: 0,
            glyphGroup: [
                createGlyph('ا', 10, false),
                createGlyph('ل', 10, false),
                createGlyph('ع', 10, false),
                createGlyph('ر', 10, false),
                createGlyph('ب', 10, false),
                createGlyph('ي', 10, false),
            ],
        } as any;
        const line = {
            paragraphIndex: 0,
            divides: [shortRun, longRun],
        } as any;
        const pages = [
            { sections: [{ columns: [{ lines: [line] }] }] },
        ] as any[];

        const viewModel = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.UNSPECIFIED,
                    direction: TextDirection.RIGHT_TO_LEFT,
                },
            }),
        } as any;
        lineAdjustment(pages, viewModel, { endIndex: 1 } as any, {} as any);

        expect(shortRun.paddingRight).toBe(100 - 20);
        expect(longRun.paddingRight).toBe(100 - 60);
        // paddingLeft must stay 0 — we don't want to double-shift the run.
        expect(shortRun.paddingLeft).toBe(0);
        expect(longRun.paddingLeft).toBe(0);
    });

    // Regression: in the static sheet-render path `divide.width === Infinity`
    // (page-size is unclamped so OVERFLOW into neighbouring cells still
    // works). Without compensation, RTL multi-line cells would skip the
    // per-line padding step and every line would visually collapse to the
    // page's left edge, undoing the right-alignment. The fix substitutes
    // `pageMaxLineWidth` (longest natural line width on the page) for the
    // infinite `divide.width`, so each line gets a finite reference and
    // short lines get the correct paddingRight to match the longest line.
    it('uses pageMaxLineWidth for RTL paddingRight when divide.width is Infinity', () => {
        // Two paragraphs on the same page, each a single line. Page is
        // unclamped (divide.width = Infinity for both). The short line
        // should get paddingRight = (longLineWidth) - (shortLineWidth);
        // the long line gets paddingRight = 0.
        const makeRtlLine = (paragraphIndex: number, charWidth: number, charCount: number) => {
            const glyphs: any[] = [];
            for (let i = 0; i < charCount; i++) {
                glyphs.push(createGlyph('ك', charWidth, false));
            }
            glyphs.forEach((g, idx) => {
                g.left = idx * charWidth;
            });
            const divide = {
                width: Number.POSITIVE_INFINITY,
                isFull: false,
                breakType: BreakPointType.Normal,
                paddingLeft: 0,
                glyphGroup: glyphs,
            } as any;
            glyphs.forEach((g: any) => {
                g.parent = divide;
            });
            return {
                paragraphIndex,
                divides: [divide],
            } as any;
        };
        const shortLine = makeRtlLine(0, 10, 2);
        const longLine = makeRtlLine(0, 10, 6);
        const pages = [
            { sections: [{ columns: [{ lines: [shortLine, longLine] }] }] },
        ] as any[];

        const viewModel = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.UNSPECIFIED,
                    direction: TextDirection.RIGHT_TO_LEFT,
                },
            }),
        } as any;
        lineAdjustment(pages, viewModel, { endIndex: 0 } as any, {} as any);

        // Long line is its own anchor for the page-level RIGHT push.
        expect(longLine.divides[0].paddingRight).toBe(0);
        // Short line pads by the difference so it lines up with the long
        // line's right edge.
        expect(shortLine.divides[0].paddingRight).toBe(60 - 20);
        // paddingLeft must remain 0 — page-level offset does the cell-
        // right anchoring; we only adjust within the line.
        expect(shortLine.divides[0].paddingLeft).toBe(0);
        expect(longLine.divides[0].paddingLeft).toBe(0);
    });

    // LTR multi-line with Infinity divide.width keeps legacy behaviour
    // (skip on infinity) — we don't want to accidentally start padding
    // LTR lines that were happy as-is.
    it('does not pad LTR Infinity divides', () => {
        const makeLine = (charWidth: number, charCount: number) => {
            const glyphs: any[] = [];
            for (let i = 0; i < charCount; i++) {
                glyphs.push(createGlyph('a', charWidth, false));
            }
            glyphs.forEach((g, idx) => {
                g.left = idx * charWidth;
            });
            const divide = {
                width: Number.POSITIVE_INFINITY,
                isFull: false,
                breakType: BreakPointType.Normal,
                paddingLeft: 0,
                glyphGroup: glyphs,
            } as any;
            glyphs.forEach((g: any) => {
                g.parent = divide;
            });
            return { paragraphIndex: 0, divides: [divide] } as any;
        };
        const a = makeLine(10, 2);
        const b = makeLine(10, 6);
        const pages = [
            { sections: [{ columns: [{ lines: [a, b] }] }] },
        ] as any[];
        const viewModel = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: {
                    horizontalAlign: HorizontalAlign.UNSPECIFIED,
                    // No direction = LTR baseline.
                },
            }),
        } as any;
        lineAdjustment(pages, viewModel, { endIndex: 0 } as any, {} as any);

        expect(a.divides[0].paddingRight ?? 0).toBe(0);
        expect(b.divides[0].paddingRight ?? 0).toBe(0);
    });

    it('supports center and right align branches', () => {
        const pages = createPages();
        const paragraphNode = { endIndex: 1 } as any;

        const viewModelCenter = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
            }),
        } as any;
        lineAdjustment(pages as any, viewModelCenter, paragraphNode, {} as any);
        expect(pages[0].sections[0].columns[0].lines[0].divides[0].paddingLeft).toBeGreaterThan(0);

        const viewModelRight = {
            getParagraph: () => ({
                startIndex: 0,
                paragraphStyle: { horizontalAlign: HorizontalAlign.RIGHT },
            }),
        } as any;
        lineAdjustment(pages as any, viewModelRight, paragraphNode, {} as any);
        expect(pages[0].sections[0].columns[0].lines[0].divides[0].paddingLeft).toBeGreaterThan(0);
    });
});
