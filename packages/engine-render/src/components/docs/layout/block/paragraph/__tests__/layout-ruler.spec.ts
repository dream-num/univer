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

import type { IDocumentSkeletonDivide, IDocumentSkeletonGlyph } from '../../../../../../basics/i-document-skeleton-cached';
import type { IParagraphConfig } from '../../../../../../basics/interfaces';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentFlavor,
    DrawingTypeEnum,
    GridType,
    NumberUnitType,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    TableAlignmentType,
    TableTextWrapType,
    WrapTextType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlyphType, LineType } from '../../../../../../basics/i-document-skeleton-cached';
import { setDocsCustomBlockRenderViewportProvider } from '../../../../custom-block-render-viewport';
import { getDocumentCompatibilityPolicy } from '../../../../document-compatibility';
import { Lang } from '../../../hyphenation/lang';
import { BreakPointType } from '../../../line-breaker/break';
import { createSkeletonCustomBlockGlyph } from '../../../model/glyph';
import { clearFontCreateConfigCache, updateBlockIndex } from '../../../tools';
import { __testing, getLineHeightMetrics, layoutParagraph, updateInlineDrawingPosition } from '../layout-ruler';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';
import issue1207Snapshot from './fixtures/issue-1207-bullet-style.snapshot.json';

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
        expect(result[0].sections[0].columns[0].lines[0].divides[0].glyphGroup[0].width).toBe(21);
    });

    it('does not compress a wide list marker into the hanging indent', () => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Item');
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {},
            bulletSkeleton: {
                listId: 'wide-list',
                symbol: '12345',
                ts: { ff: 'Arial', fs: 9 },
                startIndexItem: 1,
                paragraphProperties: {
                    hanging: { v: 21 },
                    indentStart: { v: 0 },
                },
            },
        } as unknown as IParagraphConfig;

        const result = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );

        expect(result[0].sections[0].columns[0].lines[0].divides[0].glyphGroup[0].width).toBe(42);
    });

    it.each([
        [DocumentFlavor.DRAWINGML, 0, '\u25CF', 8],
        [DocumentFlavor.DRAWINGML, 0, '12345', 40],
        [DocumentFlavor.DRAWINGML, 12, '\u25CF', 12],
        [DocumentFlavor.UNSPECIFIED, 0, '\u25CF', 54],
        [DocumentFlavor.MODERN, 0, '\u25CF', 54],
        [DocumentFlavor.TRADITIONAL, 0, '\u25CF', 54],
    ])('respects bullet advance for flavor %s, hanging %s and marker %s', (flavor, hanging, symbol, width) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Item');
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(flavor);
        sectionBreakConfig.defaultTabStop = 27;
        const shapedTextList = shaping(ctx, paragraphNode.content!, ctx.viewModel, paragraphNode, sectionBreakConfig);
        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: { hanging: { v: hanging }, indentStart: { v: 18 } },
            bulletSkeleton: {
                listId: 'drawing-list',
                symbol,
                ts: { ff: 'Arial', fs: 9 },
                startIndexItem: 1,
            },
        } as IParagraphConfig;
        const pages = layoutParagraph(
            ctx,
            shapedTextList[0].glyphs,
            [curPage],
            sectionBreakConfig,
            paragraphConfig,
            true
        );
        const glyphs = pages[0].sections[0].columns[0].lines[0].divides[0].glyphGroup;

        expect(glyphs[0].content).toBe(symbol);
        expect(glyphs[0].width).toBe(width);
        expect(glyphs[1].left - glyphs[0].left).toBe(width);
    });

    it('preserves bullet styles from a real PowerPoint import snapshot', () => {
        const expectedCases = {
            'case-A': {
                content: 'p',
                fontFamily: 'Wingdings',
                fontSize: 18,
                color: '#111111',
            },
            'case-B': {
                content: 'p',
                fontFamily: 'Wingdings',
                fontSize: 27,
                color: '#E11D48',
            },
            'case-C': {
                content: '□',
                fontFamily: 'Arial',
                fontSize: 18,
                color: '#111111',
            },
        } as const;

        for (const snapshotCase of issue1207Snapshot.cases) {
            const { body, documentStyle, ...document } = snapshotCase.doc;
            const content = body.dataStream.replace(/\r\n$/, '');
            const testBed = createParagraphLayoutTestBed(content, {
                ...document,
                body,
                documentStyle,
            });
            const shapedTextList = shaping(
                testBed.ctx,
                testBed.paragraphNode.content!,
                testBed.viewModel,
                testBed.paragraphNode,
                testBed.sectionBreakConfig
            );
            const pages = lineBreaking(
                testBed.ctx,
                testBed.viewModel,
                shapedTextList,
                testBed.curPage,
                testBed.paragraphNode,
                testBed.sectionBreakConfig,
                null
            );
            const bulletGlyph = pages[0].sections[0].columns[0].lines[0].divides[0].glyphGroup
                .find((glyph) => glyph.glyphType === GlyphType.LIST);
            const expected = expectedCases[snapshotCase.name as keyof typeof expectedCases];

            expect(bulletGlyph, snapshotCase.name).toBeDefined();
            expect(bulletGlyph?.content, snapshotCase.name).toBe(expected.content);
            expect(bulletGlyph?.ts?.ff, snapshotCase.name).toBe(expected.fontFamily);
            expect(bulletGlyph?.ts?.fs, snapshotCase.name).toBe(expected.fontSize);
            expect(bulletGlyph?.ts?.cl?.rgb, snapshotCase.name).toBe(expected.color);
            expect(bulletGlyph?.fontStyle?.fontFamily, snapshotCase.name).toBe(expected.fontFamily);
            expect(bulletGlyph?.fontStyle?.originFontSize, snapshotCase.name).toBe(expected.fontSize);
        }
    });

    it.each([' ', '  '])('preserves source spaces when limiting consecutive hyphens (%j)', async (separator) => {
        const content = `Further text keeps the${separator}paragraph flowing. `.repeat(100);
        const { ctx, paragraphNode, sectionBreakConfig, curPage, viewModel } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                autoHyphenation: BooleanNumber.TRUE,
                consecutiveHyphenLimit: 0,
                pageSize: { width: 400, height: 600 },
            },
        });
        await ctx.hyphen.loadPattern(Lang.Es);
        await ctx.hyphen.loadPattern(Lang.EnGb);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const glyphs = pages.flatMap((page) => page.sections.flatMap((section) => section.columns
            .flatMap((column) => column.lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)))));
        const sourceGlyphs = glyphs.filter((glyph) => glyph.count > 0);

        expect(sourceGlyphs.map((glyph) => glyph.raw).join('')).toBe(paragraphNode.content);
        expect(sourceGlyphs.reduce((count, glyph) => count + glyph.count, 0)).toBe(paragraphNode.content!.length);
    });

    it.each(['', ' ', '  '])('keeps a first word slice and its leading spaces (%j)', (prefix) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(`${prefix}abcdef`, {
            documentStyle: { consecutiveHyphenLimit: 0 },
        });
        const config = { paragraphIndex: paragraphNode.endIndex, paragraphStyle: {} } as IParagraphConfig;
        const first = `${prefix}abc`.split('').map((char) => createGlyph(char, 50));
        let pages = layoutParagraph(ctx, first, [curPage], sectionBreakConfig, config, true, BreakPointType.Hyphen);
        pages = layoutParagraph(ctx, 'def'.split('').map((char) => createGlyph(char, 80)), pages, sectionBreakConfig, config, false);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        const text = lines.map((line) => line.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.raw).join(''));

        expect(text.join('')).toBe(`${prefix}abcdef`);
        expect(text[0]).toBe(`${prefix}abc`);
    });

    it('aligns following text to an explicit end tab stop', () => {
        const tab = createGlyph(DataStreamTreeTokenType.TAB, 36);
        tab.glyphType = GlyphType.TAB;
        tab.left = 100;
        const pageNumber = createGlyph('1', 8);
        const paragraphMark = createGlyph(DataStreamTreeTokenType.PARAGRAPH, 8);
        const divide = { glyphGroup: [tab], width: 580 } as IDocumentSkeletonDivide;
        const paragraphConfig = {
            paragraphStyle: {
                tabStops: [{ offset: 600, alignment: 3, leader: 2 }],
            },
        } as IParagraphConfig;

        __testing.adjustExplicitTabStop(divide, [pageNumber, paragraphMark], paragraphConfig);

        expect(tab.width).toBe(464);
        expect(tab.bBox.width).toBe(464);
        expect(tab.tabLeader).toBe(2);
    });

    it.each([
        [undefined, false],
        [0, true],
        [-1, false],
        [Number.NaN, false],
    ] as const)('honors explicit line-wrap tolerance without changing legacy defaults (%s)', (tolerance, overflow) => {
        const glyph = createGlyph('外', 10);
        // The extra CJK character fits within the legacy 3px allowance, but not within the box.
        expect(__testing.isGlyphGroupBeyondDivideWidth([glyph], 840, 847.428, false, tolerance)).toBe(overflow);
        expect(__testing.isGlyphGroupBeyondDivideWidth([glyph], 837.428, 847.428, false, tolerance)).toBe(false);
    });

    it('uses trailing CJK punctuation shrinkability when deciding line overflow', () => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph('，', 10);
        punctuation.adjustability.shrinkability = [0, 5];

        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(false);
        punctuation.adjustability.shrinkability = [0, 0];
        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(true);
    });

    it.each(['', '\r', '\u2028'])('allows explicit hanging punctuation before a terminal control (%j)', (control) => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph('。', 10);
        punctuation.adjustability.shrinkability = [0, 0];
        const glyphs = [text, punctuation];
        if (control) {
            glyphs.push(createGlyph(control, 0), createGlyph('', 0));
        }

        expect(__testing.isGlyphGroupBeyondDivideWidth(glyphs, 85, 100)).toBe(true);
        expect(__testing.isGlyphGroupBeyondDivideWidth(glyphs, 85, 100, true)).toBe(false);
    });

    it.each([
        ['ja-JP', undefined, '）', true],
        ['ja', undefined, '」', true],
        ['JA-jp', undefined, '！', true],
        ['ja-JP', undefined, '。', false],
        ['ja-JP', undefined, '、', false],
        ['ja-JP', undefined, '．', false],
        ['ja-JP', undefined, '，', false],
        ['zh-CN', undefined, '）', false],
        [undefined, undefined, '）', false],
        ['ja-JP', 'en-US', '）', true],
        ['ja-JP', 'ja-JP', '）', true],
        ['ja-JP', 'zh-CN', '）', false],
        ['ja-JP', 'zh-TW', '）', false],
        ['ja-JP', 'ko-KR', '）', false],
        ['zh-CN', 'ja-JP', '）', true],
        ['zh-CN', 'en-US', '）', false],
        ['en-US', 'ja-JP', '）', true],
        ['ko-KR', 'ja-JP', '）', true],
    ] as const)('uses authored language %s / %s for hanging %s without changing compression', (lang, altLang, content, overflow) => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph(content, 10);
        punctuation.ts = { lang, altLang };
        punctuation.adjustability.shrinkability = [0, 0];
        const glyphs = [text, punctuation, createGlyph('\r', 0)];
        expect(__testing.isGlyphGroupBeyondDivideWidth(glyphs, 85, 100, true)).toBe(overflow);
        expect(__testing.isGlyphGroupBeyondDivideWidth(glyphs, 85, 100, false)).toBe(true);
        punctuation.adjustability.shrinkability = [0, 5];
        expect(__testing.isGlyphGroupBeyondDivideWidth(glyphs, 85, 100, false)).toBe(false);
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
        expect(curPage.sections[0].columns[0].lines[0].divides[0].paddingLeft).toBe(0);
        expect(curPage.sections[0].columns[0].lines[0].divides[0].glyphGroup[0].width).toBe(12);
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

    it.each([
        [DocumentFlavor.UNSPECIFIED, undefined, 1],
        [DocumentFlavor.DRAWINGML, undefined, 2],
        [DocumentFlavor.DRAWINGML, 1, 1],
    ] as const)('uses the host wrapping default with an optional explicit tolerance (%s, %s)', (documentFlavor, lineWrapTolerance, expectedLines) => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('甲乙', {
            documentStyle: {
                documentFlavor: DocumentFlavor.UNSPECIFIED,
                pageSize: { width: 55.5, height: 300 },
                marginLeft: 20,
                marginRight: 20,
                marginTop: 0,
                marginBottom: 0,
                spaceWidthEastAsian: BooleanNumber.FALSE,
                renderConfig: { lineWrapTolerance, zeroWidthParagraphBreak: BooleanNumber.TRUE },
            },
            body: { paragraphs: [{ startIndex: 2, paragraphId: 'host-wrapping', paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }] },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        expect(pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)))).toHaveLength(expectedLines);
    });

    it.each([DocumentFlavor.DRAWINGML, DocumentFlavor.UNSPECIFIED, DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]
        .flatMap((documentFlavor) => [undefined, BooleanNumber.FALSE, BooleanNumber.TRUE]
            .flatMap((zeroWidthParagraphBreak) => [false, true].map((empty) => ({ documentFlavor, zeroWidthParagraphBreak, empty })))))('preserves paragraph marks without wrapping fitting DrawingML text ($documentFlavor, $zeroWidthParagraphBreak, empty=$empty)', ({ documentFlavor, zeroWidthParagraphBreak, empty }) => {
        clearFontCreateConfigCache();
        const content = empty ? '' : 'AA BB';
        const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.UNSPECIFIED,
                pageSize: { width: 81, height: 300 },
                marginLeft: 20,
                marginRight: 20,
                marginTop: 0,
                marginBottom: 0,
                renderConfig: { zeroWidthParagraphBreak },
            },
            body: {
                textRuns: [{ st: content.length, ed: content.length + 1, ts: { fs: 5, bl: BooleanNumber.TRUE } }],
                paragraphs: [{ startIndex: content.length, paragraphId: 'paragraph-mark-width', paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }],
            },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const before = JSON.stringify(dataModel.getSnapshot());
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const mark = shaped.flatMap((item) => item.glyphs).find((glyph) => glyph.content === '\r')!;
        const zeroWidth = zeroWidthParagraphBreak === BooleanNumber.TRUE || documentFlavor === DocumentFlavor.TRADITIONAL ||
            (zeroWidthParagraphBreak == null && documentFlavor === DocumentFlavor.DRAWINGML);
        expect(mark.width).toBe(zeroWidth ? 0 : 8);
        expect(mark.count).toBe(1);
        expect(mark.ts).toMatchObject({ fs: 5, bl: BooleanNumber.TRUE });
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines).toHaveLength(empty || zeroWidth ? 1 : 2);
        expect(lines.every((line) => line.lineHeight > 0)).toBe(true);
        expect(lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)).map((glyph) => glyph.content).join('')).toBe(`${content}\r`);
        expect(JSON.stringify(dataModel.getSnapshot())).toBe(before);
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

    it.each([DocumentFlavor.DRAWINGML, DocumentFlavor.UNSPECIFIED, DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]
        .flatMap((documentFlavor) => [false, true].flatMap((empty) => [false, true].map((split) => ({ documentFlavor, empty, split })))))('uses paragraph-end metrics only for empty DrawingML lines ($documentFlavor, empty=$empty, split=$split)', ({ documentFlavor, empty, split }) => {
        const measure = (markSize: number) => {
            const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(empty ? '' : 'a', {
                documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
            });
            sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
            const textGlyph = createGlyph('a', 12);
            textGlyph.fontStyle!.originFontSize = 10.5;
            textGlyph.bBox.ba = 12;
            textGlyph.bBox.bd = 3;
            const markGlyph = createGlyph('\r', 0);
            markGlyph.streamType = DataStreamTreeTokenType.PARAGRAPH;
            markGlyph.fontStyle!.originFontSize = markSize;
            markGlyph.bBox.ba = markSize;
            markGlyph.bBox.bd = markSize / 4;
            const paragraphConfig: IParagraphConfig = {
                paragraphIndex: paragraphNode.endIndex,
                paragraphStyle: { lineSpacing: 1, spacingRule: SpacingRule.AUTO, snapToGrid: BooleanNumber.FALSE },
                useWordStyleLineHeight: false,
                skeHeaders: ctx.skeletonResourceReference.skeHeaders,
                skeFooters: ctx.skeletonResourceReference.skeFooters,
            };
            if (split && !empty) {
                layoutParagraph(ctx, [textGlyph], [curPage], sectionBreakConfig, paragraphConfig, true);
            }
            const glyphs = empty || split ? [markGlyph] : [textGlyph, markGlyph];
            const pages = layoutParagraph(ctx, glyphs, [curPage], sectionBreakConfig, paragraphConfig, empty || !split);
            updateBlockIndex(pages, -1, sectionBreakConfig.documentCompatibilityPolicy);
            const lines = pages[0].sections[0].columns[0].lines;
            expect(lines).toHaveLength(1);
            expect(markGlyph.fontStyle!.originFontSize).toBe(markSize);
            return [lines[0].contentHeight, lines[0].paddingTop, lines[0].paddingBottom, lines[0].lineHeight, lines[0].asc, lines[0].dsc];
        };
        const small = measure(18);
        const large = measure(36);
        if (documentFlavor === DocumentFlavor.DRAWINGML && !empty) {
            expect(large).toEqual(small);
        } else {
            expect(large).not.toEqual(small);
        }
    });

    it('uses glyph height as the base for auto line spacing when grid snapping is not explicitly enabled', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(24, 4);
    });

    it.each([
        { fontSize: 10.5, lineSpacing: 1.5, spacingRule: SpacingRule.AUTO, expectedHeight: 25.2 },
        { fontSize: 9, lineSpacing: 1.5, spacingRule: SpacingRule.AUTO, expectedHeight: 21.6 },
        { fontSize: 10.5, lineSpacing: 12, spacingRule: SpacingRule.EXACT, expectedHeight: 12 },
        { fontSize: 9, lineSpacing: 11, spacingRule: SpacingRule.EXACT, expectedHeight: 11 },
    ].map((entry) => ({ ...entry, documentFlavor: DocumentFlavor.DRAWINGML, inlineBlock: false })).concat([
        { fontSize: 10.5, lineSpacing: 1.5, spacingRule: SpacingRule.AUTO, expectedHeight: 28.5, documentFlavor: DocumentFlavor.UNSPECIFIED, inlineBlock: false },
        { fontSize: 10.5, lineSpacing: 12, spacingRule: SpacingRule.EXACT, expectedHeight: 12, documentFlavor: DocumentFlavor.UNSPECIFIED, inlineBlock: false },
        { fontSize: 10.5, lineSpacing: 12, spacingRule: SpacingRule.EXACT, expectedHeight: 19, documentFlavor: DocumentFlavor.DRAWINGML, inlineBlock: true },
    ]))('preserves line spacing $lineSpacing / $spacingRule at $fontSize pt with layout $documentFlavor and inline block $inlineBlock', ({ fontSize, lineSpacing, spacingRule, expectedHeight, documentFlavor, inlineBlock }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('ab', {
            documentStyle: {
                pageSize: { width: 300, height: 300 },
                marginTop: 0,
                marginBottom: 0,
                paragraphLineGapDefault: 0,
            },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const glyphs = ['a', 'b', '\r'].map((character) => {
            const glyph = createGlyph(character, character === '\r' ? 0 : 12);
            glyph.fontStyle!.originFontSize = character === '\r' ? 14 : fontSize;
            glyph.bBox.ba = 15;
            glyph.bBox.bd = 4;
            if (character === '\r') {
                glyph.streamType = DataStreamTreeTokenType.PARAGRAPH;
            } else if (inlineBlock && character === 'b') {
                glyph.streamType = DataStreamTreeTokenType.CUSTOM_BLOCK;
            }
            return glyph;
        });
        const paragraphConfig: IParagraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: { lineSpacing, spacingRule, snapToGrid: BooleanNumber.FALSE },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        };
        const result = layoutParagraph(ctx, glyphs, [curPage], sectionBreakConfig, paragraphConfig, true);
        const lines = result[0].sections[0].columns[0].lines;
        expect(lines).toHaveLength(1);
        expect(lines[0].lineHeight).toBeCloseTo(expectedHeight, 4);
    });

    it.each([1, 1.15, 1.5, 2].flatMap((lineSpacing) => [DocumentFlavor.DRAWINGML, DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL, DocumentFlavor.UNSPECIFIED].map((documentFlavor) => ({ lineSpacing, documentFlavor }))))('preserves automatic baseline intervals but excludes terminal leading in $documentFlavor at $lineSpacing', ({ lineSpacing, documentFlavor }) => {
        for (const lineCount of [1, 2]) {
            const { ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('a\ra', {
                documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
            });
            const policy = getDocumentCompatibilityPolicy(documentFlavor);
            sectionBreakConfig.documentCompatibilityPolicy = policy;
            let pages = [curPage];
            for (let index = 0; index < lineCount; index++) {
                const glyphs = ['a', '\r'].map((content) => {
                    const glyph = createGlyph(content, content === 'a' ? 8 : 0);
                    glyph.fontStyle!.originFontSize = 9;
                    glyph.bBox.ba = 11;
                    glyph.bBox.bd = 3;
                    if (content === '\r') {
                        glyph.streamType = DataStreamTreeTokenType.PARAGRAPH;
                    }
                    return glyph;
                });
                const paragraphConfig: IParagraphConfig = {
                    paragraphIndex: index * 2 + 1,
                    paragraphStyle: { lineSpacing, spacingRule: SpacingRule.AUTO, snapToGrid: BooleanNumber.FALSE },
                    useWordStyleLineHeight: false,
                    skeHeaders: ctx.skeletonResourceReference.skeHeaders,
                    skeFooters: ctx.skeletonResourceReference.skeFooters,
                };
                pages = layoutParagraph(ctx, glyphs, pages, sectionBreakConfig, paragraphConfig, true);
            }
            const lines = pages[0].sections[0].columns[0].lines;
            expect(lines).toHaveLength(lineCount);
            const heights = lines.map((line) => line.lineHeight);
            const expectedInterval = (documentFlavor === DocumentFlavor.DRAWINGML ? 14.4 : 14) * lineSpacing;
            const expandedDrawingML = documentFlavor === DocumentFlavor.DRAWINGML && lineSpacing > 1;
            const expectedTerminal = expandedDrawingML ? Math.max(14.4, expectedInterval * 0.75 + 3) : expectedInterval;
            for (let pass = 0; pass < 2; pass++) {
                updateBlockIndex(pages, -1, policy);
                expect(lines.map((line) => line.lineHeight)).toEqual(heights);
                expect(lines[lineCount - 1].top).toBeCloseTo((lineCount - 1) * expectedInterval, 6);
                expect(pages[0].height).toBeCloseTo((lineCount - 1) * expectedInterval + expectedTerminal, 6);
                if (expandedDrawingML) {
                    expect(lines[0].paddingTop + lines[0].asc).toBeCloseTo(expectedInterval * 0.75, 6);
                }
            }
        }
    });

    it.each([
        { lineSpacing: 22, ascent: 18, descent: 4, expectedBaseline: 18 },
        { lineSpacing: 28, ascent: 22, descent: 5, expectedBaseline: 22 },
        { lineSpacing: 28, ascent: 23, descent: 6, expectedBaseline: 22 },
    ])('keeps DrawingML fixed spacing near natural glyph height within the font edges ($lineSpacing, $ascent, $descent)', ({ lineSpacing, ascent, descent, expectedBaseline }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('ab', {
            documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
        const paragraphConfig: IParagraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: { lineSpacing, spacingRule: SpacingRule.EXACT, snapToGrid: BooleanNumber.FALSE },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        };
        const first = createGlyph('a', 12);
        first.bBox.ba = ascent;
        first.bBox.bd = descent;
        const pages = layoutParagraph(ctx, [first], [curPage], sectionBreakConfig, paragraphConfig, true);
        const line = pages[0].sections[0].columns[0].lines[0];
        expect(line.paddingTop + ascent).toBeCloseTo(expectedBaseline, 6);
        updateBlockIndex(pages, -1, sectionBreakConfig.documentCompatibilityPolicy);
        expect(line.paddingTop + line.asc).toBeCloseTo(expectedBaseline, 6);
        const larger = createGlyph('b', 12);
        larger.bBox.ba = 46;
        larger.bBox.bd = 13;
        line.divides[0].glyphGroup.push(larger);
        for (let pass = 0; pass < 2; pass++) {
            updateBlockIndex(pages, -1, sectionBreakConfig.documentCompatibilityPolicy);
            const updatedLine = pages[0].sections[0].columns[0].lines[0];
            expect(updatedLine.paddingTop + updatedLine.asc).toBeCloseTo(lineSpacing * 0.75, 6);
            expect(updatedLine.lineHeight).toBeCloseTo(lineSpacing, 6);
        }
    });

    it.each([12, 48].flatMap((lineSpacing) => [DocumentFlavor.DRAWINGML, DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL, DocumentFlavor.UNSPECIFIED].map((documentFlavor) => ({ lineSpacing, documentFlavor }))))('keeps fixed-line baselines independent of font ascent in $documentFlavor at $lineSpacing', ({ lineSpacing, documentFlavor }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('ab', {
            documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const paragraphConfig: IParagraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: { lineSpacing, spacingRule: SpacingRule.EXACT, snapToGrid: BooleanNumber.FALSE },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        };
        const first = createGlyph('a', 12);
        first.bBox.ba = 23;
        first.bBox.bd = 6;
        const second = createGlyph('b', 12);
        second.bBox.ba = 46;
        second.bBox.bd = 13;
        let pages = layoutParagraph(ctx, [first], [curPage], sectionBreakConfig, paragraphConfig, true);
        for (const append of [false, true]) {
            if (append) {
                pages = layoutParagraph(ctx, [second], pages, sectionBreakConfig, paragraphConfig, false);
            }
            updateBlockIndex(pages, -1, sectionBreakConfig.documentCompatibilityPolicy);
            const line = pages[0].sections[0].columns[0].lines[0];
            // Native PowerPoint H-glyph baselines: 9/36 at fixed spacing 12/48, across Arial/Calibri 24/48 pt.
            const expectedBaseline = documentFlavor === DocumentFlavor.DRAWINGML
                ? lineSpacing * 0.75
                : (lineSpacing - line.contentHeight) / 2 + line.asc;
            expect(line.paddingTop + line.asc).toBeCloseTo(expectedBaseline, 6);
            expect(line.lineHeight).toBeCloseTo(lineSpacing, 6);
            updateBlockIndex(pages, -1, sectionBreakConfig.documentCompatibilityPolicy);
            expect(line.paddingTop + line.asc).toBeCloseTo(expectedBaseline, 6);
        }
    });

    it.each([12, 18].flatMap((fontSize) => [
        { lineSpacing: 0.7, spacingRule: SpacingRule.AUTO },
        { lineSpacing: 1.4, spacingRule: SpacingRule.AUTO },
        { lineSpacing: 18, spacingRule: SpacingRule.EXACT },
        { lineSpacing: 36, spacingRule: SpacingRule.EXACT },
    ].flatMap((spacing) => [NumberUnitType.LINE, NumberUnitType.PERCENT].map((unit) => ({ fontSize, unit, ...spacing })))))('resolves DrawingML relative paragraph spacing independently of line spacing ($fontSize, $lineSpacing, $spacingRule, $unit)', ({ fontSize, unit, lineSpacing, spacingRule }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('ab', {
            documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
        const glyphs = ['a', 'b', '\r'].map((character) => {
            const glyph = createGlyph(character, character === '\r' ? 0 : 12);
            glyph.fontStyle!.originFontSize = character === '\r' ? 40 : fontSize;
            glyph.bBox.ba = 15;
            glyph.bBox.bd = 4;
            if (character === '\r') {
                glyph.streamType = DataStreamTreeTokenType.PARAGRAPH;
            }
            return glyph;
        });
        const paragraphConfig: IParagraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {
                lineSpacing,
                spacingRule,
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: 0.2, u: unit },
                spaceBelow: { v: 0.3, u: unit },
            },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        };
        const result = layoutParagraph(ctx, glyphs, [curPage], sectionBreakConfig, paragraphConfig, true);
        const lines = result[0].sections[0].columns[0].lines;
        expect(lines).toHaveLength(1);
        // PowerPoint's 16/24 pt spacing matrix: 20% is based on a normal line, not the selected line spacing.
        const normalHeight = fontSize === 12 ? 19.2 : 28.8;
        expect(lines[0].marginTop).toBeCloseTo(normalHeight * 0.2, 4);
        expect(lines[0].spaceBelowApply).toBeCloseTo(normalHeight * 0.3, 4);
    });

    it.each([DocumentFlavor.DRAWINGML, DocumentFlavor.UNSPECIFIED, DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((documentFlavor) =>
        [undefined, NumberUnitType.POINT, NumberUnitType.PIXEL, NumberUnitType.CHARACTER, NumberUnitType.LINE, NumberUnitType.PERCENT]
            .map((unit) => ({ documentFlavor, unit }))))('retains absolute spacing and non-DrawingML relative spacing ($documentFlavor, $unit)', ({ documentFlavor, unit }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('a', {
            documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const glyph = createGlyph('a', 12);
        glyph.fontStyle!.originFontSize = 12;
        glyph.bBox.ba = 15;
        glyph.bBox.bd = 4;
        const paragraphConfig: IParagraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {
                lineSpacing: 36,
                spacingRule: SpacingRule.EXACT,
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: 4, u: NumberUnitType.POINT },
                spaceBelow: { v: 0.2, u: unit },
            },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        };
        const result = layoutParagraph(ctx, [glyph], [curPage], sectionBreakConfig, paragraphConfig, true);
        const line = result[0].sections[0].columns[0].lines[0];
        let benchmark = 36;
        if (unit == null || unit === NumberUnitType.POINT || unit === NumberUnitType.PIXEL) {
            benchmark = 1;
        } else if (documentFlavor === DocumentFlavor.DRAWINGML && unit !== NumberUnitType.CHARACTER) {
            benchmark = 19.2;
        }
        expect(line.spaceBelowApply).toBeCloseTo(0.2 * benchmark, 4);
        if (documentFlavor === DocumentFlavor.DRAWINGML) {
            expect(line.marginTop).toBe(4);
        }
    });

    it.each([DocumentFlavor.DRAWINGML, DocumentFlavor.UNSPECIFIED, DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]
        .flatMap((documentFlavor) => [[0, 0], [9, 6], [6, 9], [6, 6], [9, 0], [0, 6]]
            .map(([before, after]) => ({ documentFlavor, before, after }))))('resolves adjacent paragraph gaps for $documentFlavor (before=$before, after=$after)', ({ documentFlavor, before, after }) => {
        const { ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('a\rb', {
            body: { paragraphs: [{ startIndex: 1 }, { startIndex: 3 }] },
            documentStyle: { pageSize: { width: 300, height: 300 }, marginTop: 0, marginBottom: 0, paragraphLineGapDefault: 0 },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const config = (index: number): IParagraphConfig => ({
            paragraphIndex: index * 2 + 1,
            paragraphStyle: {
                lineSpacing: 1,
                spacingRule: SpacingRule.AUTO,
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: index === 1 ? before : 0, u: NumberUnitType.POINT },
                spaceBelow: { v: index === 0 ? after : 0, u: NumberUnitType.POINT },
            },
            useWordStyleLineHeight: false,
            skeHeaders: ctx.skeletonResourceReference.skeHeaders,
            skeFooters: ctx.skeletonResourceReference.skeFooters,
        });
        const first = layoutParagraph(ctx, [createGlyph('a', 12)], [curPage], sectionBreakConfig, config(0), true);
        const firstLine = first[0].sections[0].columns[0].lines[0];
        const firstBottom = firstLine.top + firstLine.lineHeight;
        const result = layoutParagraph(ctx, [createGlyph('b', 12)], first, sectionBreakConfig, config(1), true);
        const lines = result[0].sections[0].columns[0].lines;
        expect(lines).toHaveLength(2);
        const gap = lines[1].top + lines[1].marginTop - firstBottom;
        // Native PowerPoint shape/table renders add both; preserve the existing Word-host collapse.
        expect(gap).toBeCloseTo(documentFlavor === DocumentFlavor.DRAWINGML ? before + after : Math.max(before, after), 4);
    });

    it('uses the font normal line height as the base for Word auto spacing', () => {
        const metrics = getLineHeightMetrics(17, 0, 24, GridType.DEFAULT, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true, true, 18.6666666667);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(28, 4);
    });

    it('does not multiply inline custom block height by auto line spacing', () => {
        const metrics = getLineHeightMetrics(624, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(624, 4);
    });

    it('does not collapse an inline custom block to exact text line spacing', () => {
        const metrics = getLineHeightMetrics(624, 0, 15.6, GridType.LINES, 20.8, SpacingRule.EXACT, BooleanNumber.FALSE, true, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(624, 4);
    });

    it('keeps document-grid line pitch behavior when auto line spacing explicitly snaps to the grid', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(23.4, 4);
    });

    it('snaps multiline auto spacing to whole document-grid lines', () => {
        const metrics = getLineHeightMetrics(16, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, true, true, undefined, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(31.2, 4);
    });

    it('occupies enough whole document-grid lines for tall glyphs', () => {
        const metrics = getLineHeightMetrics(28, 0, 20.8, GridType.LINES, 1, SpacingRule.AUTO, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(41.6, 4);
    });

    it('does not apply line pitch for a character-only grid', () => {
        const metrics = getLineHeightMetrics(16, 0, 30, GridType.SNAP_TO_CHARS, 1.5, SpacingRule.AUTO, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(24, 4);
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

    it('does not mistake another continuous-section fragment for a new page', () => {
        const cachedLine: any = { paragraphIndex: 1, top: 0, lineHeight: 20 };
        const cachedColumn: any = { width: 100, left: 0, lines: [cachedLine] };
        const cachedPage: any = {
            pageNumber: 1,
            segmentId: '',
            skeDrawings: new Map([['floating', {}]]),
            sections: [{ top: 20, columns: [cachedColumn] }],
        };
        cachedLine.parent = cachedColumn;
        cachedColumn.parent = { top: 20, parent: cachedPage };
        const page: any = {
            pageNumber: 1,
            segmentId: '',
            sections: [{ columns: [] }],
        };
        const column: any = {
            width: 100,
            left: 0,
            lines: [{ paragraphIndex: 2, top: 0, lineHeight: 20 }],
            parent: { top: 20, parent: page },
        };
        page.sections[0].columns = [column];
        const floatObject: any = {
            id: 'floating',
            top: 20,
            left: 0,
            width: 50,
            height: 50,
            angle: 0,
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH },
        };
        const ctx: any = {
            floatObjectsCache: new Map([['floating', { count: 1, floatObject, page: cachedPage }]]),
            isDirty: false,
            layoutStartPointer: { '': null },
            paragraphsOpenNewPage: new Set(),
        };

        __testing.reLayoutCheck(ctx, [floatObject], column, 9);

        expect(ctx.isDirty).toBe(false);
        expect(ctx.floatObjectsCache.has('floating')).toBe(true);
        expect(ctx.paragraphsOpenNewPage.has(9)).toBe(false);

        page.pageNumber = 2;
        __testing.reLayoutCheck(ctx, [floatObject], column, 9);

        expect(ctx.isDirty).toBe(true);
        expect(ctx.floatObjectsCache.has('floating')).toBe(false);
        expect(ctx.paragraphsOpenNewPage.has(9)).toBe(true);
    });

    it('does not treat the first paragraph of a continuous section as a page break', () => {
        const page: any = { sections: [{}] };
        const section: any = { columns: [], parent: page };
        const column: any = { lines: [], parent: section };
        section.columns.push(column);
        page.sections.push(section);

        expect(__testing.checkPageBreak(column)).toBe(false);

        page.sections = [section];
        expect(__testing.checkPageBreak(column)).toBe(true);
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
            left: 261,
            width: 280,
            height: 80,
        } as any;
        const page = {
            skeDrawings: new Map([['left-wrap', {
                aTop: 40,
                aLeft: 271,
                width: 90,
                height: 220,
                drawingOrigin: {
                    layoutType: PositionedObjectLayoutType.WRAP_TIGHT,
                    distR: 8,
                },
            }]]),
        } as any;
        const column = {
            left: 261,
            width: 420,
        } as any;

        __testing.avoidFlowAffectingDrawingsForTable(table, page, column);

        expect(table.left).toBe(369);
    });

    it('positions a sliced table continuation in its current column', () => {
        const table = {
            tableId: 'table#-#1',
            tableSource: {
                align: TableAlignmentType.START,
                indent: { v: 0 },
                textWrap: TableTextWrapType.NONE,
            },
            top: 0,
            left: 0,
            width: 243,
            height: 114,
        } as any;
        const page = {
            skeDrawings: new Map(),
            skeTables: new Map(),
        } as any;
        const section = {
            top: 40,
            height: 678,
        } as any;
        const column = {
            left: 261,
            width: 243,
        } as any;
        const cache = [{
            table,
            tableId: table.tableId,
            hasPositioned: false,
            isSlideTable: true,
            tableNode: {},
        }] as any;

        __testing.updateAndPositionTable(
            {} as any,
            0,
            14,
            page,
            column,
            section,
            cache,
            0,
            {} as any
        );

        expect(table).toMatchObject({ left: 261, top: 40 });
        expect(page.skeTables.get(table.tableId)).toBe(table);
    });

    it('stores custom block render viewport on inline skeleton drawings', () => {
        setDocsCustomBlockRenderViewportProvider(() => ({
            bleedLeft: 12,
            bleedWidth: 360,
            contentHeight: 120,
            contentWidth: 320,
            height: 80,
            pageContentWidth: 300,
            viewScale: 1.5,
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
        expect(drawing?.customBlockRenderViewport?.pageContentWidth).toBe(300);
        expect(drawing?.customBlockRenderViewport?.viewScale).toBe(1.5);
        expect(drawing?.customBlockRenderViewport?.viewportHeight).toBe(64);
        expect(drawing?.aTop).toBe(30);
    });
});
