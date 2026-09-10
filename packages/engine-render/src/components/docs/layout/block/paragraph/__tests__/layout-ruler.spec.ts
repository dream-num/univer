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
    AlignTypeH,
    BooleanNumber,
    characterSpacingControlType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    DrawingTypeEnum,
    GridType,
    HorizontalAlign,
    ListGlyphType,
    MODERN_DOCUMENT_DEFAULT_MARGIN,
    NumberUnitType,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
    TabStopAlignment,
    WrapTextType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    DocumentSkeletonPageType,
    GlyphType,
    LineType,
} from '../../../../../../basics/i-document-skeleton-cached';
import { setDocsCustomBlockRenderViewportProvider } from '../../../../custom-block-render-viewport';
import { getDocumentCompatibilityPolicy } from '../../../../document-compatibility';
import { DocumentSkeleton } from '../../../doc-skeleton';
import { Lang } from '../../../hyphenation/lang';
import { BreakPointType } from '../../../line-breaker/break';
import { createSkeletonCustomBlockGlyph } from '../../../model/glyph';
import { FontCache } from '../../../shaping-engine/font-cache';
import { clearFontCreateConfigCache, updateBlockIndex, updateInlineDrawingCoordsAndBorder } from '../../../tools';
import { createTableSkeleton } from '../../table';
import { __testing, getLineHeightMetrics, layoutParagraph, updateInlineDrawingPosition } from '../layout-ruler';
import { lineAdjustment } from '../line-adjustment';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';
import issue1207Snapshot from './fixtures/issue-1207-bullet-style.snapshot.json';

