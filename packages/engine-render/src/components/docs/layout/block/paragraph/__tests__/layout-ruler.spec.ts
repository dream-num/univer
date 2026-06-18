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

import type { IParagraphConfig } from '../../../../../../basics/interfaces';
import { BooleanNumber, DataStreamTreeTokenType, GridType, SpacingRule } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getLineHeightMetrics, layoutParagraph, updateInlineDrawingPosition } from '../layout-ruler';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('layout-ruler', () => {
    function getLineBoxHeight(metrics: ReturnType<typeof getLineHeightMetrics>) {
        return metrics.paddingTop + metrics.contentHeight + metrics.paddingBottom;
    }

    it('lays out first shaped text with bullet skeleton', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Item');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const bulletSkeleton = {
            listId: 'list-1',
            symbol: '\u25CF',
            ts: { ff: 'Arial', fs: 9 },
            startIndexItem: 1,
            paragraphProperties: {
                indentFirstLine: { v: 0 },
                hanging: { v: 21 },
                indentStart: { v: 0 },
            },
        };

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
            bulletSkeleton,
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(result.length).toBe(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it('lays out first shaped text without bullet', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(result.length).toBe(1);
    });

    it('lays out non-first shaped text into existing page', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world this is a test');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
        } as unknown as IParagraphConfig;

        // First layout
        let result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        // Subsequent layout with isParagraphFirstShapedText=false
        if (shapedTextList.length > 1) {
            result = layoutParagraph(
                ctx,
                shapedTextList[1].glyphs,
                result,
                sectionBreakConfig,
                paragraphConfig,
                false
            );
        }

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('end-to-end: shapes and lays out text through lineBreaking', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const lastPage = result[result.length - 1];
        expect(lastPage.sections.length).toBeGreaterThan(0);
    });

    it('uses glyph height as the base for auto line spacing when grid snapping is not explicitly enabled', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(24, 4);
    });

    it('keeps document-grid line pitch behavior when auto line spacing explicitly snaps to the grid', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(23.4, 4);
    });

    it('treats at-least spacing as a minimum line box height', () => {
        const compactMetrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 10, SpacingRule.AT_LEAST, BooleanNumber.FALSE, true);
        const expandedMetrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 40, SpacingRule.AT_LEAST, BooleanNumber.FALSE, true);

        expect(getLineBoxHeight(compactMetrics)).toBeCloseTo(16, 4);
        expect(getLineBoxHeight(expandedMetrics)).toBeCloseTo(40, 4);
    });

    it('treats exact spacing as the requested line box height even when glyphs are taller', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 10, SpacingRule.EXACT, BooleanNumber.FALSE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(10, 4);
        expect(metrics.contentHeight).toBeGreaterThan(getLineBoxHeight(metrics));
    });

    it('keeps the legacy line-height behavior for embedded sheet documents', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(23.4, 4);
    });

    it('splits an oversized word slice in a narrow paragraph divide', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('oversized', {
            documentStyle: {
                pageSize: { width: 80, height: 120 },
                marginLeft: 10,
                marginRight: 10,
                marginTop: 10,
                marginBottom: 10,
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const glyphs = shapedTextList[0].glyphs.map((glyph) => ({ ...glyph, width: 36 }));

        const result = layoutParagraph(
            ctx,
            glyphs,
            [curPage],
            sectionBreakConfig,
            { paragraphIndex: paragraphNode.endIndex, paragraphStyle: {} } as unknown as IParagraphConfig,
            true
        );

        const lines = result.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines.length).toBeGreaterThan(1);
    });

    it('keeps overflowing paragraph break and trailing spaces on the current line', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('word', {
            documentStyle: {
                pageSize: { width: 76, height: 120 },
                marginLeft: 10,
                marginRight: 10,
                marginTop: 10,
                marginBottom: 10,
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const paragraphConfig = { paragraphIndex: paragraphNode.endIndex, paragraphStyle: {} } as unknown as IParagraphConfig;
        const firstGlyph = { ...shapedTextList[0].glyphs[0], width: 50 } as any;
        const spaceGlyph = {
            ...firstGlyph,
            content: DataStreamTreeTokenType.SPACE,
            width: 20,
            st: firstGlyph.ed + 1,
            ed: firstGlyph.ed + 1,
        };
        const paragraphGlyph = {
            ...firstGlyph,
            content: DataStreamTreeTokenType.PARAGRAPH,
            width: 20,
            st: firstGlyph.ed + 2,
            ed: firstGlyph.ed + 2,
        };

        const firstLayout = layoutParagraph(ctx, [firstGlyph], [curPage], sectionBreakConfig, paragraphConfig, true);
        const withSpace = layoutParagraph(ctx, [spaceGlyph], firstLayout, sectionBreakConfig, paragraphConfig, false);
        const withParagraphBreak = layoutParagraph(ctx, [paragraphGlyph], withSpace, sectionBreakConfig, paragraphConfig, false);

        const glyphContents = withParagraphBreak.flatMap((page) => page.sections.flatMap(
            (section) => section.columns.flatMap(
                (column) => column.lines.flatMap(
                    (line) => line.divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content))
                )
            )
        ));
        expect(glyphContents).toContain(firstGlyph.content);
        expect(glyphContents).toContain(DataStreamTreeTokenType.SPACE);
    });

    it('opens new pages when narrow document content exceeds the current column height', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(
            'First Second Third Fourth Fifth Sixth Seventh Eighth',
            {
                documentStyle: {
                    pageSize: { width: 80, height: 42 },
                    marginLeft: 8,
                    marginRight: 8,
                    marginTop: 8,
                    marginBottom: 8,
                },
            }
        );
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const paragraphConfig = { paragraphIndex: paragraphNode.endIndex, paragraphStyle: {} } as unknown as IParagraphConfig;
        const baseGlyph = { ...shapedTextList[0].glyphs[0], width: 48 } as any;
        let result = [curPage];

        for (let i = 0; i < 8; i++) {
            result = layoutParagraph(
                ctx,
                [{ ...baseGlyph, st: i, ed: i, content: String(i) } as any],
                result,
                sectionBreakConfig,
                paragraphConfig,
                i === 0
            );
        }

        expect(result.length).toBeGreaterThan(1);
    });

    it('preserves a usable divide width when paragraph indentation consumes the column', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Indented', {
            documentStyle: {
                pageSize: { width: 80, height: 120 },
                marginLeft: 10,
                marginRight: 10,
                marginTop: 10,
                marginBottom: 10,
            },
            body: {
                dataStream: 'Indented\r\n',
                textRuns: [{ st: 0, ed: 10, ts: {} }],
                paragraphs: [{
                    startIndex: 8,
                    paragraphStyle: {
                        indentStart: { v: 60 },
                        indentEnd: { v: 60 },
                    },
                }],
                sectionBreaks: [{ startIndex: 9 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            {
                paragraphIndex: paragraphNode.endIndex,
                paragraphStyle: {
                    indentStart: { v: 60 },
                    indentEnd: { v: 60 },
                },
            } as unknown as IParagraphConfig,
            true
        );

        const divide = result[0].sections[0].columns[0].lines[0].divides[0];
        expect(divide.width).toBeGreaterThan(0);
    });

    it('positions inline custom block drawings relative to their glyph box', () => {
        const drawing = {
            drawingId: 'image-1',
            drawingOrigin: {
                docTransform: {
                    size: { width: 30, height: 20 },
                    angle: 15,
                },
            },
        } as any;
        const page = {
            skeDrawings: new Map([['old-image', { drawingId: 'old-image' }]]),
        } as any;
        const section = {
            columns: [],
            parent: page,
        } as any;
        const column = {
            left: 40,
            lines: [],
            parent: section,
        } as any;
        const line = {
            top: 100,
            lineHeight: 24,
            marginBottom: 4,
            paragraphStart: true,
            parent: column,
            divides: [{
                left: 10,
                paddingLeft: 2,
                glyphGroup: [{
                    streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
                    width: 50,
                    left: 8,
                    bBox: { ba: 9, bd: 3 },
                    drawingId: 'image-1',
                }, {
                    streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
                    width: 20,
                    left: 70,
                    bBox: { ba: 5, bd: 5 },
                }],
            }],
        } as any;
        section.columns = [column];
        column.lines = [line];

        updateInlineDrawingPosition(line, new Map([['image-1', drawing]]), 80);

        expect(page.skeDrawings.get('old-image')).toEqual({ drawingId: 'old-image' });
        expect(page.skeDrawings.get('image-1')).toMatchObject({
            aLeft: 30,
            aTop: 104,
            width: 30,
            height: 20,
            angle: 15,
            isPageBreak: false,
            lineTop: 100,
            columnLeft: 40,
            blockAnchorTop: 80,
            lineHeight: 24,
        });
    });
});
