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

import { HorizontalAlign } from '@univerjs/core';
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