describe('layout-ruler', () => {
    beforeEach(() => {
        clearFontCreateConfigCache();
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText(this: CanvasRenderingContext2D, value: string) {
                        const size = this.font.match(/([\d.]+)(px|pt)/);
                        const points = size ? Number(size[1]) * (size[2] === 'px' ? 0.75 : 1) : 11;
                        return {
                            width: value.length * 8 * points / 11,
                            fontBoundingBoxAscent: 10,
                            fontBoundingBoxDescent: 4,
                            actualBoundingBoxAscent: 10,
                            actualBoundingBoxDescent: 4,
                        };
                    },
                }),
            }),
        });
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((documentFlavor) =>
        [false, true].flatMap((incremental) => [BooleanNumber.FALSE, BooleanNumber.TRUE].flatMap((tcHideMark) =>
            [false, true].map((emptyEndMark) => ({ documentFlavor, incremental, tcHideMark, emptyEndMark }))))))('excludes only the final cell mark from row height (flavor: $documentFlavor, incremental: $incremental, hideMark: $tcHideMark, empty: $emptyEndMark)', ({ documentFlavor, incremental, tcHideMark, emptyEndMark }) => {
        const T = DataStreamTreeTokenType;
        const cellContent = emptyEndMark ? 'Cell\r\r\r' : 'Cell\r';
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${cellContent}\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${tableStream}\rAfter\r\n`;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].filter((match) => match.index !== tableStream.length).map((match, index) => ({ paragraphId: `p-${index}`, startIndex: match.index })),
                sectionBreaks: [{ sectionId: 'cell', startIndex: dataStream.indexOf('\n') }, { sectionId: 'body', startIndex: dataStream.length - 1 }],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: tableStream.length }],
            },
            tableSource: { table: {
                tableId: 'table',
                align: 0,
                indent: { v: 0 },
                textWrap: 0,
                size: { type: 0, width: { v: 200 } },
                cellMargin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } },
                tableRows: [{ tableCells: [{ tcHideMark }], trHeight: { val: { v: 0 }, hRule: 0 } }],
                tableColumns: [{ size: { type: 0, width: { v: 200 } } }],
            } },
        });
        const snapshot = JSON.stringify(bed.dataModel.getSnapshot());
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let step = 0; step < 50 && !progress.complete; step++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress.complete).toBe(true);
            } else {
                skeleton.calculate();
            }
            const table = skeleton.getSkeletonData()!.pages[0].skeTables.get('table')!;
            const cell = table.rows[0].cells[0];
            const lines = cell.sections.flatMap((section) => section.columns.flatMap((column) => column.lines));
            expect(lines).toHaveLength(emptyEndMark ? 3 : 1);
            expect(lines[0].lineHeight).toBeGreaterThan(0);
            const hidden = documentFlavor === DocumentFlavor.TRADITIONAL && tcHideMark === BooleanNumber.TRUE;
            const lastLine = lines[lines.length - 1];
            const endMark = lastLine.divides.flatMap((divide) => divide.glyphGroup).find((glyph) => glyph.streamType === T.PARAGRAPH)!;
            if (hidden) {
                expect(endMark.bBox.ba + endMark.bBox.bd).toBe(0);
            }
            if (emptyEndMark) {
                expect(lines[1].lineHeight).toBeGreaterThan(0);
                if (hidden) {
                    expect(lastLine.lineHeight).toBe(0);
                } else {
                    expect(lastLine.lineHeight).toBeGreaterThan(0);
                }
            }
            expect(table.rows[0].height).toBeCloseTo(lines.reduce((height, line) => height + line.lineHeight, 0));
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(snapshot);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((documentFlavor) =>
        [false, true].map((incremental) => ({ documentFlavor, incremental }))))('preserves table terminators without adding traditional blank lines (flavor: $documentFlavor, incremental: $incremental)', ({ documentFlavor, incremental }) => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${tableStream}\r\rAfter\r\n`;
        const anchorIndex = tableStream.length;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].filter((match) => match.index !== anchorIndex).map((match, index) => ({ paragraphId: `p-${index}`, startIndex: match.index })),
                sectionBreaks: [{ sectionId: 'cell', startIndex: dataStream.indexOf('\n') }, { sectionId: 'body', startIndex: dataStream.length - 1 }],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: anchorIndex }],
            },
            tableSource: { table: {
                tableId: 'table',
                align: 0,
                indent: { v: 0 },
                textWrap: 0,
                size: { type: 0, width: { v: 200 } },
                tableRows: [{ tableCells: [{ size: { type: 0, width: { v: 200 } } }], trHeight: { val: { v: 0 }, hRule: 0 } }],
                tableColumns: [{ size: { type: 0, width: { v: 200 } } }],
            } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            if (incremental) {
                const generation = skeleton.startIncrementalLayout();
                let progress = skeleton.stepIncrementalLayout(generation, 0);
                for (let step = 0; step < 20 && !progress.complete; step++) {
                    progress = skeleton.stepIncrementalLayout(generation, 0);
                }
                expect(progress.complete).toBe(true);
            } else {
                skeleton.calculate();
            }
            const page = skeleton.getSkeletonData()!.pages[0];
            const table = page.skeTables.get('table')!;
            const lines = page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines));
            const anchor = lines.find((line) => line.paragraphIndex === anchorIndex)!;
            const emptyParagraph = lines.find((line) => line.paragraphIndex === anchorIndex + 1)!;
            if (documentFlavor === DocumentFlavor.TRADITIONAL) {
                expect(anchor.lineHeight).toBe(0);
            } else {
                expect(anchor.lineHeight).toBeGreaterThan(0);
            }
            expect(emptyParagraph.lineHeight).toBeGreaterThan(0);
            expect(emptyParagraph.top).toBeCloseTo(table.top + table.height + anchor.lineHeight);
            expect(bed.dataModel.getBody()?.dataStream).toBe(dataStream);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([
        { relativeFrom: ObjectRelativeFromH.MARGIN, align: AlignTypeH.CENTER, expectedLeft: 10 },
        { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 60, expectedLeft: 20 },
        { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 20, expectedLeft: 20 },
    ])('positions floating tables in body coordinates for anchor $relativeFrom', ({ expectedLeft, ...positionH }) => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${tableStream}\rAfter\r\n`;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, marginLeft: 40, marginRight: 20 },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ paragraphId: `p-${index}`, startIndex: match.index })),
                sectionBreaks: [{ sectionId: 'cell', startIndex: dataStream.indexOf('\n') }, { sectionId: 'body', startIndex: dataStream.length - 1 }],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: tableStream.length }],
            },
            tableSource: { table: {
                tableId: 'table',
                align: 0,
                indent: { v: 0 },
                textWrap: TableTextWrapType.WRAP,
                dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                position: { positionH, positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 10 } },
                size: { type: 0, width: { v: 320 } },
                tableRows: [{ tableCells: [{ size: { type: 0, width: { v: 320 } } }], trHeight: { val: { v: 0 }, hRule: 0 } }],
                tableColumns: [{ size: { type: 0, width: { v: 320 } } }],
            } },
        });
        try {
            const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
            skeleton.calculate();
            const tables = skeleton.getSkeletonData()!.pages.flatMap((page) => [...page.skeTables.values()]);
            expect(tables).toHaveLength(1);
            const table = tables[0];
            expect(table.left).toBeCloseTo(expectedLeft);
            expect(table.top).toBeCloseTo(10);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('keeps words intact below floating tables while retaining usable side wraps', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell\r\n${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${tableStream}\rEn las Quintas columnas\r\n`;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ paragraphId: `p-${index}`, startIndex: match.index })),
                sectionBreaks: [{ sectionId: 'cell', startIndex: dataStream.indexOf('\n') }, { sectionId: 'body', startIndex: dataStream.length - 1 }],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: tableStream.length }],
            },
            tableSource: { table: {
                tableId: 'table',
                align: 0,
                indent: { v: 0 },
                textWrap: TableTextWrapType.WRAP,
                dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                position: {
                    positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 30 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                },
                size: { type: 0, width: { v: 300 } },
                tableRows: [{ tableCells: [{ size: { type: 0, width: { v: 300 } } }], trHeight: { val: { v: 120 }, hRule: 0 } }],
                tableColumns: [{ size: { type: 0, width: { v: 300 } } }],
            } },
        });
        try {
            const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
            skeleton.calculate();
            const page = skeleton.getSkeletonData()!.pages[0];
            const table = [...page.skeTables.values()][0];
            const lines = page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines));
            const text = (line: typeof lines[number]) => line.divides.map((divide) => divide.glyphGroup.map((glyph) => glyph.content).join('')).join('');
            expect(lines.map(text).join('')).toContain('En las Quintas columnas');
            expect(lines.find((line) => text(line).includes('En'))!.top).toBeLessThan(table.top + table.height);
            expect(lines.find((line) => text(line).includes('Quintas'))!.top).toBeGreaterThanOrEqual(table.top + table.height);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
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

    it.each([' ', '\t', '\u3000', '\u00A0', 'X'])('uses visible content and the paragraph mark for whitespace line height (%j)', (content) => {
        for (const documentFlavor of [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]) {
            const heights = [false, true].map((large) => {
                const { ctx, paragraphNode, sectionBreakConfig, curPage, viewModel, dataModel } = createParagraphLayoutTestBed(content, {
                    documentStyle: { documentFlavor },
                    body: {
                        paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }],
                    },
                });
                const snapshot = JSON.stringify(dataModel.getSnapshot());
                const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
                for (const part of shaped) {
                    for (const glyph of part.glyphs) {
                        if (large && glyph.content === content) {
                            // Canvas is mocked; supply the measured metrics of a larger run.
                            glyph.bBox.ba = 40;
                            glyph.bBox.bd = 10;
                            glyph.bBox.normalLineHeight = 60;
                        }
                    }
                }
                const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
                const lines = pages[0].sections[0].columns[0].lines;
                expect(JSON.stringify(dataModel.getSnapshot())).toBe(snapshot);
                return lines.reduce((height, line) => height + line.lineHeight, 0);
            });
            expect(heights[0]).toBeGreaterThan(0);
            if (documentFlavor === DocumentFlavor.TRADITIONAL && content !== '\u00A0' && content !== 'X') {
                expect(heights[1]).toBeCloseTo(heights[0]);
            } else {
                expect(heights[1]).toBeGreaterThan(heights[0]);
            }
        }
    });

    it.each(['paragraph', 'text', 'text-and-paragraph'].flatMap((kind) =>
        [SpacingRule.AUTO, SpacingRule.AT_LEAST].map((spacingRule) => ({ kind, spacingRule }))))('keeps paragraph-mark tolerance separate from visible-run normal leading ($kind, $spacingRule)', ({ kind, spacingRule }) => {
        const visibleRun = kind === 'text';
        const { ctx, curPage, sectionBreakConfig } = createParagraphLayoutTestBed('AB', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const first = createGlyph('A', 8);
        first.bBox = { ...first.bBox, ba: 15, bd: 3, normalLineHeight: 18.005 };
        const incoming = createGlyph(visibleRun ? 'B' : '\r', visibleRun ? 8 : 0);
        incoming.streamType = visibleRun ? DataStreamTreeTokenType.LETTER : DataStreamTreeTokenType.PARAGRAPH;
        incoming.bBox = { ...incoming.bBox, ba: 16.5, bd: 3, normalLineHeight: 19.505 };
        const config = {
            paragraphIndex: 2,
            paragraphStyle: { snapToGrid: BooleanNumber.FALSE, spacingRule, lineSpacing: spacingRule === SpacingRule.AUTO ? 1 : 17 },
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            useWordStyleLineHeight: true,
        } as IParagraphConfig;
        const pages = layoutParagraph(ctx, [first], [curPage], sectionBreakConfig, config, true);
        const incomingGlyphs = kind === 'text-and-paragraph' ? [{ ...first, raw: 'B', content: 'B' }, incoming] : [incoming];
        layoutParagraph(ctx, incomingGlyphs, pages, sectionBreakConfig, config, false);
        let expectedHeight = 18;
        if (spacingRule === SpacingRule.AUTO) {
            expectedHeight = visibleRun ? 19.505 : 18.005;
        }
        expect(pages[0].sections[0].columns[0].lines[0].lineHeight).toBeCloseTo(expectedHeight);
    });

    it.each([BooleanNumber.FALSE, BooleanNumber.TRUE])('preserves mixed-font reflow metrics after a zero-height page hint (grid: %s)', (snapToGrid) => {
        const { ctx, curPage, sectionBreakConfig } = createParagraphLayoutTestBed('3.3外', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        sectionBreakConfig.gridType = GridType.LINES;
        sectionBreakConfig.linePitch = 20.8;
        const hint = createGlyph('', 0);
        hint.raw = DataStreamTreeTokenType.PAGE_BREAK;
        hint.streamType = DataStreamTreeTokenType.PAGE_BREAK;
        hint.bBox = { ...hint.bBox, ba: 0, bd: 0, aba: 0, abd: 0 };
        const latin = [...'3.3'].map((content) => {
            const glyph = createGlyph(content, 11);
            glyph.bBox = { ...glyph.bBox, ba: 18, bd: 4, normalLineHeight: 23 };
            return glyph;
        });
        const cjk = createGlyph('外', 20);
        cjk.bBox = { ...cjk.bBox, ba: 21, bd: 5, normalLineHeight: 26 };
        const config = {
            paragraphIndex: 4,
            paragraphStyle: { snapToGrid, spacingRule: SpacingRule.AUTO, lineSpacing: 1 },
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            useWordStyleLineHeight: true,
        } as IParagraphConfig;
        const pages = layoutParagraph(ctx, [hint], [curPage], sectionBreakConfig, config, true);
        layoutParagraph(ctx, latin, pages, sectionBreakConfig, config, false);
        layoutParagraph(ctx, [cjk], pages, sectionBreakConfig, config, false);
        const lines = pages[0].sections[0].columns[0].lines;
        expect(pages).toHaveLength(1);
        expect(lines).toHaveLength(1);
        expect(lines[0].divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.content).join('')).toBe('3.3外');
        expect(lines[0].contentHeight).toBeCloseTo(26);
        expect(lines[0].lineHeight).toBeCloseTo(snapToGrid === BooleanNumber.TRUE ? 41.6 : 26);
    });

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
        { documentFlavor: DocumentFlavor.TRADITIONAL, expectedWidth: 29 + 1 / 3 },
        { documentFlavor: DocumentFlavor.MODERN, expectedWidth: 112 },
        { documentFlavor: undefined, expectedWidth: 112 },
    ])('uses authored list hanging instead of default tabs only in traditional documents ($documentFlavor)', ({ documentFlavor, expectedWidth }) => {
        const content = 'Investment summary text. '.repeat(8);
        const hanging = 29 + 1 / 3;
        const indentStart = 33 + 8 / 15;
        const { ctx, paragraphNode, sectionBreakConfig, curPage, viewModel } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor, defaultTabStop: 56 },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'imported-list-paragraph',
                    bullet: { listId: 'imported-list', listType: 'imported-list', nestingLevel: 0 },
                }],
            },
            lists: {
                'imported-list': {
                    listType: 'imported-list',
                    nestingLevel: [{
                        paragraphProperties: { hanging: { v: hanging }, indentStart: { v: indentStart } },
                        glyphSymbol: '\u25CF',
                        glyphType: 0,
                        textStyle: { ff: 'Arial', fs: 9 },
                    }],
                },
            },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages[0].sections[0].columns[0].lines;
        const firstDivide = lines[0].divides[0];

        expect(firstDivide.glyphGroup[0].glyphType).toBe(GlyphType.LIST);
        expect(firstDivide.glyphGroup[0].width).toBeCloseTo(expectedWidth);
        expect(firstDivide.left + firstDivide.paddingLeft + firstDivide.glyphGroup[1].left)
            .toBeCloseTo(indentStart - hanging + expectedWidth);
        expect(lines.length).toBeGreaterThan(1);
        expect(lines[1].divides[0].left + lines[1].divides[0].paddingLeft).toBeCloseTo(indentStart);
    });

    it.each([13 + 2 / 3, 200])('keeps an empty list paragraph on one line in a %spx content box', (width) => {
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width, height: 600 },
                marginLeft: 0,
                marginRight: 0,
                defaultTabStop: 48,
                textStyle: { ff: 'Arial', fs: 8 },
            },
            body: {
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: 'empty-list-paragraph',
                    bullet: { listId: 'empty-list', listType: 'empty-list', nestingLevel: 0 },
                }],
            },
            lists: {
                'empty-list': {
                    listType: 'empty-list',
                    nestingLevel: [{
                        paragraphProperties: { hanging: { v: 0 }, indentStart: { v: 0 } },
                        glyphSymbol: '1.',
                        glyphType: 0,
                        textStyle: { ff: 'Arial', fs: 8 },
                    }],
                },
            },
        });
        try {
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = bed;
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const lines = pages[0].sections[0].columns[0].lines;

            expect(lines).toHaveLength(1);
            const glyphs = lines[0].divides.flatMap((divide) => divide.glyphGroup);
            expect(glyphs[0].glyphType).toBe(GlyphType.LIST);
            expect(glyphs.some((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH)).toBe(true);
            expect(glyphs.reduce((count, glyph) => count + glyph.count, 0)).toBe(paragraphNode.content!.length);
            expect(bed.dataModel.getBody()!.dataStream).toBe('\r\n');
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
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
                ts: { ff: 'Arial', fs: 11 },
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

    it.each([
        { prefix: 'A', indent: 0, defaultTabStop: 48, expected: 48 },
        { prefix: 'AAAAAA', indent: 0, defaultTabStop: 48, expected: 96 },
        { prefix: 'A', indent: 15, defaultTabStop: 48, expected: 48 },
        { prefix: 'A', indent: 0, defaultTabStop: 36, expected: 36 },
        { prefix: '', indent: 0, defaultTabStop: 48, expected: 48 },
    ])('advances default tabs to the next stop instead of inserting a fixed gap: %j', ({ prefix, indent, defaultTabStop, expected }) => {
        for (const documentFlavor of [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]) {
            const content = `${prefix}\tB\tC`;
            const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                body: {
                    paragraphs: [{ startIndex: content.length, paragraphId: 'tabs', paragraphStyle: {
                        indentStart: { v: indent },
                        tabStops: prefix ? [{ offset: 4, alignment: 0 }] : [],
                    } }],
                },
                documentStyle: { documentFlavor, defaultTabStop },
            });
            const sourceBefore = JSON.stringify(dataModel.getSnapshot());
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const line = curPage.sections[0].columns[0].lines[0];
            const divide = line.divides[0];
            const glyphs = divide.glyphGroup;
            const b = glyphs.find((glyph) => glyph.content === 'B')!;
            const c = glyphs.find((glyph) => glyph.content === 'C')!;
            if (documentFlavor === DocumentFlavor.TRADITIONAL) {
                expect(divide.left + divide.paddingLeft + b.left).toBeCloseTo(expected);
                expect(c.left - b.left).toBeCloseTo(defaultTabStop);
            } else {
                expect(c.left - b.left).toBeCloseTo(b.width + defaultTabStop);
            }
            expect(JSON.stringify(dataModel.getSnapshot())).toBe(sourceBefore);
        }
    });

    it.each([
        { indent: 20.4, hanging: 20.4, stop: undefined, noTabHangInd: undefined, expected: 20.4 },
        { indent: 30.4, hanging: 20.4, stop: undefined, noTabHangInd: BooleanNumber.FALSE, expected: 30.4 },
        { indent: 80, hanging: 80, stop: undefined, noTabHangInd: undefined, expected: 80 },
        { indent: 20.4, hanging: 20.4, stop: 16, noTabHangInd: undefined, expected: 16 },
        { indent: 20.4, hanging: 20.4, stop: 100, noTabHangInd: undefined, expected: 20.4 },
        { indent: 20.4, hanging: 20.4, stop: undefined, noTabHangInd: BooleanNumber.TRUE, expected: 48 },
        { indent: 20.4, hanging: 20.4, stop: undefined, noTabHangInd: undefined, expected: 20.4, width: 30 },
    ])('uses the hanging indent as an implicit tab stop: %j', ({ indent, hanging, stop, noTabHangInd, expected, width = 400 }) => {
        const content = 'A\tB';
        const bed = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                defaultTabStop: 48,
                compatibilityFlags: noTabHangInd == null ? {} : { noTabHangInd },
                pageSize: { width, height: 600 },
                marginLeft: 0,
                marginRight: 0,
            },
            body: { paragraphs: [{ startIndex: content.length, paragraphId: 'hanging-tabs', paragraphStyle: {
                indentStart: { v: indent },
                hanging: { v: hanging },
                tabStops: stop == null ? [] : [{ offset: stop, alignment: TabStopAlignment.START }],
            } }] },
        });
        try {
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = bed;
            const before = JSON.stringify(bed.dataModel.getSnapshot());
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const lines = pages[0].sections[0].columns[0].lines;
            expect(lines).toHaveLength(1);
            const divide = lines[0].divides[0];
            const b = divide.glyphGroup.find((glyph) => glyph.content === 'B')!;
            expect(divide.left + divide.paddingLeft + b.left).toBeCloseTo(expected);
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(before);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('uses the default grid when the only inherited tab stop was cleared', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('A\tB', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultTabStop: 48 },
            body: { paragraphs: [{ startIndex: 3, paragraphStyle: {
                tabStops: [{ offset: 200, alignment: TabStopAlignment.START, clear: true }],
            } }] },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const glyphs = pages[0].sections[0].columns[0].lines[0].divides[0].glyphGroup;
        expect(glyphs.find((glyph) => glyph.content === 'B')?.left).toBeCloseTo(48);
    });

    it('aligns following text to an explicit end tab stop', () => {
        const tab = createGlyph(DataStreamTreeTokenType.TAB, 36);
        tab.glyphType = GlyphType.TAB;
        tab.left = 100;
        tab.width = 464;
        tab.bBox.width = 464;
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

    it('realigns an end tab when a zero-width field marker separates it from a page number', () => {
        const tab = createGlyph(DataStreamTreeTokenType.TAB, 36);
        tab.glyphType = GlyphType.TAB;
        tab.left = 100;
        tab.width = 464;
        tab.bBox.width = 464;
        const fieldStart = createGlyph(DataStreamTreeTokenType.CUSTOM_RANGE_START, 0);
        fieldStart.left = 564;
        const divide = { glyphGroup: [tab, fieldStart], width: 580 } as IDocumentSkeletonDivide;
        const paragraphConfig = {
            paragraphStyle: {
                tabStops: [{ offset: 560, alignment: 3, leader: 2 }],
            },
        } as IParagraphConfig;

        __testing.adjustExplicitTabStop(divide, [createGlyph('12', 16)], paragraphConfig);

        expect(tab.width).toBe(444);
        expect(fieldStart.left).toBe(544);
        expect(tab.tabLeader).toBe(2);
    });

    it.each([
        ['margin', 3, 460],
        ['indent', 3, 420],
        ['margin', 2, 190],
        ['indent', 2, 180],
    ] as const)('aligns a positioned tab relative to %s with alignment %s', (relativeTo, alignment, expectedWidth) => {
        const tab = createGlyph(DataStreamTreeTokenType.TAB, 36);
        tab.glyphType = GlyphType.TAB;
        tab.left = 20;
        tab.ts = { positionedTab: { alignment, relativeTo } };
        tab.tabAlignedTextWidth = 60;
        const divide = {
            glyphGroup: [tab],
            width: 500,
            left: 0,
            paddingLeft: 60,
            parent: { parent: { width: 600 }, paragraphPaddingLeft: 20, paragraphPaddingRight: 40 },
        } as IDocumentSkeletonDivide;
        __testing.adjustExplicitTabStop(divide, [createGlyph('First', 10)], {} as IParagraphConfig);
        expect(tab.width).toBe(expectedWidth);
    });

    it.each([false, true])('measures every word after a tab up to the next tab (positioned: %s)', (positioned) => {
        const { ctx, paragraphNode, viewModel, sectionBreakConfig } = createParagraphLayoutTestBed('\tone two\tlast', {
            body: { textRuns: [{ st: 0, ed: 1, ts: positioned ? { positionedTab: { alignment: 3, relativeTo: 'margin' } } : {} }] },
        });
        const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig).flatMap((text) => text.glyphs);
        const firstTab = glyphs[0];
        const nextTab = glyphs.findIndex((glyph, index) => index > 0 && glyph.glyphType === GlyphType.TAB);
        expect(firstTab.tabAlignedTextWidth).toBeGreaterThan(0);
        expect(firstTab.tabAlignedTextWidth).toBe(glyphs.slice(1, nextTab).reduce((width, glyph) => width + glyph.width, 0));
    });

    it.each([TabStopAlignment.CENTER, TabStopAlignment.END])('aligns a complete multiword page field at an explicit tab (%s)', (alignment) => {
        const content = 'Version: 2.0\tPagina \u001F35\u001E van 36';
        const offset = alignment === TabStopAlignment.CENTER ? 240 : 360;
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                paragraphs: [{ startIndex: content.length, paragraphStyle: { tabStops: [
                    { offset: 120, alignment: TabStopAlignment.START, clear: true },
                    { offset, alignment },
                ] } }],
            },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines).toHaveLength(1);
        const glyphs = lines[0].divides[0].glyphGroup;
        const tabIndex = glyphs.findIndex((glyph) => glyph.glyphType === GlyphType.TAB);
        const text = glyphs.slice(tabIndex + 1).filter((glyph) => glyph.width > 0 && glyph.content !== '\r');
        expect(text.map((glyph) => glyph.content).join('')).toBe('Pagina 35 van 36');
        const start = text[0].left;
        const end = text[text.length - 1].left + text[text.length - 1].width;
        expect(alignment === TabStopAlignment.END ? end : (start + end) / 2).toBeCloseTo(offset);
    });

    it('keeps the entire positioned end-tab field on an indented line', () => {
        const bed = createParagraphLayoutTestBed('\t行业点评', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                textRuns: [{ st: 0, ed: 1, ts: { positionedTab: { alignment: 3, relativeTo: 'margin' } } }],
                paragraphs: [{ startIndex: 5, paragraphStyle: { indentFirstLine: { v: 157.92 }, snapToGrid: 0 } }],
            },
        });
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = bed;
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines).toHaveLength(1);
        const divide = lines[0].divides[0];
        const text = divide.glyphGroup.filter((glyph) => glyph.content && glyph.content !== '\t' && glyph.content !== '\r');
        expect(divide.glyphGroup.find((glyph) => glyph.glyphType === GlyphType.TAB)?.ts?.positionedTab).toEqual({ alignment: 3, relativeTo: 'margin' });
        expect(text.map((glyph) => glyph.content).join('')).toBe('行业点评');
        const lastGlyph = text[text.length - 1];
        expect(divide.left + divide.paddingLeft + lastGlyph.left + lastGlyph.width).toBeCloseTo(lines[0].parent!.width);
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('wraps fitting URLs as words only in traditional layout (%s)', (documentFlavor) => {
        const prefix = '说明文字'.repeat(4);
        const url = 'http://www.example.com';
        const content = `${prefix}${url}网站`;
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor, pageSize: { width: 280, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)))
            .map((line) => line.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.content).join(''));
        expect(lines.join('')).toBe(content);
        if (documentFlavor === DocumentFlavor.TRADITIONAL) {
            expect(lines[0]).toBe(prefix);
            expect(lines[1]).toContain(url);
        } else {
            expect(lines[0].length).toBeGreaterThan(prefix.length);
        }
    });

    it('splits a URL wider than an empty traditional line without losing glyphs', () => {
        const content = `http://www.${'a'.repeat(60)}.com网站`;
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines.length).toBeGreaterThan(2);
        expect(lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)).map((glyph) => glyph.content).join('')).toBe(content);
        for (const line of lines) {
            for (const divide of line.divides) {
                expect(divide.glyphGroup.reduce((width, glyph) => width + glyph.width, 0)).toBeLessThanOrEqual(divide.width);
            }
        }
    });

    it.each([
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, fits: true },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: characterSpacingControlType.doNotCompress, fits: false },
        { documentFlavor: DocumentFlavor.MODERN, compression: undefined, fits: false },
    ])('uses remaining punctuation compression at a native report Western-space-to-Han boundary ($documentFlavor/$compression)', ({ documentFlavor, compression, fits }) => {
        const prefix = '年“煤改电”项目的推进下公司凭借完整的热泵专用压缩机系列提升了市场知名度。2018 ';
        const content = `${prefix}年下半年开始`;
        const measure = vi.spyOn(FontCache, 'getTextSize').mockImplementation((text) => {
            let width = 13.333333333333334;
            if (text === ' ') {
                width = 3.7034912109375;
            } else if (/^\d$/.test(text)) {
                width = 7.413497924804688;
            }
            return { width, ba: 14, bd: 3, aba: 11, abd: 1, sp: 0, sbr: 0, sbo: 0, spr: 0, spo: 0 };
        });
        try {
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                documentStyle: {
                    documentFlavor,
                    characterSpacingControl: compression,
                    textStyle: { ff: 'Arial', eastAsiaFontFamily: '微软雅黑', fs: 10 },
                    pageSize: { width: 564.8, height: 600 },
                },
                body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.BOTH } }] },
            });
            const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            const firstLine = lines[0].divides[0].glyphGroup.map((glyph) => glyph.content).join('');
            if (fits) {
                expect(firstLine).toBe(`${prefix}年`);
            } else {
                expect(firstLine.length).toBeLessThanOrEqual(prefix.length);
            }
            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
            expect(lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)).map((glyph) => glyph.content).join('')).toBe(content);
            if (fits) {
                expect(lines[0].divides[0].glyphGroupWidth).toBeCloseTo(524.8);
            }
            expect(lines[0].divides[0].glyphGroupWidth).toBeLessThanOrEqual(lines[0].divides[0].width + 1e-8);
        } finally {
            measure.mockRestore();
        }
    });

    it('does not pull an extra Han character onto a traditional line by pre-compressing a punctuation pair', () => {
        const content = '甲），乙丙丁戊己庚辛';
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 90, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.BOTH } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines[0].divides[0].glyphGroup.map((glyph) => glyph.content).join('')).toBe('甲），乙丙丁');
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        const divide = lines[0].divides[0];
        const lastGlyph = divide.glyphGroup[divide.glyphGroup.length - 1];
        expect(lastGlyph.left + lastGlyph.width).toBeCloseTo(divide.width);
    });

    it.each([undefined, characterSpacingControlType.doNotCompress])('matches the 9pt left-aligned report line without shrinking Han advances: %s', (compression) => {
        // Native report line: 57 full-width glyphs in 509.4pt, with two punctuation
        // advances reduced from 9pt to 7.2pt. The following Han glyph starts a new line.
        const firstLine = `${'甲'.repeat(35)}，${'乙'.repeat(13)}、${'丙'.repeat(7)}`;
        const content = `${firstLine}丁戊己`;
        const measure = vi.spyOn(FontCache, 'getTextSize').mockReturnValue({
            width: 12,
            ba: 10,
            bd: 4,
            aba: 10,
            abd: 4,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        });
        try {
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                    characterSpacingControl: compression,
                    textStyle: { ff: 'Arial', fs: 9 },
                    pageSize: { width: 679.2 + 40, height: 600 },
                },
                body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.LEFT } }] },
            });
            const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            const divide = lines[0].divides[0];
            expect(divide.glyphGroup.map((glyph) => glyph.content).join(''))
                .toBe(compression === undefined ? firstLine : firstLine.slice(0, -1));
            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
            for (const glyph of divide.glyphGroup) {
                const punctuation = glyph.content === '，' || glyph.content === '、';
                expect(glyph.width).toBeCloseTo(punctuation && compression === undefined ? 9.6 : 12);
            }
        } finally {
            measure.mockRestore();
        }
    });

    it.each([
        [undefined, false],
        [0, true],
        [-1, false],
        [Number.NaN, false],
    ] as const)('honors explicit line-wrap tolerance without changing legacy defaults (%s)', (tolerance, overflow) => {
        const glyph = createGlyph('外', 10);
        // The extra CJK character fits within the legacy 3px allowance, but not within the box.
        expect(__testing.isGlyphGroupBeyondDivideWidth([glyph], 840, 847.428, false, undefined, false, tolerance)).toBe(overflow);
        expect(__testing.isGlyphGroupBeyondDivideWidth([glyph], 837.428, 847.428, false, undefined, false, tolerance)).toBe(false);
    });

    it('uses trailing CJK punctuation shrinkability when deciding line overflow', () => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph('，', 10);
        punctuation.adjustability.shrinkability = [0, 5];

        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(false);
        punctuation.adjustability.shrinkability = [0, 0];
        expect(__testing.isGlyphGroupBeyondDivideWidth([text, punctuation], 85, 100)).toBe(true);
    });

    it.each([
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.JUSTIFIED, suffix: '2021年末', firstLine: '甲，乙，丙，2021' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: characterSpacingControlType.doNotCompress, horizontalAlign: HorizontalAlign.JUSTIFIED, suffix: '2021年末', firstLine: '甲，乙，丙，' },
        { documentFlavor: DocumentFlavor.MODERN, compression: undefined, horizontalAlign: HorizontalAlign.JUSTIFIED, suffix: '2021年末', firstLine: '甲，乙，丙，' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.LEFT, suffix: '2021年末', firstLine: '甲，乙，丙，2021' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: characterSpacingControlType.doNotCompress, horizontalAlign: HorizontalAlign.LEFT, suffix: '2021年末', firstLine: '甲，乙，丙，' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.JUSTIFIED, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.BOTH, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.BOTH, suffix: '丁，文字排版正常', firstLine: '甲，乙，丙，丁，文' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.DISTRIBUTED, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排' },
        { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined, horizontalAlign: HorizontalAlign.LEFT, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排' },
    ])('respects traditional character compression independently of justification: $documentFlavor/$compression/$horizontalAlign/$suffix', ({ documentFlavor, compression, horizontalAlign, suffix, firstLine }) => {
        const content = `甲，乙，丙，${suffix}`;
        const margin = documentFlavor === DocumentFlavor.MODERN ? MODERN_DOCUMENT_DEFAULT_MARGIN : 20;
        const { ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor, characterSpacingControl: compression, pageSize: { width: 72 + margin * 2, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        const firstDivide = lines[0].divides[0];
        expect(firstDivide.glyphGroup.map((glyph) => glyph.content).join(''))
            .toBe(firstLine);
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        const glyphs = firstDivide.glyphGroup;
        for (let i = 1; i < glyphs.length; i++) {
            expect(glyphs[i].left).toBeCloseTo(glyphs[i - 1].left + glyphs[i - 1].width);
        }
        if (firstLine !== '甲，乙，丙，') {
            const lastGlyph = glyphs[glyphs.length - 1];
            expect(lastGlyph.left + lastGlyph.width).toBeLessThanOrEqual(firstDivide.width + 1e-8);
        }
    });

    it.each([HorizontalAlign.JUSTIFIED, HorizontalAlign.BOTH])('justifies Western word spaces even when East Asian punctuation compression is disabled (%s)', (horizontalAlign) => {
        const content = 'aa bb cc dd';
        const { ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                characterSpacingControl: characterSpacingControlType.doNotCompress,
                pageSize: { width: 108, height: 600 },
                textStyle: { fs: 11 },
            },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { horizontalAlign } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines[0].divides[0].glyphGroup.map((glyph) => glyph.content).join('').trimEnd()).toBe('aa bb cc');
        expect(lines[0].divides[0].glyphGroupWidth).toBeCloseTo(68);
    });

    it.each([undefined, HorizontalAlign.LEFT].flatMap((horizontalAlign) => [41, 62].map((width) => ({ horizontalAlign, width }))))('does not squeeze Western word spaces to fit an extra word in a left-aligned line ($horizontalAlign/$width)', ({ horizontalAlign, width }) => {
        const content = 'aa bb cc';
        const { ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: width + 40, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { horizontalAlign } }] },
        });
        const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines).toHaveLength(2);
        expect(lines[0].divides[0].glyphGroup.map((glyph) => glyph.content).join('')).toBe('aa bb ');
        const spaces = lines[0].divides[0].glyphGroup.filter((glyph) => glyph.content === ' ');
        for (const space of spaces) {
            expect(space.width).toBeCloseTo(space.bBox.width);
        }
    });

    it.each([
        { width: 74, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排' },
        { width: 77, suffix: '文字排版正常', firstLine: '甲，乙，丙，文字排版' },
        { width: 59, suffix: '21。后续', firstLine: '甲，乙，丙，21。' },
        { width: 89, suffix: '丁，戊2021年末', firstLine: '甲，乙，丙，丁，戊2021' },
        { width: 88, suffix: '丁，戊2021年末', firstLine: '甲，乙，丙，丁，戊' },
    ])('chooses the closer legal CJK break after line-end punctuation adjustment ($width/$suffix)', ({ width, suffix, firstLine }) => {
        const content = `甲，乙，丙，${suffix}`;
        const { ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: width + 40, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.BOTH } }] },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        const divide = lines[0].divides[0];
        expect(divide.glyphGroup.map((glyph) => glyph.content).join('')).toBe(firstLine);
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        expect(divide.glyphGroupWidth).toBeCloseTo(width, 5);
        expect(lines.flatMap((line) => line.divides.flatMap((part) => part.glyphGroup)).map((glyph) => glyph.content).join(''))
            .toBe(`${content}\r`);
        viewModel.dispose();
    });

    it.each([
        { offsetLeft: 485, wordWidth: 40, punctuationShrink: 24.2, overflows: false },
        { offsetLeft: 485, wordWidth: 40, punctuationShrink: 23, overflows: true },
        { offsetLeft: 505, wordWidth: 10, punctuationShrink: 20, overflows: true },
    ])('limits Western-word compression to a fitting preceding line and pixel rounding ($offsetLeft/$punctuationShrink)', ({ offsetLeft, wordWidth, punctuationShrink, overflows }) => {
        const punctuation = createGlyph('，', 60);
        punctuation.adjustability.shrinkability = [0, punctuationShrink];
        expect(__testing.isGlyphGroupBeyondDivideWidth(
            [createGlyph('2024', wordWidth)],
            offsetLeft,
            500,
            false,
            [createGlyph('文', offsetLeft - 60), punctuation]
        )).toBe(overflows);
    });

    it.each([
        { preceding: '8', space: ' ', incoming: '年', punctuationShrink: 20, overflows: false },
        { preceding: 'A', space: ' ', incoming: '中', punctuationShrink: 20, overflows: false },
        { preceding: '8', space: ' ', incoming: '年', punctuationShrink: 10, overflows: true },
        { preceding: '字', space: ' ', incoming: '年', punctuationShrink: 20, overflows: true },
        { preceding: '8', space: ' ', incoming: 'A', punctuationShrink: 20, overflows: true },
        { preceding: '8', space: '\u00A0', incoming: '年', punctuationShrink: 20, overflows: true },
    ])('bounds punctuation borrowing at explicit Western-space boundaries ($preceding/$space/$incoming/$punctuationShrink)', ({ preceding, space, incoming, punctuationShrink, overflows }) => {
        const punctuation = createGlyph('，', 40);
        punctuation.adjustability.shrinkability = [0, punctuationShrink];
        expect(__testing.isGlyphGroupBeyondDivideWidth(
            [createGlyph(incoming, 10)],
            505,
            500,
            false,
            [createGlyph('文', 455), punctuation, createGlyph(preceding, 7), createGlyph(space, 3)]
        )).toBe(overflows);
    });

    it.each([0, 2])('prefers natural gap expansion only at a new Western-to-Han boundary (%i)', (autoSpacing) => {
        const preceding = createGlyph('甲A乙B', 94);
        preceding.adjustability.stretchability = [0, 6];
        preceding.adjustability.shrinkability = [0, 6];
        const incoming = createGlyph('中', 10 + autoSpacing);
        incoming.autoSpacing = [autoSpacing, 0];
        incoming.adjustability.stretchability = [autoSpacing / 2, 0];
        incoming.adjustability.shrinkability = [autoSpacing / 2, 0];
        expect(__testing.isGlyphGroupBeyondDivideWidth([incoming], 94, 100, false, [preceding]))
            .toBe(autoSpacing > 0);
    });

    it('does not borrow compression across a fixed tab anchor', () => {
        const punctuation = createGlyph('，', 20);
        punctuation.adjustability.shrinkability = [0, 10];
        const word = createGlyph('2021', 20);
        const tab = createGlyph('\t', 0);
        tab.glyphType = GlyphType.TAB;
        expect(__testing.isGlyphGroupBeyondDivideWidth([word], 85, 100, false, [punctuation])).toBe(false);
        expect(__testing.isGlyphGroupBeyondDivideWidth([createGlyph('文字', 20)], 85, 100, false, [punctuation])).toBe(false);
        expect(__testing.isGlyphGroupBeyondDivideWidth([word], 85, 100, false, [punctuation, tab])).toBe(true);
        expect(__testing.isGlyphGroupBeyondDivideWidth([tab, word], 85, 100, false, [punctuation])).toBe(true);
    });

    it.each([
        { content: '中A文B', width: 8, expectedLines: ['中', 'A', '文', 'B\r'], widths: [8, 8, 8, 8] },
        { content: '中A文B', width: 100, expectedLines: ['中A文B\r'], widths: [10, 8, 12, 8] },
        { content: 'A中文B', width: 26, expectedLines: ['A中文', 'B\r'], widths: [8, 10, 8, 8] },
    ])('keeps automatic CJK/Latin spacing only between glyphs on the same line: $content/$width', ({ content, width, expectedLines, widths }) => {
        const { ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: width + 40, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.LEFT } }] },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        expect(lines.map((line) => line.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.content).join(''))).toEqual(expectedLines);
        const glyphs = lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))
            .filter((glyph) => glyph.content !== '\r' && glyph.content !== '');
        expect(glyphs.map((glyph) => glyph.width)).toEqual(widths);
        for (const line of lines) {
            expect(line.divides[0].glyphGroup[0].xOffset).toBe(0);
        }
        viewModel.dispose();
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

    it.each([0, 1, 2])('allows hanging punctuation before %s structural terminators', (terminatorCount) => {
        const text = createGlyph('字', 10);
        const punctuation = createGlyph('。', 10);
        punctuation.adjustability.shrinkability = [0, 0];
        const paragraph = createGlyph(DataStreamTreeTokenType.PARAGRAPH, 8);
        const section = createGlyph(DataStreamTreeTokenType.SECTION_BREAK, 8);
        section.streamType = DataStreamTreeTokenType.SECTION_BREAK;
        const glyphs = [text, punctuation, ...[paragraph, section].slice(0, terminatorCount)];
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

    it.each([[90, 1], [100, 2]])('uses character scale %s when choosing line breaks', (sa, lineCount) => {
        const text = '一二三四五六七八九十一二';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(text, {
            body: {
                textRuns: [{ st: 0, ed: text.length, ts: { sa } }],
                paragraphs: [{ startIndex: text.length, paragraphId: 'scaled', paragraphStyle: { snapToGrid: BooleanNumber.FALSE, textStyle: { sa } } }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 130, height: 600 },
            },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        expect(shaped.flatMap((part) => part.glyphs).filter((glyph) => glyph.content !== '\r').reduce((sum, glyph) => sum + glyph.width, 0)).toBeCloseTo(96 * sa / 100);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        expect(pages[0].sections[0].columns[0].lines).toHaveLength(lineCount);
    });

    it.each([
        [DocumentFlavor.TRADITIONAL, false, true, false],
        [DocumentFlavor.TRADITIONAL, true, false, false],
        [DocumentFlavor.MODERN, false, false, false],
        [DocumentFlavor.TRADITIONAL, true, true, true],
        [DocumentFlavor.MODERN, true, false, true],
    ])('keeps only structural table anchors heightless: flavor=%s authored=%s heightless=%s framed=%s', (documentFlavor, authored, heightless, framed) => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const paragraphFrame = framed ? { wrap: 'around', horizontalAnchor: 'page', verticalAnchor: 'page', x: '1', y: '1' } : undefined;
        const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(`${tableStream}${T.PARAGRAPH}`, {
            body: {
                paragraphs: [
                    { startIndex: tableStream.indexOf(T.PARAGRAPH), paragraphId: 'cell' },
                    ...(authored ? [{ startIndex: tableStream.length, paragraphId: 'authored-anchor', paragraphStyle: { paragraphFrame } }] : []),
                    { startIndex: tableStream.length + 1, paragraphId: 'following-empty-paragraph', paragraphStyle: { paragraphFrame } },
                ],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: tableStream.length }],
            },
            tableSource: {
                table: {
                    tableId: 'table',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { top: 0, bottom: 0, left: 0, right: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 280 } },
                    tableRows: [{
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                        trHeight: { val: { v: 80 }, hRule: TableRowHeightRule.EXACT },
                    }],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                },
            },
            documentStyle: { documentFlavor },
        });
        const table = createTableSkeleton(ctx, curPage, viewModel, paragraphNode.children[0], sectionBreakConfig);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, table);
        const anchorLine = pages[0].sections[0].columns[0].lines[0];

        expect(table?.height).toBe(80);
        expect(anchorLine.top).toBeCloseTo(table!.top + table!.height);
        if (heightless) {
            expect(anchorLine.lineHeight).toBe(0);
        } else {
            expect(anchorLine.lineHeight).toBeGreaterThan(0);
        }

        const followingNode = viewModel.getChildren()[0].children[1];
        const followingShaped = shaping(ctx, followingNode.content!, viewModel, followingNode, sectionBreakConfig);
        const followingPages = lineBreaking(ctx, viewModel, followingShaped, pages[0], followingNode, sectionBreakConfig, null);
        const followingLine = followingPages[0].sections[0].columns[0].lines[1];
        expect(followingLine.lineHeight).toBeGreaterThan(0);
        expect(followingLine.top).toBeCloseTo(anchorLine.top + anchorLine.lineHeight);
        expect(dataModel.getBody()?.dataStream).toBe(`${tableStream}${T.PARAGRAPH}${T.PARAGRAPH}${T.SECTION_BREAK}`);
    });

    it.each([
        [DocumentFlavor.TRADITIONAL, BooleanNumber.TRUE, 0],
        [DocumentFlavor.MODERN, BooleanNumber.TRUE, 23.4],
        [DocumentFlavor.TRADITIONAL, BooleanNumber.FALSE, null],
        [DocumentFlavor.MODERN, BooleanNumber.FALSE, 23.4],
        [DocumentFlavor.TRADITIONAL, { horizontalSpace: 12, wrap: 'around', verticalAnchor: 'page', horizontalAnchor: 'page', x: '1', y: '1' }, null],
        [DocumentFlavor.MODERN, { horizontalSpace: 12, wrap: 'around', verticalAnchor: 'page', horizontalAnchor: 'page', x: '1', y: '1' }, 23.4],
    ] as const)('preserves authored frame blanks except legacy structural markers: %s, %j', (documentFlavor, paragraphFrame, expectedHeight) => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('', {
            body: {
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: 'empty-frame',
                    paragraphStyle: { paragraphFrame },
                }],
            },
            documentStyle: { documentFlavor },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);

        const lineHeight = pages[0].sections[0].columns[0].lines[0].lineHeight;
        if (expectedHeight == null) {
            expect(lineHeight).toBeGreaterThan(0);
        } else {
            expect(lineHeight).toBe(expectedHeight);
        }
    });

    it('retains visible text and its authored spacing inside a positioned Word frame', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Frame text', {
            body: {
                paragraphs: [{
                    startIndex: 10,
                    paragraphId: 'visible-frame',
                    paragraphStyle: {
                        paragraphFrame: { wrap: 'around', horizontalAnchor: 'page', verticalAnchor: 'page', x: '1', y: '1' },
                        spaceAbove: { v: 10 },
                        spaceBelow: { v: 12 },
                    },
                }],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const line = pages[0].sections[0].columns[0].lines[0];

        expect(line.lineHeight).toBeGreaterThan(10);
        expect(line.spaceBelowApply).toBe(12);
        expect(line.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.content).join('')).toContain('Frame text');
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
                textRuns: [{ st: content.length, ed: content.length + 1, ts: { fs: 11, bl: BooleanNumber.TRUE } }],
                paragraphs: [{ startIndex: content.length, paragraphId: 'paragraph-mark-width', paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }],
            },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
        const before = JSON.stringify(dataModel.getSnapshot());
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const mark = shaped.flatMap((item) => item.glyphs).find((glyph) => glyph.content === '\r')!;
        const zeroWidth = zeroWidthParagraphBreak === BooleanNumber.TRUE || documentFlavor === DocumentFlavor.TRADITIONAL ||
            (zeroWidthParagraphBreak == null && documentFlavor === DocumentFlavor.DRAWINGML);
        const authoredMarkAdvance = 8;
        const expectedMarkAdvance = documentFlavor === DocumentFlavor.DRAWINGML
            ? Math.round(authoredMarkAdvance * 8) / 8
            : authoredMarkAdvance;
        expect(mark.width).toBe(zeroWidth ? 0 : expectedMarkAdvance);
        expect(mark.count).toBe(1);
        expect(mark.ts).toMatchObject({ fs: 11, bl: BooleanNumber.TRUE });
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

    it.each([
        [false, false, SpacingRule.AUTO, 33],
        [true, false, SpacingRule.AUTO, 33],
        [false, true, SpacingRule.AUTO, 22],
        [true, true, SpacingRule.AUTO, 22],
        [false, false, SpacingRule.EXACT, 16],
        [true, false, SpacingRule.EXACT, 16],
        [false, true, SpacingRule.EXACT, 22],
        [true, true, SpacingRule.EXACT, 22],
    ])('combines baseline extents when appending glyphs (reversed=%s, inline=%s, rule=%s)', (reversed, inline, spacingRule, expectedHeight) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('AB', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const text = createGlyph('A', 10);
        text.bBox.ba = 14;
        text.bBox.bd = 4;
        const raised = createGlyph('B', 18);
        raised.bBox.ba = 18;
        raised.bBox.bd = 0;
        if (inline) {
            raised.streamType = DataStreamTreeTokenType.CUSTOM_BLOCK;
        }
        const glyphs = reversed ? [raised, text] : [text, raised];
        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: {
                lineSpacing: spacingRule === SpacingRule.AUTO ? 1.5 : 16,
                spacingRule,
                snapToGrid: BooleanNumber.FALSE,
                spaceAbove: { v: 0 },
                spaceBelow: { v: 0 },
            },
            useWordStyleLineHeight: true,
        } as IParagraphConfig;
        let pages = [curPage];
        for (const [index, glyph] of glyphs.entries()) {
            pages = layoutParagraph(ctx, [glyph], pages, sectionBreakConfig, paragraphConfig, index === 0);
        }
        const line = pages[0].sections[0].columns[0].lines[0];
        expect(line.contentHeight).toBe(22);
        expect(line.lineHeight).toBeCloseTo(expectedHeight);
        expect(line.divides.flatMap((divide) => divide.glyphGroup)).toEqual(glyphs);

        pages = layoutParagraph(ctx, [text], pages, sectionBreakConfig, paragraphConfig, true);
        const nextLine = pages[0].sections[0].columns[0].lines[1];
        expect(nextLine.top - line.top).toBeCloseTo(expectedHeight);
    });

    it('does not multiply inline custom block height by auto line spacing', () => {
        const metrics = getLineHeightMetrics(624, 0, 15.6, GridType.LINES, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true, false);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(624, 4);
    });

    it('retains text leading beside a tall inline object without multiplying the object height', () => {
        const metrics = getLineHeightMetrics(624, 0, 15.6, GridType.DEFAULT, 1.5, SpacingRule.AUTO, BooleanNumber.FALSE, true, false, 18);

        expect(metrics.contentHeight).toBe(624);
        expect(getLineBoxHeight(metrics)).toBeCloseTo(633, 4);
    });

    it.each([
        { pictureFirst: false, flavor: DocumentFlavor.TRADITIONAL, expectedHeight: 31 },
        { pictureFirst: true, flavor: DocumentFlavor.TRADITIONAL, expectedHeight: 31 },
        { pictureFirst: false, flavor: DocumentFlavor.MODERN, expectedHeight: 22 },
        { pictureFirst: true, flavor: DocumentFlavor.MODERN, expectedHeight: 22 },
    ])('resolves mixed inline leading across batches in $flavor (pictureFirst=$pictureFirst)', ({ pictureFirst, flavor, expectedHeight }) => {
        const { ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('AB', {
            documentStyle: { documentFlavor: flavor },
        });
        const text = createGlyph('A', 10);
        text.bBox.ba = 14;
        text.bBox.bd = 4;
        text.bBox.normalLineHeight = 18;
        const picture = createGlyph('B', 18);
        picture.streamType = DataStreamTreeTokenType.CUSTOM_BLOCK;
        picture.bBox.ba = 18;
        picture.bBox.bd = 0;
        const glyphs = pictureFirst ? [picture, text] : [text, picture];
        const paragraphConfig = {
            paragraphIndex: paragraphNode.endIndex,
            paragraphStyle: { lineSpacing: 1.5, spacingRule: SpacingRule.AUTO, snapToGrid: BooleanNumber.FALSE },
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(flavor),
            useWordStyleLineHeight: true,
        } as IParagraphConfig;
        let pages = [curPage];
        for (const [index, glyph] of glyphs.entries()) {
            pages = layoutParagraph(ctx, [glyph], pages, sectionBreakConfig, paragraphConfig, index === 0);
        }
        const line = pages[0].sections[0].columns[0].lines[0];
        expect(line.contentHeight).toBe(22);
        expect(line.lineHeight).toBeCloseTo(expectedHeight);
        expect(line.divides.flatMap((divide) => divide.glyphGroup)).toEqual(glyphs);
        pages = layoutParagraph(ctx, [text], pages, sectionBreakConfig, paragraphConfig, true);
        expect(pages[0].sections[0].columns[0].lines[1].top - line.top).toBeCloseTo(expectedHeight);
    });

    it.each([[206.2, 208], [209.46666666666667, 228.8]])('fits a %s px inline object into whole document-grid lines', (height, expectedHeight) => {
        const metrics = getLineHeightMetrics(height, 0, 20.8, GridType.LINES, 1, SpacingRule.AUTO, BooleanNumber.TRUE, true, false, undefined, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(expectedHeight, 4);
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

    it('lets exact docx line spacing override the document grid pitch', () => {
        const metrics = getLineHeightMetrics(16, 0, 30.46666666666667, GridType.LINES_AND_CHARS, 26.666666666666668, SpacingRule.EXACT, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(26.666666666666668, 4);
    });

    it.each([16, 0.9333333333333332])('preserves a compact exact line box of %s pixels on a line grid', (lineSpacing) => {
        const metrics = getLineHeightMetrics(16, 0, 20.8, GridType.LINES, lineSpacing, SpacingRule.EXACT, BooleanNumber.TRUE, true);

        expect(getLineBoxHeight(metrics)).toBeCloseTo(lineSpacing, 4);
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

    it.each([16, 80])('aligns traditional inline images to the shared text baseline with %s px minimum leading', (lineSpacing) => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}g`;
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'baseline-image' }],
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'inline-baseline',
                    paragraphStyle: {
                        spacingRule: SpacingRule.AT_LEAST,
                        lineSpacing,
                        spaceAbove: { v: 10.4 },
                        spaceBelow: { v: 10.4 },
                        snapToGrid: BooleanNumber.FALSE,
                    },
                }],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            drawings: {
                'baseline-image': {
                    drawingId: 'baseline-image',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: { angle: 0, size: { width: 100, height: 54 } },
                },
            },
        });
        const pages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            null
        );
        updateInlineDrawingCoordsAndBorder(ctx, pages);
        const line = pages[0].sections[0].columns[0].lines[0];
        const glyphs = line.divides.flatMap((divide) => divide.glyphGroup);
        const baseline = pages[0].sections[0].top + line.top + line.marginTop + line.paddingTop +
            Math.max(...glyphs.map((glyph) => glyph.bBox.ba));
        const drawing = pages[0].skeDrawings.get('baseline-image')!;
        expect(drawing.aTop + drawing.height).toBeCloseTo(baseline, 6);
        expect(line.contentHeight).toBeGreaterThan(drawing.height);
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

    it('positions flow tables below page-anchored floating tables that disallow overlap', () => {
        const floatingTable = {
            top: -98,
            left: 0,
            width: 788,
            height: 1123,
            tableSource: {
                textWrap: TableTextWrapType.WRAP,
                overlap: BooleanNumber.FALSE,
                dist: { distB: 4 },
            },
        } as any;
        const table = {
            top: 42,
            left: 0,
            width: 684,
            height: 874,
        } as any;
        const page = {
            skeTables: new Map([['floating', floatingTable]]),
        } as any;

        __testing.avoidNonOverlappingFloatingTables(table, page);

        expect(table.top).toBe(1029);
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
            [page],
            column,
            section,
            cache,
            0,
            {} as any
        );

        expect(table).toMatchObject({ left: 261, top: 40 });
        expect(page.skeTables.get(table.tableId)).toBe(table);
    });

    it.each([
        [ObjectRelativeFromH.PAGE, -53],
        [ObjectRelativeFromH.MARGIN, 1],
        [ObjectRelativeFromH.COLUMN, 31],
    ])('normalizes floating table horizontal anchor %s to the content origin', (relativeFrom, expectedLeft) => {
        const page = { pageWidth: 794, marginLeft: 54, marginRight: 60, sections: [] };
        const section = { top: 0, parent: page };
        const column = { left: 30, width: 650, lines: [], parent: section };
        const table = {
            width: 788,
            height: 1123,
            tableSource: {
                position: {
                    positionH: { relativeFrom, posOffset: 1 },
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                },
            },
        };

        expect(__testing.getWrapTablePosition(table as never, column as never, 0, 16)?.left).toBe(expectedLeft);
    });

    it.each([
        [DocumentSkeletonPageType.BODY, 40, 20],
        [DocumentSkeletonPageType.CELL, 40, 20],
        [DocumentSkeletonPageType.CELL, 60, 50],
    ])('preserves only fitting cell after-spacing when the next paragraph overflows: %s, %s', (pageType, capacity, expectedHeight) => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('A\rB', {
            body: {
                paragraphs: [
                    { startIndex: 1, paragraphId: 'first', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 20, spaceBelow: { v: 30 } } },
                    { startIndex: 3, paragraphId: 'second', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 20 } },
                ],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: capacity + 40 } },
        });
        curPage.type = pageType;
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const firstShaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        lineBreaking(ctx, viewModel, firstShaped, curPage, paragraphNode, sectionBreakConfig, null);
        const secondNode = viewModel.getChildren()[0].children[1];
        const secondShaped = shaping(ctx, secondNode.content!, viewModel, secondNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, secondShaped, curPage, secondNode, sectionBreakConfig, null);
        expect(pages).toHaveLength(2);
        const lastLine = pages[0].sections[0].columns[0].lines[0];
        expect(lastLine.lineHeight).toBe(expectedHeight);
        expect(lastLine.marginBottom).toBe(expectedHeight - 20);
        expect(pages[1].sections[0].columns[0].lines[0].top).toBe(0);
    });

    it.each([false, true].flatMap((incremental) =>
        [TableTextWrapType.WRAP, TableTextWrapType.NONE].map((textWrap) => ({ incremental, textWrap }))))(
        'moves a fitting text-anchored float intact without changing inline pagination ($incremental, $textWrap)',
        ({ incremental, textWrap }) => {
            const T = DataStreamTreeTokenType;
            const prefix = `Before${T.PARAGRAPH}`;
            const row = `${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`;
            const tableStream = `${T.TABLE_START}${row.repeat(2)}${T.TABLE_END}`;
            const content = `${prefix}${tableStream}${T.PARAGRAPH}After`;
            const paragraphs = [...content.matchAll(/\r/g)].filter((match) => match.index !== prefix.length + tableStream.length).map((match) => ({
                startIndex: match.index,
                paragraphId: `p-${match.index}`,
                paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: match.index === prefix.length - 1 ? 80 : 20 },
            }));
            paragraphs.push({ startIndex: content.length, paragraphId: 'after', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 20 } });
            const bed = createParagraphLayoutTestBed(content, {
                body: {
                    paragraphs,
                    tables: [{ tableId: 'table', startIndex: prefix.length, endIndex: prefix.length + tableStream.length }],
                },
                tableSource: { table: {
                    tableId: 'table',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.MARGIN },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 10 },
                    },
                    dist: {},
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                    tableRows: [0, 1].map(() => ({
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                        trHeight: { val: { v: 60 }, hRule: TableRowHeightRule.EXACT },
                    })),
                } },
                documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: 200 } },
            });
            const sourceBefore = JSON.stringify(bed.dataModel.getSnapshot());
            const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
            try {
                if (incremental) {
                    const generation = skeleton.startIncrementalLayout();
                    let progress = skeleton.stepIncrementalLayout(generation, 0);
                    for (let step = 0; step < 100 && !progress.complete; step++) {
                        progress = skeleton.stepIncrementalLayout(generation, 0);
                    }
                    expect(progress.complete).toBe(true);
                } else {
                    skeleton.calculate();
                }
                const pages = skeleton.getSkeletonData()!.pages;
                expect(pages).toHaveLength(2);
                if (textWrap === TableTextWrapType.WRAP) {
                    expect(pages[0].skeTables.size).toBe(0);
                    const table = [...pages[1].skeTables.values()][0];
                    expect(table.rows).toHaveLength(2);
                    expect(table.height).toBe(120);
                    expect(table.top).toBe(10);
                } else {
                    expect(pages.map((page) => [...page.skeTables.values()].map((table) => table.rows.length))).toEqual([[1], [1]]);
                }
                expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(sourceBefore);
            } finally {
                skeleton.dispose();
                bed.viewModel.dispose();
                bed.dataModel.dispose();
            }
        }
    );

    it.each([
        { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 30 },
        { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 10 },
    ])('paginates an oversized floating Word table without changing its source ($relativeFrom)', (positionV) => {
        const T = DataStreamTreeTokenType;
        const rows = ['First', 'Second', 'Third', 'Fourth'].map((text) =>
            `${T.TABLE_ROW_START}${T.TABLE_CELL_START}${text}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`
        );
        const tableStream = `${T.TABLE_START}${rows.join('')}${T.TABLE_END}`;
        const content = `${tableStream}${T.PARAGRAPH}After`;
        const paragraphs = [];
        for (let index = 0; index < tableStream.length; index++) {
            if (tableStream[index] === T.PARAGRAPH) {
                paragraphs.push({ startIndex: index, paragraphId: `cell-${index}` });
            }
        }
        paragraphs.push({ startIndex: content.length, paragraphId: 'after' });
        const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: { paragraphs, tables: [{ tableId: 'floating', startIndex: 0, endIndex: tableStream.length }] },
            tableSource: {
                floating: {
                    tableId: 'floating',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.WRAP,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.MARGIN },
                        positionV,
                    },
                    dist: {},
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                    tableRows: rows.map(() => ({
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                        trHeight: { val: { v: 80 }, hRule: TableRowHeightRule.EXACT },
                    })),
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 200, height: 200 },
            },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const sourceBefore = JSON.stringify(dataModel.getSnapshot());
        const table = createTableSkeleton(ctx, curPage, viewModel, paragraphNode.children[0], sectionBreakConfig);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, table);
        expect(pages).toHaveLength(3);
        const slices = pages.flatMap((page) => [...page.skeTables.values()]);
        expect(slices.map((slice) => slice.rows.length)).toEqual([1, 2, 1]);
        expect(slices.map((slice) => slice.left)).toEqual([0, 0, 0]);
        expect(slices.map((slice) => slice.top)).toEqual([10, 0, 0]);
        expect(slices.every((slice) => slice.tableSource.textWrap === TableTextWrapType.WRAP)).toBe(true);
        const lastPage = pages[pages.length - 1];
        const followingNode = viewModel.getChildren()[0].children[1];
        const followingShaped = shaping(ctx, followingNode.content!, viewModel, followingNode, sectionBreakConfig);
        const followingPages = lineBreaking(ctx, viewModel, followingShaped, lastPage, followingNode, sectionBreakConfig, null);
        const followingLine = followingPages[0].sections[0].columns[0].lines.find((line) => line.paragraphIndex === content.length);
        expect(followingLine?.top).toBeGreaterThanOrEqual(slices[2].top + slices[2].height);
        expect(JSON.stringify(dataModel.getSnapshot())).toBe(sourceBefore);
    });

    it.each([
        { relativeFrom: ObjectRelativeFromH.MARGIN, align: AlignTypeH.LEFT },
        { relativeFrom: ObjectRelativeFromH.MARGIN, align: AlignTypeH.CENTER },
        { relativeFrom: ObjectRelativeFromH.MARGIN, align: AlignTypeH.RIGHT },
        { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 30 },
        { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 30 },
        { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.RIGHT },
        { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 30 },
    ])('positions floating drawings in the same content coordinates as text: %j', (positionH) => {
        for (const documentFlavor of [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]) {
            const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Hello`;
            const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                body: { customBlocks: [{ startIndex: 0, blockId: 'image' }] },
                drawings: {
                    image: {
                        drawingId: 'image',
                        layoutType: PositionedObjectLayoutType.WRAP_NONE,
                        docTransform: {
                            size: { width: 80, height: 40 },
                            positionH,
                            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        },
                    },
                },
                documentStyle: { documentFlavor, marginLeft: 45, marginRight: 60 },
            });
            const sourceBefore = JSON.stringify(dataModel.getSnapshot());
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const { marginLeft, marginRight, pageWidth } = curPage;
            const isMargin = positionH.relativeFrom === ObjectRelativeFromH.MARGIN;
            const anchorWidth = isMargin ? pageWidth - marginLeft - marginRight : pageWidth;
            let expectedLeft = positionH.posOffset ?? 0;
            if (positionH.align === AlignTypeH.RIGHT) {
                expectedLeft = anchorWidth - 80;
            } else if (positionH.align === AlignTypeH.CENTER) {
                expectedLeft = (anchorWidth - 80) / 2;
            }
            if (isMargin && documentFlavor === DocumentFlavor.MODERN) {
                expectedLeft += marginLeft;
            } else if (positionH.relativeFrom === ObjectRelativeFromH.PAGE && documentFlavor === DocumentFlavor.TRADITIONAL) {
                expectedLeft -= marginLeft;
            }
            expect(curPage.skeDrawings.get('image')?.aLeft).toBeCloseTo(expectedLeft);
            expect(JSON.stringify(dataModel.getSnapshot())).toBe(sourceBefore);
        }
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].flatMap((documentFlavor) =>
        [1, 2].flatMap((pageNumber) => [false, true].map((isInsideTable) => ({ documentFlavor, pageNumber, isInsideTable })))))('preserves first-page before-spacing and suppresses it on subsequent traditional pages: %j', ({ documentFlavor, pageNumber, isInsideTable }) => {
        const bed = createParagraphLayoutTestBed('Cell', { documentStyle: { documentFlavor } });
        if (isInsideTable) {
            bed.curPage.type = DocumentSkeletonPageType.CELL;
        }
        bed.curPage.pageNumber = pageNumber;
        const paragraphConfig = {
            paragraphIndex: bed.paragraphNode.endIndex,
            paragraphStyle: { spaceAbove: { v: 12 } },
            isInsideTable,
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(documentFlavor),
        } as IParagraphConfig;
        try {
            const pages = layoutParagraph(bed.ctx, [createGlyph('Cell', 32)], [bed.curPage], bed.sectionBreakConfig, paragraphConfig, true);
            const line = pages[0].sections[0].columns[0].lines[0];
            expect(line.marginTop).toBe(documentFlavor === DocumentFlavor.TRADITIONAL && pageNumber > 1 ? 0 : 12);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('preserves authored first-paragraph spacing around inline drawings in headers and footers', () => {
        const storyBody = {
            dataStream: '\b\t\rFollowing\r\n',
            customBlocks: [{ startIndex: 0, blockId: 'image' }],
            paragraphs: [{ startIndex: 2, paragraphStyle: { spaceAbove: { v: 32 } } }, { startIndex: 12 }],
            sectionBreaks: [{ startIndex: 13 }],
        };
        const bed = createParagraphLayoutTestBed('Body', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultHeaderId: 'header', defaultFooterId: 'footer' },
            drawings: { image: {
                drawingId: 'image',
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: { size: { width: 100, height: 44 }, positionH: {}, positionV: {}, angle: 0 },
            } },
            headers: { header: { headerId: 'header', body: storyBody } },
            footers: { footer: { footerId: 'footer', body: storyBody } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, bed.ctx.docsConfig.localeService);
        try {
            skeleton.calculate();
            const { skeHeaders, skeFooters } = skeleton.getSkeletonData()!;
            for (const stories of [skeHeaders, skeFooters]) {
                const story = [...stories.values()][0].get(bed.curPage.pageWidth)!;
                const line = story.sections[0].columns[0].lines[0];
                expect(line.marginTop).toBe(32);
                expect(line.lineHeight).toBeGreaterThanOrEqual(76);
                expect(story.sections[0].columns[0].lines[1].top).toBeGreaterThanOrEqual(line.lineHeight);
            }
        } finally {
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([
        { prefix: '', expectedSpaceAbove: 24 },
        { prefix: 'Before\r', expectedSpaceAbove: 24 },
        { prefix: '\r', expectedSpaceAbove: 24 },
    ])('applies first-line spacing after a non-flow drawing anchor with preceding text "$prefix"', ({ prefix, expectedSpaceAbove }) => {
        const content = `${prefix}${DataStreamTreeTokenType.CUSTOM_BLOCK}Hello`;
        const { viewModel, ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                paragraphs: [
                    ...(prefix ? [{ startIndex: prefix.length - 1, paragraphId: 'before' }] : []),
                    { startIndex: content.length, paragraphId: 'heading', paragraphStyle: { spaceAbove: { v: 24 }, indentFirstLine: { v: 12 } } },
                ],
                customBlocks: [{ startIndex: prefix.length, blockId: 'background' }],
            },
            drawings: {
                background: {
                    drawingId: 'background',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: BooleanNumber.TRUE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        for (const node of viewModel.getChildren()[0].children) {
            lineBreaking(ctx, viewModel, shaping(ctx, node.content!, viewModel, node, sectionBreakConfig), curPage, node, sectionBreakConfig, null);
        }
        const lines = curPage.sections[0].columns[0].lines;
        const anchor = lines.find((line) => line.divides.some((divide) => divide.glyphGroup.some((glyph) => glyph.drawingId === 'background')))!;
        const text = lines.find((line) => line.divides.some((divide) => divide.glyphGroup.some((glyph) => glyph.content === 'H')))!;
        expect(anchor.lineHeight).toBe(0);
        expect(text.marginTop).toBe(expectedSpaceAbove);
        expect(text.divides[0].left).toBe(12);
    });

    it.each(['', DataStreamTreeTokenType.PAGE_BREAK].flatMap((boundary) => [
        PositionedObjectLayoutType.WRAP_NONE,
        PositionedObjectLayoutType.WRAP_SQUARE,
        PositionedObjectLayoutType.WRAP_TIGHT,
        PositionedObjectLayoutType.WRAP_THROUGH,
    ].map((layoutType) => ({ boundary, layoutType }))))('preserves the authored paragraph height after a floating-only anchor ($boundary, $layoutType)', ({ boundary, layoutType }) => {
        const anchorText = `${boundary}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const content = `${anchorText}\rHello`;
        const { dataModel, viewModel, ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                paragraphs: [
                    { startIndex: anchorText.length, paragraphId: 'anchor', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 18 } },
                    { startIndex: content.length, paragraphId: 'following' },
                ],
                customBlocks: [{ startIndex: boundary.length, blockId: 'background' }],
                renderedPageBreaks: boundary ? [0] : [],
            },
            drawings: {
                background: {
                    drawingId: 'background',
                    layoutType,
                    behindDoc: BooleanNumber.TRUE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const sourceBefore = JSON.stringify(dataModel.getSnapshot());
        for (const node of viewModel.getChildren()[0].children) {
            lineBreaking(ctx, viewModel, shaping(ctx, node.content!, viewModel, node, sectionBreakConfig), curPage, node, sectionBreakConfig, null);
        }
        const lines = curPage.sections[0].columns[0].lines;
        const paragraph = lines.filter((line) => line.paragraphIndex === anchorText.length);
        expect(paragraph.reduce((height, line) => height + line.lineHeight, 0)).toBeCloseTo(18);
        expect(lines.find((line) => line.paragraphIndex === content.length)?.top).toBeCloseTo(18);
        expect(JSON.stringify(dataModel.getSnapshot())).toBe(sourceBefore);
    });

    it('moves an empty cell paragraph with its after-spacing to the next page', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('A\r\rB', {
            body: {
                paragraphs: [
                    { startIndex: 1, paragraphId: 'first', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 20 } },
                    { startIndex: 2, paragraphId: 'blank', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 22, spaceBelow: { v: 13 } } },
                    { startIndex: 4, paragraphId: 'last', paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: 20 } },
                ],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        curPage.type = DocumentSkeletonPageType.CELL;
        curPage.segmentId = 'cell';
        curPage.sections[0].height = 50;
        let pages = [curPage];
        for (const node of viewModel.getChildren()[0].children) {
            const result = lineBreaking(
                ctx,
                viewModel,
                shaping(ctx, node.content!, viewModel, node, sectionBreakConfig),
                pages[pages.length - 1],
                node,
                sectionBreakConfig,
                null
            );
            pages = [...pages.slice(0, -1), ...result];
        }
        expect(pages).toHaveLength(2);
        expect(pages[0].sections[0].columns[0].lines.map((line) => line.paragraphIndex)).toEqual([paragraphNode.endIndex]);
        const continuation = pages[1].sections[0].columns[0].lines;
        expect(continuation.map((line) => line.paragraphIndex)).toEqual([2, 4]);
        expect(continuation[1].top).toBe(35);
        expect(pages[1].segmentId).toBe('cell');
        expect(pages[1].type).toBe(DocumentSkeletonPageType.CELL);
    });

    it('keeps list numbering across split cell pages and resumes it after the table', () => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}One\rTwo\rThree\rFour\rFive\r${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const content = `${tableStream}\rSix`;
        const paragraphs = [];
        for (let index = 0; index < tableStream.length; index++) {
            if (tableStream[index] === T.PARAGRAPH) {
                paragraphs.push({
                    startIndex: index,
                    paragraphId: `item-${index}`,
                    bullet: { listId: 'continuous', listType: 'decimal', nestingLevel: 0 },
                    paragraphStyle: { lineSpacing: 35, spacingRule: SpacingRule.EXACT },
                });
            }
        }
        paragraphs.push({ ...paragraphs[0], startIndex: content.length, paragraphId: 'after' });
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: { paragraphs, tables: [{ tableId: 'numbered', startIndex: 0, endIndex: tableStream.length }] },
            lists: {
                decimal: {
                    listType: 'decimal',
                    nestingLevel: [{ bulletAlignment: 1, glyphFormat: '%1.', startNumber: 0, glyphType: ListGlyphType.DECIMAL }],
                },
            },
            tableSource: {
                numbered: {
                    tableId: 'numbered',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                    tableRows: [{ tableCells: [{}], trHeight: { val: { v: 0 }, hRule: TableRowHeightRule.AT_LEAST } }],
                },
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: 140 } },
        });
        const table = createTableSkeleton(ctx, curPage, viewModel, paragraphNode.children[0], sectionBreakConfig);
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, table);
        expect(pages.length).toBeGreaterThan(1);
        const symbols = pages.flatMap((page) => [...page.skeTables.values()])
            .flatMap((slice) => slice.rows.flatMap((row) => row.cells))
            .flatMap((cell) => cell.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)))
            .flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup))
            .filter((glyph) => glyph.glyphType === GlyphType.LIST)
            .map((glyph) => glyph.content);
        expect(symbols).toEqual(['1.', '2.', '3.', '4.', '5.']);
        const followingNode = viewModel.getChildren()[0].children[1];
        lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, followingNode.content!, viewModel, followingNode, sectionBreakConfig),
            pages[pages.length - 1],
            followingNode,
            sectionBreakConfig,
            null
        );
        expect(ctx.paragraphConfigCache.get('')?.get(content.length)?.bulletSkeleton?.symbol).toBe('6.');
    });

    it.each([0, 50, 100, 110, 120])('applies the minimum row height once across its page fragments: %s', (minimumHeight) => {
        const T = DataStreamTreeTokenType;
        const tableStream = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}One\rTwo\rThree\rFour\rFive\r${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const paragraphs = [];
        for (let index = 0; index < tableStream.length; index++) {
            if (tableStream[index] === T.PARAGRAPH) {
                paragraphs.push({
                    startIndex: index,
                    paragraphId: `line-${index}`,
                    paragraphStyle: { lineSpacing: 20, spacingRule: SpacingRule.EXACT, widowControl: BooleanNumber.FALSE },
                });
            }
        }
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(tableStream, {
            body: { paragraphs, tables: [{ tableId: 'minimum', startIndex: 0, endIndex: tableStream.length }] },
            tableSource: {
                minimum: {
                    tableId: 'minimum',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                    tableRows: [{
                        tableCells: [{ margin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } } }],
                        trHeight: { val: { v: minimumHeight }, hRule: TableRowHeightRule.AT_LEAST },
                    }],
                },
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: 100 } },
        });
        const table = createTableSkeleton(ctx, curPage, viewModel, paragraphNode.children[0], sectionBreakConfig);
        const pages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            table
        );
        const fragments = pages.flatMap((page) => [...page.skeTables.values()].flatMap((slice) => slice.rows));
        const finalHeight = 40 + Math.max(0, minimumHeight - 100);
        expect(fragments.map((row) => row.height)).toEqual([60, finalHeight]);
        expect(fragments.map((row) => row.cells[0].pageHeight)).toEqual([60, finalHeight]);
    });

    it('moves a table row together when a cell cannot start because of widow control', () => {
        const T = DataStreamTreeTokenType;
        const cell = (text: string) => `${T.TABLE_CELL_START}${text}\r${T.SECTION_BREAK}${T.TABLE_CELL_END}`;
        const row = (left: string, right: string) => `${T.TABLE_ROW_START}${cell(left)}${cell(right)}${T.TABLE_ROW_END}`;
        const tableStream = `${T.TABLE_START}${row('Before', 'Before')}${row('aaaa bbbb cccc dddd eeee ffff', 'A/I')}${T.TABLE_END}`;
        const paragraphs = [];
        for (let index = 0; index < tableStream.length; index++) {
            if (tableStream[index] === T.PARAGRAPH) {
                paragraphs.push({
                    startIndex: index,
                    paragraphId: `line-${index}`,
                    paragraphStyle: {
                        lineSpacing: 20,
                        spacingRule: SpacingRule.EXACT,
                        widowControl: BooleanNumber.TRUE,
                        spaceBelow: { v: 13 },
                    },
                });
            }
        }
        const tableCells = [0, 1].map(() => ({ margin: { top: { v: 0 }, bottom: { v: 0 }, start: { v: 0 }, end: { v: 0 } } }));
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(tableStream, {
            body: { paragraphs, tables: [{ tableId: 'widow-row', startIndex: 0, endIndex: tableStream.length }] },
            tableSource: {
                'widow-row': {
                    tableId: 'widow-row',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableColumns: [0, 1].map(() => ({ size: { type: TableSizeType.SPECIFIED, width: { v: 80 } } })),
                    tableRows: [
                        { tableCells, trHeight: { val: { v: 75 }, hRule: TableRowHeightRule.EXACT } },
                        { tableCells, trHeight: { val: { v: 0 }, hRule: TableRowHeightRule.AT_LEAST } },
                    ],
                },
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 200, height: 140 } },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const table = createTableSkeleton(ctx, curPage, viewModel, paragraphNode.children[0], sectionBreakConfig);
        const pages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            table
        );
        const slices = pages.flatMap((page) => [...page.skeTables.values()]);
        expect(slices.map((slice) => slice.rows.map((row) => row.index))).toEqual([[0], [1]]);
        expect(slices[1].rows[0].height).toBe(73);
        expect(slices[1].rows[0].cells.map((cell) => cell.pageHeight)).toEqual([73, 73]);
    });

    it.each([
        { cellWidth: 100, positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 }, expectedLeft: 0 },
        { cellWidth: 100, positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: -5 }, expectedLeft: -5 },
        { cellWidth: 100, positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.CENTER }, expectedLeft: 21 },
        { cellWidth: 52, positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.CENTER }, expectedLeft: 0 },
    ])('keeps floating table alignment within its cell without changing authored offsets ($cellWidth, $expectedLeft)', ({ cellWidth, positionH, expectedLeft }) => {
        const page = {
            type: DocumentSkeletonPageType.CELL,
            pageWidth: cellWidth,
            pageHeight: 200,
            marginTop: 10,
            marginBottom: 10,
            marginLeft: 0,
            marginRight: 0,
            sections: [] as any[],
        } as any;
        const section = { top: 0, columns: [] as any[], parent: page } as any;
        const column = { left: 0, width: cellWidth, lines: [], parent: section } as any;
        page.sections = [section];
        section.columns = [column];
        const table = {
            width: 58,
            height: 120,
            tableSource: {
                position: {
                    positionH,
                    positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: -104 },
                },
            },
        } as any;

        const source = JSON.stringify(table.tableSource);
        expect(__testing.getWrapTablePosition(table, column, 0, 16)).toEqual({ left: expectedLeft, top: 0 });
        expect(JSON.stringify(table.tableSource)).toBe(source);
    });

    it.each([undefined, { left: 2, top: 3, right: 7, bottom: 11 }])('stores an inline viewport without resizing it for effect bounds (%j)', (effectExtent) => {
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
                        effectExtent,
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
        }, 180 + (effectExtent?.left ?? 0) + (effectExtent?.right ?? 0), 80 + (effectExtent?.top ?? 0), 'b1');
        glyph.bBox.bd = effectExtent?.bottom ?? 0;

        updateInlineDrawingPosition({
            divides: [{
                glyphGroup: [glyph],
                left: 0,
                paddingLeft: 0,
            }],
            lineHeight: 100 + (effectExtent?.top ?? 0) + (effectExtent?.bottom ?? 0),
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
        expect(drawing?.aTop).toBe(30 + (effectExtent?.top ?? 0));
        expect(drawing?.aLeft).toBe(effectExtent?.left ?? 0);
    });
});
