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
import { describe, expect, it } from 'vitest';
import { lineAdjustment } from '../line-adjustment';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('line-adjustment', () => {
    function createGlyph(content: string, width: number, overrides: Record<string, unknown> = {}) {
        return {
            content,
            width,
            left: 0,
            xOffset: 0,
            isJustifiable: content === ' ',
            adjustability: {
                stretchability: content === ' ' ? [0, 3] : [0, 0],
                shrinkability: content === ' ' ? [0, 2] : [0, 0],
            },
            bBox: {
                width,
            },
            ...overrides,
        } as any;
    }

    function createPagesWithLine(divide: any, horizontalAlign: HorizontalAlign) {
        const line = {
            paragraphIndex: 0,
            divides: [divide],
        } as any;
        const column = {
            lines: [line],
        };
        const section = {
            columns: [column],
        };
        const page = {
            sections: [section],
        };

        divide.parent = line;
        line.parent = column;

        return {
            pages: [page] as any[],
            viewModel: {
                getParagraph: () => ({
                    startIndex: 0,
                    paragraphStyle: {
                        horizontalAlign,
                    },
                }),
            } as any,
            paragraphNode: {
                endIndex: 1,
            } as any,
            sectionBreakConfig: {} as any,
        };
    }

    it('adjusts lines after layout', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        // lineAdjustment should not throw
        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles CJK punctuation shrinkage', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('\u3002\u3002'); // Two full-width periods
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align CENTER', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.CENTER,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1022', startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align RIGHT', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.RIGHT,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1023', startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align JUSTIFIED', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world test', {
            body: {
                dataStream: 'Hello world test\r\n',
                textRuns: [{ st: 0, ed: 18, ts: {} }],
                paragraphs: [{
                    startIndex: 16,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.JUSTIFIED,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1024', startIndex: 17 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('spreads glyphs across the line for horizontal align DISTRIBUTED', () => {
        const text = '2038';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(text, {
            body: {
                dataStream: `${text}\r\n`,
                textRuns: [{ st: 0, ed: 6, ts: {} }],
                paragraphs: [{
                    startIndex: text.length,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.DISTRIBUTED,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1025', startIndex: text.length + 1 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const divide = pages[0].sections[0].columns[0].lines[0].divides[0];
        const visibleGlyphs = divide.glyphGroup.filter((glyph) => glyph.content !== '');
        const lastVisibleGlyph = visibleGlyphs[visibleGlyphs.length - 1];
        const initialLastGlyphLeft = lastVisibleGlyph.left;

        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);

        expect(lastVisibleGlyph.left).toBeGreaterThan(initialLastGlyphLeft);
        expect(lastVisibleGlyph.left + lastVisibleGlyph.width).toBeCloseTo(divide.width, 1);
        expect(divide.paddingLeft).toBe(0);
    });

    it('handles line with only paragraph break', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('sets center and right padding from actual glyph group width', () => {
        const centerDivide = {
            width: 100,
            isFull: false,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 20), createGlyph('B', 30)],
        } as any;
        const center = createPagesWithLine(centerDivide, HorizontalAlign.CENTER);

        lineAdjustment(center.pages, center.viewModel, center.paragraphNode, center.sectionBreakConfig);
        expect(centerDivide.glyphGroupWidth).toBe(50);
        expect(centerDivide.paddingLeft).toBe(25);

        const rightDivide = {
            width: 100,
            isFull: false,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 20), createGlyph('B', 30)],
        } as any;
        const right = createPagesWithLine(rightDivide, HorizontalAlign.RIGHT);

        lineAdjustment(right.pages, right.viewModel, right.paragraphNode, right.sectionBreakConfig);
        expect(rightDivide.glyphGroupWidth).toBe(50);
        expect(rightDivide.paddingLeft).toBe(50);
    });

    it('expands justifiable spaces to fill a full justified divide', () => {
        const space = createGlyph(' ', 5);
        const divide = {
            width: 40,
            isFull: true,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 10), space, createGlyph('B', 10)],
        } as any;
        const context = createPagesWithLine(divide, HorizontalAlign.JUSTIFIED);

        lineAdjustment(context.pages, context.viewModel, context.paragraphNode, context.sectionBreakConfig);

        expect(space.width).toBe(20);
        expect(divide.glyphGroupWidth).toBe(40);
        expect(divide.paddingLeft).toBe(0);
    });

    it('restores extra CJK spacing for a full line ending in CJK text', () => {
        const cjkGlyph = createGlyph('中', 20, {
            xOffset: 5,
            bBox: { width: 10 },
            adjustability: {
                stretchability: [0, 0],
                shrinkability: [0, 7],
            },
        });
        const divide = {
            width: 100,
            isFull: true,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 10), cjkGlyph],
        };
        const context = createPagesWithLine(divide, HorizontalAlign.UNSPECIFIED);

        lineAdjustment(context.pages, context.viewModel, context.paragraphNode, context.sectionBreakConfig);

        expect(cjkGlyph.width).toBe(15);
        expect(cjkGlyph.adjustability.shrinkability[1]).toBe(0);
    });
});
