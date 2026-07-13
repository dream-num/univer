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

import type { IDocumentSkeletonGlyph } from '../../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig } from '../../../../../../basics/interfaces';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentFlavor,
    DrawingTypeEnum,
    GridType,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    WrapTextType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlyphType, LineType } from '../../../../../../basics/i-document-skeleton-cached';
import { setDocsCustomBlockRenderViewportProvider } from '../../../../custom-block-render-viewport';
import { createSkeletonCustomBlockGlyph } from '../../../model/glyph';
import { __testing, getLineHeightMetrics, layoutParagraph, updateInlineDrawingPosition } from '../layout-ruler';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('layout-ruler', () => {
    beforeEach(() => {
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText: (value: string) => ({
                        width: value.length * 8,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                }),
            }),
        });
    });

    function createGlyph(content: string, width: number): IDocumentSkeletonGlyph {
        return {
            content,
            raw: content,
            ts: {},
            fontStyle: {
                fontString: 'bold 40.5pt "Microsoft YaHei"',
                fontSize: 40.5,
                originFontSize: 40.5,
                fontFamily: 'Microsoft YaHei',
                fontCache: 'Microsoft YaHei-40.5-bold',
            },
            width,
            bBox: {
                width,
                ba: 40,
                bd: 10,
                aba: 40,
                abd: 10,
                sp: 0,
                sbr: 0,
                sbo: 0,
                spr: 0,
                spo: 0,
            },
            xOffset: 0,
            left: 0,
            glyphType: GlyphType.LETTER,
            streamType: DataStreamTreeTokenType.LETTER,
            isJustifiable: true,
            adjustability: {
                stretchability: [0, 0],
                shrinkability: [0, 0],
            },
            count: content.length,
        };
    }

    afterEach(() => {
        setDocsCustomBlockRenderViewportProvider(null);
    });

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

    it('uses trailing CJK punctuation shrinkability when deciding line overflow', () => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph('，', 10);
        punctuation.adjustability.shrinkability = [0, 5];

        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(false);
        punctuation.adjustability.shrinkability = [0, 0];
        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(true);
    });

    it('keeps direct paragraph indents before bullet list defaults', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Item');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const bulletSkeleton = {
            listId: 'list-1',
            symbol: '-',
            ts: { ff: 'Arial', fs: 9 },
            startIndexItem: 1,
            paragraphProperties: {
                indentFirstLine: { v: 0 },
                hanging: { v: 24 },
                indentStart: { v: 48 },
            },
        };

        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {
                hanging: { v: 12 },
                indentStart: { v: 12 },
            },
            bulletSkeleton,
        } as unknown as IParagraphConfig;

        layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(paragraphConfig.paragraphStyle?.indentStart).toEqual({ v: 12 });
        expect(paragraphConfig.paragraphStyle?.hanging).toEqual({ v: 12 });
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

    it('does not recurse indefinitely when floating drawings cover the available line width', () => {
        const { ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        curPage.skeDrawings = new Map(
            Array.from({ length: 4 }, (_, index) => [`float-${index}`, {
                drawingId: `float-${index}`,
                aTop: index,
                aLeft: 20,
                width: 280,
                height: 120,
                angle: 0,
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    wrapText: WrapTextType.BOTH_SIDES,
                    behindDoc: BooleanNumber.FALSE,
                    distL: 0,
                    distR: 0,
                    distT: 0,
                    distB: 0,
                    docTransform: {
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
                    },
                },
            }])
        ) as any;
        const paragraphConfig = {
            paragraphIndex: 0,
            paragraphStyle: {},
        } as unknown as IParagraphConfig;
        const glyphGroup = [{
            glyphType: GlyphType.WORD,
            content: 'Dense',
            count: 5,
            width: 80,
            left: 0,
            xOffset: 0,
            bBox: { ba: 8, bd: 4 },
        }] as any;

        expect(() =>
            layoutParagraph(ctx, glyphGroup, [curPage], sectionBreakConfig, paragraphConfig, true)
        ).not.toThrow(RangeError);
    });

    it('closes zero-width floating anchor lines without recursing through every divide', () => {
        const { ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        const column = curPage.sections[0].columns[0];
        const anchorGlyph = {
            glyphType: GlyphType.PLACEHOLDER,
            streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
            content: '',
            count: 1,
            width: 0,
            left: 0,
            xOffset: 0,
            drawingId: 'anchor',
            bBox: { ba: 0, bd: 0 },
        };
        const zeroWidthAnchorLine = {
            paragraphIndex: 0,
            type: LineType.PARAGRAPH,
            divides: Array.from({ length: 20_000 }, (_, index) => ({
                glyphGroup: index === 0 ? [anchorGlyph] : [],
                width: 100,
                left: index,
                paddingLeft: 0,
                isFull: false,
                st: 0,
                ed: 0,
            })),
            lineHeight: 0,
            contentHeight: 0,
            top: 0,
            lineIndex: 0,
            parent: column,
        } as any;
        column.lines.push(zeroWidthAnchorLine);
        const paragraphConfig = {
            paragraphIndex: 0,
            paragraphStyle: {},
            paragraphNonInlineSkeDrawings: new Map([['anchor', {
                drawingId: 'anchor',
                aTop: 0,
                aLeft: 0,
                width: 10,
                height: 10,
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.FALSE,
                    docTransform: {
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
                    },
                },
            }]]),
        } as unknown as IParagraphConfig;
        const glyphGroup = [{
            glyphType: GlyphType.WORD,
            content: 'Text',
            count: 4,
            width: 40,
            left: 0,
            xOffset: 0,
            bBox: { ba: 8, bd: 4 },
        }] as any;

        expect(() =>
            layoutParagraph(ctx, glyphGroup, [curPage], sectionBreakConfig, paragraphConfig, false)
        ).not.toThrow(RangeError);
    });

    it('treats empty zero-size glyphs as ignorable in zero-width floating anchor lines', () => {
        const { ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        const column = curPage.sections[0].columns[0];
        const anchorGlyph = {
            glyphType: GlyphType.PLACEHOLDER,
            streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
            content: '',
            count: 1,
            width: 0,
            left: 0,
            xOffset: 0,
            drawingId: 'anchor',
            bBox: { ba: 0, bd: 0 },
        };
        const emptyGlyph = {
            glyphType: GlyphType.WORD,
            content: '',
            count: 0,
            width: 0,
            left: 0,
            xOffset: 0,
            bBox: { ba: 0, bd: 0 },
        };
        const divide = {
            glyphGroup: [anchorGlyph, emptyGlyph],
            width: 100,
            left: 0,
            paddingLeft: 0,
            isFull: false,
            st: 0,
            ed: 0,
        } as any;
        const zeroWidthAnchorLine = {
            paragraphIndex: 0,
            type: LineType.PARAGRAPH,
            divides: [divide],
            lineHeight: 0,
            contentHeight: 0,
            top: 0,
            lineIndex: 0,
            parent: column,
        } as any;
        divide.parent = zeroWidthAnchorLine;
        column.lines.push(zeroWidthAnchorLine);
        const paragraphConfig = {
            paragraphIndex: 0,
            paragraphStyle: {},
            paragraphNonInlineSkeDrawings: new Map([['anchor', {
                drawingId: 'anchor',
                aTop: 0,
                aLeft: 0,
                width: 10,
                height: 10,
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.FALSE,
                    docTransform: {
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
                    },
                },
            }]]),
        } as unknown as IParagraphConfig;
        const glyphGroup = [{
            glyphType: GlyphType.WORD,
            content: 'Y',
            count: 1,
            width: 8,
            left: 0,
            xOffset: 0,
            bBox: { ba: 8, bd: 4 },
        }] as any;

        layoutParagraph(ctx, glyphGroup, [curPage], sectionBreakConfig, paragraphConfig, false);

        expect(column.lines).toHaveLength(2);
        expect(column.lines[0].divides.every((divide) => divide.isFull)).toBe(true);
        expect(column.lines[1].divides[0].glyphGroup).toEqual(glyphGroup);
    });

    it('end-to-end: shapes and lays out text through lineBreaking', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const lastPage = result[result.length - 1];
        expect(lastPage.sections.length).toBeGreaterThan(0);
    });

    it('keeps imported shape text on one line when browser glyph bboxes slightly exceed the box', () => {
        const text = '\u4F01\u4E1A\u6587\u5316\u5EFA\u8BBE';
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(text, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 365.3740157480315, height: 120 },
                marginTop: 0,
                marginBottom: 0,
                marginLeft: 20,
                marginRight: 20,
                paragraphLineGapDefault: 0,
            },
        });
        const glyphs = text.split('').map((char) => createGlyph(char, 54.65998840332031));
        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {
                lineSpacing: 1,
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: 0 },
                spaceBelow: { v: 0 },
            },
            useWordStyleLineHeight: false,
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(ctx, glyphs, [curPage], sectionBreakConfig, paragraphConfig, true);
        const lines = result[0].sections[0].columns[0].lines;

        expect(lines).toHaveLength(1);
        expect(lines[0].divides[0].glyphGroup.map((glyph) => glyph.content).join('')).toBe(text);
    });

    it('uses glyph height as the base for auto line spacing when grid snapping is not explicitly enabled', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(24, 4);
    });

    it('does not multiply inline custom block height by auto line spacing', () => {
        const metrics = getLineHeightMetrics(624, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(624, 4);
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

    it('uses document grid line pitch as the minimum exact line box height for snapped docx paragraphs', () => {
        const metrics = getLineHeightMetrics(16, 0, 30.46666666666667, GridType.LINES_AND_CHARS, 26.666666666666668, SpacingRule.EXACT, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(30.46666666666667, 4);
    });

    it('stops dirty relayout after a floating object reaches the reposition limit', () => {
        const cachedPage: any = {
            segmentId: '',
            skeDrawings: new Map([['floating', {}]]),
            sections: [{ columns: [{ lines: [{ paragraphIndex: 1, top: 0, lineHeight: 20 }] }] }],
        };
        const page: any = {
            segmentId: '',
            sections: [{ columns: [] }],
        };
        const column: any = {
            width: 100,
            left: 0,
            lines: [{ paragraphIndex: 2, top: 0, lineHeight: 20 }],
            parent: { parent: page },
        };
        page.sections[0].columns = [column];
        const floatObject: any = {
            id: 'floating',
            top: 0,
            left: 0,
            width: 50,
            height: 50,
            angle: 0,
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
        };
        const ctx: any = {
            floatObjectsCache: new Map([['floating', { count: 5, floatObject, page: cachedPage }]]),
            isDirty: false,
            layoutStartPointer: { '': null },
            paragraphsOpenNewPage: new Set(),
        };

        __testing.reLayoutCheck(ctx, [floatObject], column, 9);

        expect(ctx.isDirty).toBe(false);
        expect(ctx.floatObjectsCache.has('floating')).toBe(true);
        expect(ctx.paragraphsOpenNewPage.has(9)).toBe(false);
    });

    it('does not dirty relayout for behind-doc floating objects', () => {
        const page: any = {
            segmentId: '',
            sections: [{ columns: [] }],
        };
        const column: any = {
            width: 100,
            left: 0,
            lines: [{ paragraphIndex: 2, top: 0, lineHeight: 20 }],
            parent: { parent: page },
        };
        page.sections[0].columns = [column];
        const floatObject: any = {
            id: 'behind-floating',
            top: 0,
            left: 0,
            width: 50,
            height: 50,
            angle: 0,
            behindDoc: BooleanNumber.TRUE,
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
        };
        const ctx: any = {
            floatObjectsCache: new Map(),
            isDirty: false,
            layoutStartPointer: { '': null },
            paragraphsOpenNewPage: new Set(),
        };

        __testing.reLayoutCheck(ctx, [floatObject], column, 9);

        expect(ctx.isDirty).toBe(false);
        expect(ctx.floatObjectsCache.has('behind-floating')).toBe(false);
        expect(ctx.paragraphsOpenNewPage.has(9)).toBe(false);
    });

    it('keeps the legacy line-height behavior for embedded sheet documents', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(23.4, 4);
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
            top: 126,
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

        updateInlineDrawingPosition(line, new Map([['image-1', drawing]]), '', 80);

        expect(page.skeDrawings.get('old-image')).toEqual({ drawingId: 'old-image' });
        expect(page.skeDrawings.get('image-1')).toMatchObject({
            aLeft: 70,
            aTop: 230,
            width: 30,
            height: 20,
            angle: 15,
            isPageBreak: false,
            lineTop: 226,
            columnLeft: 40,
            blockAnchorTop: 206,
            lineHeight: 24,
        });
    });

    it('moves non-wrap tables into the usable area beside flow-affecting drawings', () => {
        const table = {
            top: 120,
            left: 0,
            width: 280,
            height: 80,
        } as any;
        const page = {
            skeDrawings: new Map([['left-wrap', {
                aTop: 40,
                aLeft: 10,
                width: 90,
                height: 220,
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.WRAP_TIGHT,
                    distR: 8,
                },
            }]]),
        } as any;
        const column = {
            width: 420,
        } as any;

        __testing.avoidFlowAffectingDrawingsForTable(table, page, column);

        expect(table.left).toBe(108);
    });

    it('stores custom block render viewport on inline skeleton drawings', () => {
        setDocsCustomBlockRenderViewportProvider(() => ({
            bleedLeft: 12,
            bleedWidth: 360,
            contentHeight: 120,
            contentWidth: 320,
            height: 80,
            viewportHeight: 64,
            layoutWidth: 180,
            width: 180,
        }));

        const page = {
            marginLeft: 20,
            marginRight: 20,
            pageWidth: 400,
            skeDrawings: new Map(),
        };
        const section = { parent: page };
        const column = { left: 0, parent: section };
        const paragraphInlineSkeDrawings = new Map([
            [
                'b1',
                {
                    drawingId: 'b1',
                    aLeft: 0,
                    aTop: 0,
                    width: 0,
                    height: 0,
                    angle: 0,
                    initialState: false,
                    columnLeft: 0,
                    lineHeight: 0,
                    lineTop: 0,
                    blockAnchorTop: 0,
                    isPageBreak: false,
                    drawingOrigin: {
                        drawingId: 'b1',
                        drawingType: DrawingTypeEnum.DRAWING_DOM,
                        layoutType: PositionedObjectLayoutType.INLINE,
                        docTransform: {
                            angle: 0,
                            size: { height: 60, width: 120 },
                        },
                        transform: {
                            height: 60,
                            left: 0,
                            top: 0,
                            width: 120,
                        },
                    },
                },
            ],
        ]);
        const glyph = createSkeletonCustomBlockGlyph({
            charSpace: 1,
            fontStyle: {
                fontCache: '',
                fontFamily: 'Arial',
                fontSize: 12,
                fontString: '12px Arial',
                originFontSize: 12,
            },
            snapToGrid: BooleanNumber.FALSE,
            textStyle: {},
        }, 180, 80, 'b1');

        updateInlineDrawingPosition({
            divides: [{
                glyphGroup: [glyph],
                left: 0,
                paddingLeft: 0,
            }],
            lineHeight: 100,
            marginBottom: 0,
            parent: column,
            top: 10,
        } as never, paragraphInlineSkeDrawings as never, 'test-doc', 10);

        const drawing = page.skeDrawings.get('b1');
        expect(drawing?.width).toBe(180);
        expect(drawing?.height).toBe(80);
        expect(drawing?.customBlockRenderViewport?.bleedLeft).toBe(12);
        expect(drawing?.customBlockRenderViewport?.bleedWidth).toBe(360);
        expect(drawing?.customBlockRenderViewport?.contentHeight).toBe(120);
        expect(drawing?.customBlockRenderViewport?.contentWidth).toBe(320);
        expect(drawing?.customBlockRenderViewport?.height).toBe(80);
        expect(drawing?.customBlockRenderViewport?.viewportHeight).toBe(64);
        expect(drawing?.aTop).toBe(30);
    });
});
