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

import type { IDocumentData, IParagraph } from '@univerjs/core';
import {
    BooleanNumber,
    ColumnSeparatorType,
    createDocumentModelWithStyle,
    CustomRangeType,
    DashStyleType,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    DrawingTypeEnum,
    GridType,
    HorizontalAlign,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PageOrientType,
    PositionedObjectLayoutType,
    PresetListType,
    SectionType,
    SpacingRule,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
    Univer,
    VerticalAlignmentType,
    WrapTextType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import {
    DocumentSkeletonPageType,
    GlyphType,
    PageLayoutType,
} from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { setDocsCustomBlockRenderViewportProvider } from '../../custom-block-render-viewport';
import { DocumentLayoutType } from '../../document-compatibility';
import { setDocsTableRenderViewportProvider } from '../../table-render-viewport';
import { DocumentViewModel } from '../../view-model/document-view-model';
import { DocumentSkeleton } from '../doc-skeleton';
import { Hyphen } from '../hyphenation/hyphen';
import { Lang } from '../hyphenation/lang';
import { PATTERN_LOADERS } from '../hyphenation/pattern-loaders.gen';
import * as CellLayout from '../model/page';
import { FontCache } from '../shaping-engine/font-cache';

function normalizeSkeleton(value: unknown): unknown {
    if (typeof value === 'number' && Object.is(value, -0)) {
        return 0;
    }
    if (value instanceof Map) {
        return [...value.entries()]
            .sort(([left], [right]) => String(left).localeCompare(String(right)))
            .map(([key, entryValue]) => [key, normalizeSkeleton(entryValue)]);
    }
    if (Array.isArray(value)) {
        return value.map(normalizeSkeleton);
    }
    if (value != null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => key !== 'parent')
                .map(([key, entryValue]) => [key, normalizeSkeleton(entryValue)])
        );
    }
    return value;
}

function completeIncrementalLayout(skeleton: DocumentSkeleton, anchor?: number) {
    const generation = skeleton.startIncrementalLayout({
        reason: anchor == null ? 'initial' : 'edit',
        anchor,
    });
    let progress = skeleton.stepIncrementalLayout(generation, 0);
    for (let step = 0; step < 20_000 && !progress.complete; step++) {
        progress = skeleton.stepIncrementalLayout(generation, 0);
    }

    expect(progress).toMatchObject({ complete: true, cancelled: false });
    return progress;
}

function createSkeletonDrawing(drawingId: string, unitId: string) {
    return {
        drawingId,
        aLeft: 0,
        aTop: 0,
        width: 100,
        height: 50,
        angle: 0,
        initialState: true,
        drawingOrigin: {
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_BLOCK,
            unitId,
            subUnitId: unitId,
            docTransform: {
                angle: 0,
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                size: { width: 100, height: 50 },
            },
            layoutType: PositionedObjectLayoutType.INLINE,
        },
        columnLeft: 0,
        isPageBreak: false,
        lineTop: 0,
        lineHeight: 50,
        blockAnchorTop: 0,
        customBlockRenderViewport: { contentHeight: 50, viewportHeight: 10, viewScale: 1 },
    };
}

function expectIncrementalSkeletonToEqualSynchronous(
    snapshot: ConstructorParameters<typeof DocumentDataModel>[0],
    localeService: LocaleService,
    anchor?: number
) {
    const synchronous = DocumentSkeleton.create(
        new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
        localeService
    );
    const incremental = DocumentSkeleton.create(
        new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
        localeService
    );

    synchronous.calculate();
    completeIncrementalLayout(incremental, anchor);
    expect(normalizeSkeleton(incremental.getSkeletonData())).toEqual(normalizeSkeleton(synchronous.getSkeletonData()));

    incremental.dispose();
    synchronous.dispose();
}

function createPage(type: DocumentSkeletonPageType, st: number, tableId = '') {
    const listGlyph = { st, ed: st, count: 1, width: 3, left: 0, xOffset: 0, content: '•', glyphType: GlyphType.LIST } as any;
    const glyphA = { st: st + 1, ed: st + 1, count: 1, width: 4, left: 3, xOffset: 0, content: 'A', glyphType: GlyphType.WORD } as any;
    const glyphB = { st: st + 2, ed: st + 3, count: 2, width: 7, left: 7, xOffset: 0, content: 'BC', glyphType: GlyphType.WORD } as any;

    const divide = {
        st,
        ed: st + 3,
        glyphGroup: [listGlyph, glyphA, glyphB],
    } as any;
    const line = {
        st,
        ed: st + 3,
        top: 0,
        lineHeight: 20,
        divides: [divide],
    } as any;
    const column = {
        st,
        ed: st + 3,
        left: 0,
        width: 120,
        lines: [line],
    } as any;
    const section = {
        st,
        ed: st + 3,
        top: 0,
        width: 120,
        height: 60,
        columns: [column],
    } as any;
    const page = {
        type,
        st,
        ed: st + 3,
        pageWidth: 200,
        width: 200,
        height: 80,
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 5,
        marginRight: 5,
        headerId: 'header-seg',
        footerId: 'footer-seg',
        tableId,
        sections: [section],
        skeTables: new Map(),
        skeColumnGroups: new Map(),
    } as any;

    divide.parent = line;
    line.parent = column;
    column.parent = section;
    section.parent = page;
    listGlyph.parent = divide;
    glyphA.parent = divide;
    glyphB.parent = divide;

    return {
        page,
        section,
        column,
        line,
        divide,
        glyphs: { listGlyph, glyphA, glyphB },
    };
}

describe('doc skeleton', () => {
    it('uses the largest DrawingML text size across runs, without changing snapshots or document defaults', () => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockReturnValue({
            width: 6.1572265625,
            fontBoundingBoxAscent: 15,
            fontBoundingBoxDescent: 4,
            actualBoundingBoxAscent: 15,
            actualBoundingBoxDescent: 4,
        });
        const dataModel = new DocumentDataModel({
            id: 'drawingml-runtime-layout',
            body: {
                dataStream: 'a b\r\n',
                textRuns: [{ st: 0, ed: 2, ts: { fs: 10.5 } }, { st: 2, ed: 3, ts: { fs: 18 } }],
                paragraphs: [{ startIndex: 3, paragraphId: 'mixed-sizes', paragraphStyle: {
                    lineSpacing: 1.5,
                    spacingRule: SpacingRule.AUTO,
                    snapToGrid: BooleanNumber.FALSE,
                } }],
                sectionBreaks: [{ sectionId: 'drawingml-section', startIndex: 4, gridType: GridType.DEFAULT }],
            },
            documentStyle: { pageSize: { width: 300, height: 300 } },
        });
        const snapshot = structuredClone(dataModel.getSnapshot());
        const univer = new Univer();
        const locale = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(dataModel), locale);
        const firstLine = () => skeleton.getSkeletonData()!.pages[0].sections[0].columns[0].lines[0];
        try {
            skeleton.calculate();
            const documentHeight = firstLine().lineHeight;
            expect(documentHeight).toBeCloseTo(28.5);
            skeleton.setLayoutType(DocumentLayoutType.DRAWINGML);
            skeleton.calculate();
            expect(firstLine().lineHeight).toBeCloseTo(43.2);
            expect(firstLine().divides[0].glyphGroup.find((glyph) => glyph.content === 'a')?.width).toBe(6.125);
            const fresh = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(snapshot)), locale, { layoutType: DocumentLayoutType.DRAWINGML });
            fresh.calculate();
            expect(normalizeSkeleton(skeleton.getSkeletonData())).toEqual(normalizeSkeleton(fresh.getSkeletonData()));
            fresh.dispose();
            skeleton.setLayoutType(DocumentLayoutType.DOCUMENT);
            skeleton.calculate();
            expect(firstLine().lineHeight).toBeCloseTo(documentHeight);
            expect(dataModel.getSnapshot()).toEqual(snapshot);
        } finally {
            skeleton.dispose();
            univer.dispose();
            measure.mockRestore();
        }
    });
    it.each(['ready', 'cancel', 'failure', 'header', 'footer'])('waits for cold hyphenation rules and matches a warm executor (%s)', async (scenario) => {
        const univer = new Univer();
        const content = scenario === 'header' || scenario === 'footer'
            ? 'Este documento contiene información sobre la configuración y la administración de los servicios.'
            : `${'A continued paragraph crosses several physical pages. '.repeat(100)}Hello world ${'Further text keeps the paragraph flowing. '.repeat(200)}`;
        const snapshot: Partial<IDocumentData> = {
            id: 'hyphen-readiness',
            body: {
                dataStream: `${content}\r\n`,
                paragraphs: [{ startIndex: content.length, paragraphId: 'hyphen-paragraph' }],
                sectionBreaks: [{ startIndex: content.length + 1, sectionId: 'hyphen-section' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 600, height: 700 },
                marginTop: 30,
                marginBottom: 30,
                marginLeft: 30,
                marginRight: 30,
                textStyle: { ff: 'Arial', fs: 12 },
                autoHyphenation: BooleanNumber.TRUE,
            },
        };
        if (scenario === 'header' || scenario === 'footer') {
            const body = snapshot.body!;
            snapshot.body = {
                dataStream: 'Cover\r\n',
                paragraphs: [{ startIndex: 5, paragraphId: 'cover-paragraph' }],
                sectionBreaks: [{ startIndex: 6, sectionId: 'cover-section' }],
            };
            if (scenario === 'header') {
                snapshot.headers = { header: { headerId: 'header', body } };
                snapshot.documentStyle!.defaultHeaderId = 'header';
            } else {
                snapshot.footers = { footer: { footerId: 'footer', body } };
                snapshot.documentStyle!.defaultFooterId = 'footer';
            }
        }
        const cold = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(snapshot)), univer.__getInjector().get(LocaleService));
        const warm = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(snapshot)), univer.__getInjector().get(LocaleService));
        const coldHyphen = new Hyphen();
        const warmHyphen = new Hyphen();
        (cold as unknown as { _hyphen: Hyphen })._hyphen = coldHyphen;
        (warm as unknown as { _hyphen: Hyphen })._hyphen = warmHyphen;
        const loader = vi.spyOn(PATTERN_LOADERS, Lang.Es);
        try {
            await warmHyphen.loadPattern(Lang.Es);
            if (scenario === 'failure') {
                loader.mockRejectedValueOnce(new Error('dictionary download failed'));
            }
            let coldGeneration = cold.startIncrementalLayout({ waitForHyphenationPatterns: true });
            const first = cold.stepIncrementalLayout(coldGeneration, 8);
            expect(first).toMatchObject({ complete: false, didPublish: false, processedBlockCount: 0 });
            if (scenario === 'cancel') {
                cold.cancelIncrementalLayout(coldGeneration);
            }
            if (scenario === 'failure') {
                await expect(coldHyphen.loadPattern(Lang.Es)).rejects.toThrow('dictionary download failed');
                await vi.waitFor(() => expect(() => cold.stepIncrementalLayout(coldGeneration, 8))
                    .toThrow('dictionary download failed'));
                expect(cold.stepIncrementalLayout(coldGeneration, 8)).toMatchObject({ cancelled: true, didPublish: false });
                coldGeneration = cold.startIncrementalLayout({ waitForHyphenationPatterns: true });
            }
            await coldHyphen.loadPattern(Lang.Es);
            if (scenario === 'cancel') {
                expect(cold.stepIncrementalLayout(coldGeneration, 8)).toMatchObject({ cancelled: true, didPublish: false });
                coldGeneration = cold.startIncrementalLayout({ waitForHyphenationPatterns: true });
            }
            await vi.waitFor(() => expect(cold.stepIncrementalLayout(coldGeneration, 8).complete).toBe(true));
            completeIncrementalLayout(warm);
            expect(normalizeSkeleton(cold.getSkeletonData())).toEqual(normalizeSkeleton(warm.getSkeletonData()));
        } finally {
            loader.mockRestore();
            cold.dispose();
            warm.dispose();
            coldHyphen.dispose();
            warmHyphen.dispose();
            univer.dispose();
        }
    });

    it('does not resolve publication geometry while a distant edit anchor is still pending', () => {
        const univer = new Univer();
        const model = createDocumentModelWithStyle('Paragraph text.\r'.repeat(80), {});
        model.updateDocumentDataPageSize(240, 260);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), univer.__getInjector().get(LocaleService));
        const resolution = vi.spyOn(skeleton as unknown as {
            _findPublishablePriorityPageIndex: (...args: never[]) => number;
        }, '_findPublishablePriorityPageIndex');
        try {
            const generation = skeleton.startIncrementalLayout({ reason: 'edit', anchor: model.getBody()!.dataStream.length - 3 });
            let progress = skeleton.stepIncrementalLayout(generation, 0);
            expect(progress.anchorReady).toBe(false);
            expect(progress.didPublish).toBe(false);
            expect(resolution).not.toHaveBeenCalled();
            for (let step = 0; step < 1000 && !progress.didPublishAnchor; step++) {
                progress = skeleton.stepIncrementalLayout(generation, 0);
            }
            expect(progress.didPublishAnchor).toBe(true);
            expect(resolution).toHaveBeenCalledTimes(1);
        } finally {
            resolution.mockRestore();
            skeleton.dispose();
            univer.dispose();
        }
    });

    it.each([
        { hRule: TableRowHeightRule.AUTO, cantSplit: BooleanNumber.FALSE },
        { hRule: TableRowHeightRule.AT_LEAST, cantSplit: BooleanNumber.TRUE },
        { hRule: TableRowHeightRule.EXACT, cantSplit: BooleanNumber.FALSE },
    ])('does not remeasure fitting table cells when incremental layout paginates precomputed rows ($hRule/$cantSplit)', ({ hRule, cantSplit }) => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const T = DataStreamTreeTokenType;
        const rowCount = 20;
        const columnCount = 2;
        const rows = Array.from({ length: rowCount }, (_, row) => `${T.TABLE_ROW_START}${
            Array.from({ length: columnCount }, (_, col) => `${T.TABLE_CELL_START}Cell ${row} ${col}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}`).join('')
        }${T.TABLE_ROW_END}`).join('');
        const table = `${T.TABLE_START}${rows}${T.TABLE_END}`;
        const dataStream = `${table}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const model = new DocumentDataModel({
            id: 'incremental-table-reuse',
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, i) => ({ startIndex: match.index!, paragraphId: `p-${i}` })),
                sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, i) => ({
                    startIndex: match.index!,
                    sectionId: `s-${i}`,
                    linePitch: 20.8,
                    gridType: GridType.LINES,
                })),
                tables: [{ tableId: 'table', startIndex: 0, endIndex: table.length }],
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
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 260 } },
                    tableRows: Array.from({ length: rowCount }, () => ({
                        tableCells: Array.from({ length: columnCount }, () => ({ size: { type: TableSizeType.SPECIFIED, width: { v: 130 } } })),
                        cantSplit,
                        trHeight: { val: { v: 30 }, hRule },
                    })),
                    tableColumns: Array.from({ length: columnCount }, () => ({ size: { type: TableSizeType.SPECIFIED, width: { v: 130 } } })),
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 300, height: 220 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const synchronous = DocumentSkeleton.create(new DocumentViewModel(model), localeService);
        const incremental = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(structuredClone(model.getSnapshot()))), localeService);
        const builds = vi.spyOn(CellLayout, 'startSkeletonCellPagesBuild');
        let gridPolicyReads = 0;
        model.getBody()!.paragraphs![0].paragraphStyle = {
            get lineSpacing() {
                gridPolicyReads++;
                return undefined;
            },
        };
        const trailingParagraph = model.getBody()!.paragraphs!.at(-1)!;
        const trailingIndex = trailingParagraph.startIndex;
        let trailingIndexReads = 0;
        Object.defineProperty(trailingParagraph, 'startIndex', {
            configurable: true,
            enumerable: true,
            get: () => {
                trailingIndexReads++;
                return trailingIndex;
            },
        });
        try {
            synchronous.calculate();
            // A document-wide grid decision must not inspect this paragraph again for every cell.
            expect(gridPolicyReads).toBeLessThan(rowCount * columnCount);
            // Zero trailing grid space cannot change cell height and needs no document-wide search.
            expect(trailingIndexReads).toBeLessThan(rowCount * columnCount);
            const baselineBuilds = builds.mock.calls.length;
            expect(baselineBuilds).toBeGreaterThanOrEqual(rowCount * columnCount);
            expect(synchronous.getSkeletonData()!.pages.length).toBeGreaterThan(1);
            builds.mockClear();
            completeIncrementalLayout(incremental);
            expect(builds.mock.calls.length).toBeLessThanOrEqual(baselineBuilds);
            const actual = incremental.getSkeletonData()!;
            const expected = synchronous.getSkeletonData()!;
            expect(normalizeSkeleton(actual.pages)).toEqual(normalizeSkeleton(expected.pages));
            expect(normalizeSkeleton(actual.skeHeaders)).toEqual(normalizeSkeleton(expected.skeHeaders));
            expect(normalizeSkeleton(actual.skeFooters)).toEqual(normalizeSkeleton(expected.skeFooters));
            expect(normalizeSkeleton(actual.skeListLevel)).toEqual(normalizeSkeleton(expected.skeListLevel));
            for (const [segmentId, anchors] of expected.drawingAnchor ?? []) {
                const actualAnchors = actual.drawingAnchor?.get(segmentId);
                expect([...actualAnchors!.keys()]).toEqual([...anchors.keys()]);
                for (const [index, anchor] of anchors) {
                    const actualAnchor = actualAnchors!.get(index)!;
                    expect({ ...actualAnchor, elements: [] }).toEqual({ ...anchor, elements: [] });
                    // The synchronous measurement path can retain duplicate lines.
                    // Reusing one measurement must preserve each distinct anchor.
                    const lines = (elements: typeof anchor.elements) => new Set(elements.map((line) =>
                        JSON.stringify(normalizeSkeleton(line))
                    ));
                    expect(lines(actualAnchor.elements)).toEqual(lines(anchor.elements));
                }
            }
        } finally {
            builds.mockRestore();
            measureSpy.mockRestore();
            incremental.dispose();
            synchronous.dispose();
            univer.dispose();
        }
    });

    it.each([
        { scrollLeft: 0, leadingInsetLeft: 0 },
        { scrollLeft: 8, leadingInsetLeft: 4 },
    ])('hit-tests the first visible table column without counting page padding twice ($scrollLeft/$leadingInsetLeft)', ({ scrollLeft, leadingInsetLeft }) => {
        const univer = new Univer();
        const T = DataStreamTreeTokenType;
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Cell${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_CELL_START}Other${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const prefix = `Heading${T.PARAGRAPH}`;
        const dataStream = `${prefix}${table}Tail${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const model = new DocumentDataModel({
            id: 'wide-table-hit-test',
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({ startIndex: match.index!, paragraphId: `wide-table-p-${index}` })),
                sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, index) => ({ startIndex: match.index!, sectionId: `wide-table-s-${index}` })),
                tables: [{ tableId: 'table', startIndex: prefix.length, endIndex: prefix.length + table.length }],
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
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 400 } },
                    tableRows: [{
                        tableCells: [{}, {}],
                        trHeight: { val: { v: 40 }, hRule: TableRowHeightRule.AT_LEAST },
                    }],
                    tableColumns: [0, 1].map(() => ({ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } })),
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 600, height: 700 },
                marginLeft: 96,
                marginRight: 96,
                marginTop: 96,
                marginBottom: 96,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), univer.__getInjector().get(LocaleService));
        try {
            skeleton.calculate();
            const page = skeleton.getSkeletonData()!.pages[0];
            const tableSkeleton = [...page.skeTables.values()][0];
            const cell = tableSkeleton.rows[0].cells[0];
            const section = cell.sections[0];
            const column = section.columns[0];
            const line = column.lines[0];
            const divide = line.divides[0];
            const glyph = divide.glyphGroup[0];
            const x = page.marginLeft + tableSkeleton.left + cell.left + cell.marginLeft + column.left + divide.left + glyph.left + glyph.width / 2;
            const y = page.marginTop + tableSkeleton.top + cell.marginTop + section.top + line.top + line.lineHeight / 2;
            expect(skeleton.findNodeByCoord(new Vector2(x, y), PageLayoutType.VERTICAL, 0, 20)?.node === glyph).toBe(true);
            setDocsTableRenderViewportProvider((unitId, tableId) => unitId === model.getUnitId() && tableId === 'table'
                ? { contentWidth: tableSkeleton.width, viewportWidth: 200, scrollLeft, leadingInsetLeft }
                : null);
            for (const restrictions of [undefined, { strict: false, segmentId: '', segmentPage: -1 }, { strict: true, segmentId: '', segmentPage: -1 }]) {
                expect(skeleton.findNodeByCoord(new Vector2(x - scrollLeft, y), PageLayoutType.VERTICAL, 0, 20, restrictions)?.node === glyph).toBe(true);
            }
        } finally {
            setDocsTableRenderViewportProvider(null);
            skeleton.dispose();
            univer.dispose();
        }
    });

    it('rejects a new caret on retained geometry until the edited page is published', () => {
        const univer = new Univer();
        const skeleton = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel({
                id: 'unpublished-hit-test',
                body: { dataStream: 'Hello\r\n', paragraphs: [{ startIndex: 5, paragraphId: 'paragraph' }] },
                documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 400 } },
            })),
            univer.__getInjector().get(LocaleService)
        );
        skeleton.calculate();
        const page = skeleton.getSkeletonData()!.pages[0];
        const coord = new Vector2(page.marginLeft + 5, page.marginTop + 5);
        expect(skeleton.findNodeByCoord(coord, PageLayoutType.VERTICAL, 0, 20)).toBeTruthy();
        const generation = skeleton.startIncrementalLayout({ reason: 'edit', anchor: 3, reuseUnaffectedTail: false });

        expect(skeleton.findNodeByCoord(coord, PageLayoutType.VERTICAL, 0, 20) == null).toBe(true);
        expect(skeleton.findNodeByCoord(new Vector2(coord.x, page.pageHeight * 10), PageLayoutType.VERTICAL, 0, 20) == null)
            .toBe(true);

        let progress = skeleton.stepIncrementalLayout(generation, 8);
        for (let i = 0; i < 100 && !progress.complete; i++) {
            progress = skeleton.stepIncrementalLayout(generation, 8);
        }
        expect(progress.complete).toBe(true);
        expect(skeleton.findNodeByCoord(coord, PageLayoutType.VERTICAL, 0, 20)).toBeTruthy();
        skeleton.dispose();
        univer.dispose();
    });

    it.each(['isLayoutPlaceholder', 'isMaterializationPlaceholder'] as const)(
        'does not resolve a caret on an %s page to a neighboring page',
        (placeholderFlag) => {
            const univer = new Univer();
            const skeleton = DocumentSkeleton.create(
                new DocumentViewModel(new DocumentDataModel({
                    id: 'placeholder-hit-test',
                    body: { dataStream: 'Hello\r\n', paragraphs: [{ startIndex: 5, paragraphId: 'placeholder-paragraph' }] },
                    documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 400 } },
                })),
                univer.__getInjector().get(LocaleService)
            );
            skeleton.calculate();
            const data = skeleton.getSkeletonData()!;
            const readyPage = data.pages[0];
            const placeholder = {
                ...readyPage,
                [placeholderFlag]: true,
                sections: placeholderFlag === 'isLayoutPlaceholder' ? readyPage.sections : [],
                skeTables: new Map(),
                skeColumnGroups: new Map(),
            };
            data.pages.push(placeholder);
            const x = readyPage.marginLeft + 10;
            for (const offsetY of [1, readyPage.marginTop + 10]) {
                const y = readyPage.pageHeight + 20 + offsetY;
                for (const restrictions of [undefined, { strict: true, segmentId: '', segmentPage: -1 }, { strict: false, segmentId: '', segmentPage: -1 }]) {
                    const hit = skeleton.findNodeByCoord(new Vector2(x, y), PageLayoutType.VERTICAL, 0, 20, restrictions);
                    expect(hit == null).toBe(true);
                }
            }
            expect(skeleton.findNodeByCoord(
                new Vector2(x, readyPage.marginTop + 10),
                PageLayoutType.VERTICAL,
                0,
                20
            )).toBeTruthy();
            skeleton.dispose();
            univer.dispose();
        }
    );

    it('publishes one presentation batch while preserving incompatible flow metrics', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = createDocumentModelWithStyle('Presentation refresh\r', {});
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();

        const drawings = skeleton.getSkeletonData()?.pages[0].skeDrawings;
        expect(drawings).toBeDefined();
        drawings?.set('stable', createSkeletonDrawing('stable', documentModel.getUnitId()));
        drawings?.set('flow-change', createSkeletonDrawing('flow-change', documentModel.getUnitId()));

        const unregister = setDocsCustomBlockRenderViewportProvider((_unitId, drawingId) => ({
            width: drawingId === 'flow-change' ? 101 : 100,
            height: 50,
            contentHeight: 60,
            viewScale: 0.5,
            viewportHeight: 99,
        }));
        const result = skeleton.refreshCustomBlockPresentationViewports();

        expect(result).toEqual({ didRefresh: true, requiresLayout: true });
        expect(drawings?.get('stable')?.customBlockRenderViewport).toMatchObject({
            contentHeight: 60,
            viewScale: 0.5,
            viewportHeight: 99,
        });
        expect(drawings?.get('flow-change')?.customBlockRenderViewport).toMatchObject({
            contentHeight: 50,
            viewScale: 0.5,
            viewportHeight: 99,
        });

        unregister();
        skeleton.dispose();
        univer.dispose();
    });

    it('uses empty paragraph glyphs as mouse hit-test targets', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const emptyParagraphGlyph = {
            st: 4,
            ed: 4,
            count: 1,
            width: 0,
            left: 0,
            xOffset: 0,
            content: '',
            raw: DataStreamTreeTokenType.PARAGRAPH,
            streamType: DataStreamTreeTokenType.PARAGRAPH,
            glyphType: GlyphType.WORD,
        } as any;
        const emptyDivide = {
            st: 4,
            ed: 4,
            left: 0,
            glyphGroup: [emptyParagraphGlyph],
        } as any;
        const emptyLine = {
            st: 4,
            ed: 4,
            top: 30,
            lineHeight: 20,
            divides: [emptyDivide],
        } as any;

        emptyParagraphGlyph.parent = emptyDivide;
        emptyDivide.parent = emptyLine;
        emptyLine.parent = body.column;
        body.column.lines.push(emptyLine);
        body.column.ed = 4;
        body.section.ed = 4;
        body.page.ed = 4;

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        const skeletonData = {
            pages: [body.page],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        (skeleton as any)._skeletonData = skeletonData;
        body.page.parent = skeletonData;

        const node = skeleton.findNodeByCoord(new Vector2(20, 50), PageLayoutType.VERTICAL, 0, 0);

        expect(node?.node).toBe(emptyParagraphGlyph);
    });

    it('covers size and position search for body/header/footer/cell pages', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const header = createPage(DocumentSkeletonPageType.HEADER, 200);
        const footer = createPage(DocumentSkeletonPageType.FOOTER, 300);
        const cell = createPage(DocumentSkeletonPageType.CELL, 100, 'table-1');
        const coveredCell = createPage(DocumentSkeletonPageType.CELL, 0, 'table-1');
        coveredCell.page.ed = 0;
        coveredCell.page.isMergedCellCovered = true;

        const row = { cells: [coveredCell.page, cell.page] } as any;
        const table = { rows: [row], tableId: 'table-1' } as any;
        row.parent = table;
        coveredCell.page.parent = row;
        cell.page.parent = row;
        table.parent = body.page;
        body.page.skeTables = new Map([['table-1', table]]);

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            dispose: vi.fn(),
        } as any;

        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        const skeletonData = {
            pages: [body.page],
            skeHeaders: new Map([
                ['header-seg', new Map([[body.page.pageWidth, header.page]])],
            ]),
            skeFooters: new Map([
                ['footer-seg', new Map([[body.page.pageWidth, footer.page]])],
            ]),
        };
        (skeleton as any)._skeletonData = skeletonData;
        body.page.parent = skeletonData;

        expect(skeleton.getPageSize()).toEqual({ width: 210, height: 297 });
        expect(skeleton.getActualSize()).toEqual({ actualWidth: 200, actualHeight: 80 });
        skeleton.resetInitialWidth();

        const bodyPos = skeleton.findPositionByGlyph(body.glyphs.glyphA as any, 0);
        expect(bodyPos).toEqual(expect.objectContaining({
            pageType: DocumentSkeletonPageType.BODY,
            page: 0,
            glyph: 1,
        }));

        const cellPos = skeleton.findPositionByGlyph(cell.glyphs.glyphA as any, 0);
        expect(cellPos?.pageType).toBe(DocumentSkeletonPageType.CELL);
        expect(cellPos?.path).toEqual(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]);

        const byBodyCoord = skeleton.findGlyphByPosition({
            pageType: DocumentSkeletonPageType.BODY,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            segmentPage: 0,
            path: ['pages', 0],
            isBack: true,
        } as any);
        expect(byBodyCoord).toBe(body.glyphs.glyphA);

        const byHeaderCoord = skeleton.findGlyphByPosition({
            pageType: DocumentSkeletonPageType.HEADER,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 1,
            segmentPage: 0,
            path: ['pages', 0],
            isBack: false,
        } as any);
        expect(byHeaderCoord).toBe(header.glyphs.glyphA);

        const byFooterCoord = skeleton.findGlyphByPosition({
            pageType: DocumentSkeletonPageType.FOOTER,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 2,
            segmentPage: 0,
            path: ['pages', 0],
            isBack: true,
        } as any);
        expect(byFooterCoord).toBe(footer.glyphs.glyphB);

        const headerCell = createPage(DocumentSkeletonPageType.CELL, 400, 'header-table-1');
        const headerRow = { cells: [headerCell.page] } as any;
        const headerTable = { rows: [headerRow], tableId: 'header-table-1' } as any;
        headerRow.parent = headerTable;
        headerCell.page.parent = headerRow;
        headerTable.parent = header.page;
        header.page.skeTables = new Map([['header-table-1', headerTable]]);
        header.page.parent = skeletonData;

        const headerCellPos = skeleton.findPositionByGlyph(headerCell.glyphs.glyphA as any, 0);
        expect(headerCellPos).toEqual(expect.objectContaining({
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['skeTables', 'header-table-1', 'rows', 0, 'cells', 0],
            segmentPage: 0,
        }));
        expect(skeleton.findGlyphByPosition({
            ...headerCellPos,
            isBack: true,
        } as any)).toBe(headerCell.glyphs.glyphA);
        expect(skeleton.findNodePositionByCharIndex(401, true, 'header-seg', 0)).toEqual(expect.objectContaining({
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['skeTables', 'header-table-1', 'rows', 0, 'cells', 0],
            segmentPage: 0,
        }));

        const charIndexBack = skeleton.findCharIndexByPosition({
            pageType: DocumentSkeletonPageType.BODY,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 2,
            segmentPage: 0,
            path: ['pages', 0],
            isBack: true,
        } as any);
        expect(charIndexBack).toBe(2);

        const charIndexFore = skeleton.findCharIndexByPosition({
            pageType: DocumentSkeletonPageType.BODY,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 2,
            segmentPage: 0,
            path: ['pages', 0],
            isBack: false,
        } as any);
        expect(charIndexFore).toBe(4);

        const nodePosBody = skeleton.findNodePositionByCharIndex(2, true);
        expect(nodePosBody?.pageType).toBe(DocumentSkeletonPageType.BODY);
        expect(skeleton.findNodePositionByCharIndex(0)?.pageType).toBe(DocumentSkeletonPageType.BODY);
        const nodePosHeader = skeleton.findNodePositionByCharIndex(201, false, 'header-seg', 0);
        expect(nodePosHeader?.pageType).toBe(DocumentSkeletonPageType.HEADER);
        const nodePosFooter = skeleton.findNodePositionByCharIndex(301, false, 'footer-seg', 0);
        expect(nodePosFooter?.pageType).toBe(DocumentSkeletonPageType.FOOTER);
        const nodePosCell = skeleton.findNodePositionByCharIndex(101, true);
        expect(nodePosCell?.pageType).toBe(DocumentSkeletonPageType.CELL);

        expect(skeleton.findNodeByCharIndex(2)).toBe(body.glyphs.glyphB);
        expect(skeleton.findNodeByCharIndex(0)).toBe(body.glyphs.listGlyph);
        expect(skeleton.findNodeByCharIndex(201, 'header-seg', 0)).toBe(header.glyphs.glyphA);
        expect(skeleton.findNodeByCharIndex(999)).toBeUndefined();

        skeleton.dispose();
        expect(docViewModel.dispose).toHaveBeenCalled();
    });

    it('covers coordinate search helpers and nearest-node strategies', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const header = createPage(DocumentSkeletonPageType.HEADER, 200);
        const footer = createPage(DocumentSkeletonPageType.FOOTER, 300);

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            getHeaderFooterTreeMap: () => ({
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        (skeleton as any)._skeletonData = {
            pages: [body.page],
            skeHeaders: new Map([['header-seg', new Map([[body.page.pageWidth, header.page]])]]),
            skeFooters: new Map([['footer-seg', new Map([[body.page.pageWidth, footer.page]])]]),
        };
        body.page.parent = (skeleton as any)._skeletonData;

        const headerArea = skeleton.findEditAreaByCoord(Vector2.FromArray([20, 5]), PageLayoutType.VERTICAL, 0, 0);
        const bodyArea = skeleton.findEditAreaByCoord(Vector2.FromArray([20, 20]), PageLayoutType.VERTICAL, 0, 0);
        const footerArea = skeleton.findEditAreaByCoord(Vector2.FromArray([20, 75]), PageLayoutType.VERTICAL, 0, 0);
        expect(headerArea.editArea).toBe('HEADER');
        expect(bodyArea.editArea).toBe('BODY');
        expect(['FOOTER', 'BODY']).toContain(footerArea.editArea);

        const hitNode = skeleton.findNodeByCoord(
            Vector2.FromArray([12, 20]),
            PageLayoutType.VERTICAL,
            0,
            0
        );
        expect(hitNode).toBeTruthy();

        const strictNode = skeleton.findNodeByCoord(
            Vector2.FromArray([12, 20]),
            PageLayoutType.VERTICAL,
            0,
            0,
            {
                strict: true,
                segmentId: 'header-seg',
                segmentPage: 0,
            }
        );
        expect(strictNode).toBeUndefined();

        const relaxedNode = skeleton.findNodeByCoord(
            Vector2.FromArray([12, 20]),
            PageLayoutType.VERTICAL,
            0,
            0,
            {
                strict: false,
                segmentId: 'footer-seg',
                segmentPage: 0,
            }
        );
        expect(relaxedNode).toBeUndefined();

        expect((skeleton as any)._getNearestNode([], [])).toBeUndefined();
        expect((skeleton as any)._getNearestNode(
            [{ node: body.glyphs.glyphA }],
            [{ coordInPage: true, distance: 1, nestLevel: 0 }]
        )).toEqual({ node: body.glyphs.glyphA });
        expect((skeleton as any)._getNearestNode(
            [{ node: body.glyphs.glyphA }, { node: body.glyphs.glyphB }],
            [
                { coordInPage: false, distance: 2, nestLevel: 0 },
                { coordInPage: true, distance: 3, nestLevel: 1 },
            ]
        )).toEqual({ node: body.glyphs.glyphB });

        expect((skeleton as any)._getPageBoundingBox(body.page, PageLayoutType.VERTICAL)).toEqual(
            expect.objectContaining({ endX: body.page.pageWidth })
        );
        expect((skeleton as any)._getPageBoundingBox(body.page, PageLayoutType.HORIZONTAL)).toEqual(
            expect.objectContaining({ endY: body.page.pageHeight })
        );

        (skeleton as any)._translatePage(body.page, PageLayoutType.VERTICAL, 1, 2);
        expect((skeleton as any)._findLiquid.x).toBeGreaterThanOrEqual(0);
    });

    it('finds nodes by coordinate inside column group columns', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const columnPage = createPage(DocumentSkeletonPageType.CELL, 100);
        body.column.lines = [];
        body.page.ed = 110;
        body.section.ed = 110;
        body.column.ed = 110;
        columnPage.page.pageWidth = 100;
        columnPage.page.pageHeight = 80;
        columnPage.page.marginLeft = 0;
        columnPage.page.marginTop = 0;
        columnPage.page.marginRight = 0;
        columnPage.page.marginBottom = 0;
        columnPage.glyphs.glyphA.left = 0;
        columnPage.glyphs.glyphA.width = 10;
        columnPage.divide.glyphGroup = [columnPage.glyphs.glyphA];

        const columnGroup = {
            columns: [
                {
                    columnId: 'col-1',
                    left: 60,
                    top: 0,
                    width: 100,
                    height: 80,
                    st: 100,
                    ed: 110,
                    page: columnPage.page,
                },
            ],
            width: 180,
            height: 80,
            top: 30,
            left: 20,
            st: 90,
            ed: 110,
            columnGroupId: 'cg-1',
            parent: body.page,
        } as any;
        columnGroup.columns[0].parent = columnGroup;
        columnPage.page.parent = columnGroup.columns[0];
        body.page.skeColumnGroups.set('cg-1', columnGroup);

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            getHeaderFooterTreeMap: () => ({
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        const skeletonData = {
            pages: [body.page],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        body.page.parent = skeletonData as any;
        (skeleton as any)._skeletonData = skeletonData;

        const node = skeleton.findNodeByCoord(
            Vector2.FromArray([90, 45]),
            PageLayoutType.VERTICAL,
            0,
            0
        );

        expect(node?.node).toBe(columnPage.glyphs.glyphA);
        expect(skeleton.findNodeByCharIndex(100)).toBe(columnPage.glyphs.glyphA);
        expect(skeleton.findNodePositionByCharIndex(110)?.path).toEqual([
            'pages',
            0,
            'skeColumnGroups',
            'cg-1',
            'columns',
            0,
            'page',
        ]);
    });

    it('resolves char positions inside tables nested in column group columns', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const columnPage = createPage(DocumentSkeletonPageType.CELL, 100);
        const cellPage = createPage(DocumentSkeletonPageType.CELL, 130, 'nested-table');
        body.column.lines = [];
        body.page.ed = 150;
        body.section.ed = 150;
        body.column.ed = 150;
        columnPage.page.st = 100;
        columnPage.page.ed = 150;
        columnPage.section.ed = 150;
        columnPage.column.ed = 150;
        cellPage.glyphs.glyphA.left = 0;
        cellPage.glyphs.glyphA.width = 10;
        cellPage.divide.glyphGroup = [cellPage.glyphs.glyphA];

        const row = {
            cells: [cellPage.page],
            index: 0,
            top: 0,
        } as any;
        const table = {
            rows: [row],
            tableId: 'nested-table',
            parent: columnPage.page,
        } as any;
        row.parent = table;
        cellPage.page.parent = row;
        columnPage.page.skeTables = new Map([['nested-table', table]]);

        const columnGroup = {
            columns: [{
                columnId: 'col-1',
                left: 60,
                top: 0,
                width: 100,
                height: 80,
                st: 100,
                ed: 150,
                page: columnPage.page,
            }],
            width: 180,
            height: 80,
            top: 30,
            left: 20,
            st: 90,
            ed: 150,
            columnGroupId: 'cg-1',
            parent: body.page,
        } as any;
        columnGroup.columns[0].parent = columnGroup;
        columnPage.page.parent = columnGroup.columns[0];
        body.page.skeColumnGroups.set('cg-1', columnGroup);

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            getHeaderFooterTreeMap: () => ({
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        const skeletonData = {
            pages: [body.page],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        body.page.parent = skeletonData as any;
        (skeleton as any)._skeletonData = skeletonData;

        expect(skeleton.findNodeByCharIndex(130)).toBe(cellPage.glyphs.glyphA);
        expect(skeleton.findNodePositionByCharIndex(130)?.path).toEqual([
            'pages',
            0,
            'skeColumnGroups',
            'cg-1',
            'columns',
            0,
            'page',
            'skeTables',
            'nested-table',
            'rows',
            0,
            'cells',
            0,
        ]);
    });

    it('does not search column content when the coordinate is below the column group bounds', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const columnPage = createPage(DocumentSkeletonPageType.CELL, 100);
        body.line.top = 130;
        body.page.height = 260;
        body.page.pageHeight = 260;
        body.page.ed = 110;
        body.section.ed = 110;
        body.column.ed = 110;
        columnPage.page.pageWidth = 100;
        columnPage.page.pageHeight = 500;
        columnPage.page.marginLeft = 0;
        columnPage.page.marginTop = 0;
        columnPage.page.marginRight = 0;
        columnPage.page.marginBottom = 0;
        columnPage.glyphs.glyphA.left = 0;
        columnPage.glyphs.glyphA.width = 10;
        columnPage.divide.glyphGroup = [columnPage.glyphs.glyphA];

        const columnGroup = {
            columns: [{
                columnId: 'col-1',
                left: 60,
                top: 0,
                width: 100,
                height: 80,
                st: 100,
                ed: 110,
                page: columnPage.page,
            }],
            width: 180,
            height: 80,
            top: 30,
            left: 20,
            st: 90,
            ed: 110,
            columnGroupId: 'cg-1',
            parent: body.page,
        } as any;
        columnGroup.columns[0].parent = columnGroup;
        columnPage.page.parent = columnGroup.columns[0];
        body.page.skeColumnGroups.set('cg-1', columnGroup);

        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            getHeaderFooterTreeMap: () => ({
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        const skeletonData = {
            pages: [body.page],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        body.page.parent = skeletonData as any;
        (skeleton as any)._skeletonData = skeletonData;

        const node = skeleton.findNodeByCoord(
            Vector2.FromArray([170, 145]),
            PageLayoutType.VERTICAL,
            0,
            0
        );

        expect(Object.values(body.glyphs)).toContain(node?.node);
        expect(node?.node).not.toBe(columnPage.glyphs.glyphA);
    });

    it('covers continuous-section helper and index lookup fallback branches', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 210, height: 297 },
                },
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);
        (skeleton as any)._skeletonData = {
            pages: [body.page],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        };
        body.page.parent = (skeleton as any)._skeletonData;

        const preLen = body.page.sections.length;
        (skeleton as any)._addNewSectionByContinuous(
            body.page,
            [{ width: 100 } as any],
            ColumnSeparatorType.BETWEEN_EACH_COLUMN
        );
        expect(body.page.sections.length).toBe(preLen + 1);

        const noNode = skeleton.findNodeByCharIndex(9999);
        expect(noNode).toBeUndefined();
    });

    it('restores a truncated continuous section in place for incremental layout', () => {
        const body = createPage(DocumentSkeletonPageType.BODY, 0);
        body.page.pageHeight = 300;
        body.section.top = 80;
        body.section.height = 60;
        body.section.colCount = 2;
        const retainedColumn = body.section.columns[0];
        const docViewModel = {
            getDataModel: () => ({
                documentStyle: {
                    pageSize: { width: 200, height: 300 },
                },
            }),
            dispose: vi.fn(),
        } as any;
        const skeleton = new DocumentSkeleton(docViewModel, {} as any);

        (skeleton as any)._restoreContinuousSection(
            body.page,
            [
                { width: 80, paddingEnd: 10 },
                { width: 80, paddingEnd: 0 },
            ],
            ColumnSeparatorType.BETWEEN_EACH_COLUMN
        );

        expect(body.page.sections).toHaveLength(1);
        expect(body.section.top).toBe(80);
        expect(body.section.height).toBe(200);
        expect(body.section.columns).toHaveLength(2);
        expect(body.section.columns[0]).toBe(retainedColumn);
        expect(body.section.columns[1].left).toBe(90);
        expect(body.section.columns[1].parent).toBe(body.section);

        (skeleton as any)._restoreContinuousSection(
            body.page,
            [
                { width: 80, paddingEnd: 10 },
                { width: 80, paddingEnd: 0 },
            ],
            ColumnSeparatorType.BETWEEN_EACH_COLUMN
        );
        expect(body.section.columns).toHaveLength(2);
    });

    it('DOCX golden e2e keeps anchored drawings and continuous columns on stable physical pages', () => {
        const firstTitleParagraph = `First title${DataStreamTreeTokenType.PARAGRAPH}`;
        const secondTitleParagraph = `Second title${DataStreamTreeTokenType.PARAGRAPH}`;
        const anchoredTitleParagraph = `Anchor${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.PARAGRAPH}`;
        const title = `${firstTitleParagraph}${secondTitleParagraph}${anchoredTitleParagraph}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const bodyText = `${'Body text '.repeat(80)}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const documentModel = new DocumentDataModel({
            id: 'continuous-section-after-anchored-title',
            body: {
                dataStream: `${title}${bodyText}`,
                paragraphs: [
                    { startIndex: firstTitleParagraph.length - 1, paragraphId: 'title-1' },
                    { startIndex: firstTitleParagraph.length + secondTitleParagraph.length - 1, paragraphId: 'title-2' },
                    { startIndex: title.length - 2, paragraphId: 'title-anchor' },
                    { startIndex: title.length + bodyText.length - 2, paragraphId: 'body' },
                ],
                sectionBreaks: [
                    { sectionId: 'title-section', startIndex: title.length - 1 },
                    {
                        sectionId: 'body-section',
                        startIndex: title.length + bodyText.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        columnProperties: [
                            { width: 120, paddingEnd: 10 },
                            { width: 120, paddingEnd: 0 },
                        ],
                    },
                ],
                customBlocks: [{ startIndex: firstTitleParagraph.length + secondTitleParagraph.length + 6, blockId: 'title-shape' }],
            },
            drawings: {
                'title-shape': {
                    unitId: 'continuous-section-after-anchored-title',
                    subUnitId: 'continuous-section-after-anchored-title',
                    drawingId: 'title-shape',
                    drawingType: 1,
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    wrapText: WrapTextType.BOTH_SIDES,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 40 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: -30 },
                        size: { width: 150, height: 100 },
                    },
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const viewModel = new DocumentViewModel(documentModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        const createSkeletonSpy = vi.spyOn(skeleton as any, '_createSkeleton');
        const restoreContinuousSectionSpy = vi.spyOn(skeleton as any, '_restoreContinuousSection');

        skeleton.calculate();

        expect(createSkeletonSpy.mock.calls.length).toBeGreaterThan(1);
        expect(restoreContinuousSectionSpy).not.toHaveBeenCalled();
        const firstPageSections = skeleton.getSkeletonData()?.pages[0]?.sections ?? [];
        expect(firstPageSections).toHaveLength(2);
        expect(firstPageSections[0].colCount).toBe(1);
        expect(firstPageSections[0].columns).toHaveLength(1);
        expect(firstPageSections[1].colCount).toBe(2);
        expect(firstPageSections[1].columns).toHaveLength(2);
        expect(firstPageSections[0].columns[0].width).toBeGreaterThan(firstPageSections[1].columns[0].width);
        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect({
            pageCount: pages.length,
            topology: pages.map((page) => ({
                drawings: [...page.skeDrawings.keys()],
                pageNumber: page.pageNumber,
                sectionColumns: page.sections.map((section) => section.columns.length),
                tables: [...page.skeTables.keys()],
            })),
        }).toMatchInlineSnapshot(`
          {
            "pageCount": 1,
            "topology": [
              {
                "drawings": [
                  "title-shape",
                ],
                "pageNumber": 1,
                "sectionColumns": [
                  1,
                  2,
                ],
                "tables": [],
              },
            ],
          }
        `);

        skeleton.dispose();
        univer.dispose();
    });

    it('keeps a later NEXT_PAGE section on a new page during anchored relayout', () => {
        const anchoredParagraph = `Anchor${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.PARAGRAPH}`;
        const title = `${anchoredParagraph}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const bodyText = `Body${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const documentModel = new DocumentDataModel({
            id: 'next-page-section-after-anchored-title',
            body: {
                dataStream: `${title}${bodyText}`,
                paragraphs: [
                    { startIndex: title.length - 2, paragraphId: 'title-anchor' },
                    { startIndex: title.length + bodyText.length - 2, paragraphId: 'body' },
                ],
                sectionBreaks: [
                    { sectionId: 'title-section', startIndex: title.length - 1 },
                    {
                        sectionId: 'body-section',
                        startIndex: title.length + bodyText.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                    },
                ],
                customBlocks: [{ startIndex: 6, blockId: 'title-shape' }],
            },
            drawings: {
                'title-shape': {
                    unitId: 'next-page-section-after-anchored-title',
                    subUnitId: 'next-page-section-after-anchored-title',
                    drawingId: 'title-shape',
                    drawingType: 1,
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    wrapText: WrapTextType.BOTH_SIDES,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 40 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: -30 },
                        size: { width: 150, height: 100 },
                    },
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        const createSkeletonSpy = vi.spyOn(skeleton as any, '_createSkeleton');

        skeleton.calculate();

        expect(createSkeletonSpy.mock.calls.length).toBeGreaterThan(1);
        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);

        const incremental = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        const generation = incremental.startIncrementalLayout({ reason: 'initial' });
        let progress = incremental.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 1_000 && !progress.complete; step++) {
            progress = incremental.stepIncrementalLayout(generation, 0);
        }

        expect(progress.complete).toBe(true);
        expect(normalizeSkeleton(incremental.getSkeletonData())).toEqual(normalizeSkeleton(skeleton.getSkeletonData()));

        incremental.dispose();
        skeleton.dispose();
        univer.dispose();
    });

    it('calculates real skeleton layout from document view model', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);

        const documentModel = createDocumentModelWithStyle(
            'This is a long sentence to trigger wrapping in layout ruler.\rSecond paragraph with tabs\tand punctuation.\r',
            {}
        );
        documentModel.updateDocumentDataPageSize(160, 220);

        const viewModel = new DocumentViewModel(documentModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        expect(skeleton.hasCompleteLayout()).toBe(false);
        skeleton.calculate();
        expect(skeleton.hasCompleteLayout()).toBe(true);

        const skeletonData = skeleton.getSkeletonData();
        expect(skeletonData?.pages.length).toBeGreaterThan(0);

        const glyphGroup = skeletonData?.pages[0]
            ?.sections[0]
            ?.columns[0]
            ?.lines[0]
            ?.divides[0]
            ?.glyphGroup;
        const glyph = glyphGroup?.find((item) => item.content && item.content.trim().length > 0);
        expect(glyph).toBeTruthy();

        const position = skeleton.findPositionByGlyph(glyph as any, 0);
        expect(position?.pageType).toBe(DocumentSkeletonPageType.BODY);

        if (position) {
            const index = skeleton.findCharIndexByPosition({
                ...position,
                isBack: true,
            });
            expect(typeof index).toBe('number');
            expect(skeleton.findNodeByCharIndex(index as number)).toBeTruthy();
        }

        skeleton.dispose();
        univer.dispose();
    });

    it.each([
        ['traditional', DocumentFlavor.TRADITIONAL],
        ['modern', DocumentFlavor.MODERN],
    ])('incremental %s layout converges to the synchronous skeleton', (_, documentFlavor) => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 18 },
            (_, index) => `Paragraph ${index} contains enough words to wrap and exercise resumable document layout.\r`
        ).join('');
        const sourceModel = createDocumentModelWithStyle(content, {});
        sourceModel.updateDocumentStyle({ documentFlavor });
        const snapshot = structuredClone(sourceModel.getSnapshot());
        const syncSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
            localeService
        );
        const incrementalSkeleton = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
            localeService
        );

        syncSkeleton.calculate();
        const generation = incrementalSkeleton.startIncrementalLayout({ anchor: Math.floor(content.length / 3) });
        const progressSnapshots: ReturnType<DocumentSkeleton['stepIncrementalLayout']>[] = [];
        for (let index = 0; index < 100; index++) {
            const progress = incrementalSkeleton.stepIncrementalLayout(generation, 0);
            progressSnapshots.push(progress);
            if (progress.complete) {
                break;
            }
        }

        expect(progressSnapshots.some((progress) => !progress.complete)).toBe(true);
        expect(progressSnapshots.at(-1)?.complete).toBe(true);
        expect(progressSnapshots.at(-1)?.mode).toBe(documentFlavor === DocumentFlavor.MODERN ? 'continuous' : 'paginated');
        expect(normalizeSkeleton(incrementalSkeleton.getSkeletonData())).toEqual(normalizeSkeleton(syncSkeleton.getSkeletonData()));

        syncSkeleton.dispose();
        incrementalSkeleton.dispose();
        univer.dispose();
    });

    it('resolves matching paragraph borders across incrementally finalized page boundaries', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const paragraphToken = DataStreamTreeTokenType.PARAGRAPH;
        const sectionToken = DataStreamTreeTokenType.SECTION_BREAK;
        let dataStream = '';
        const border = {
            color: { rgb: '#555555' },
            width: 2,
            padding: 1,
            dashStyle: DashStyleType.SOLID,
        };
        const paragraphs: IParagraph[] = Array.from({ length: 12 }, (_, index) => {
            dataStream += `Paragraph ${index}${paragraphToken}`;
            return {
                startIndex: dataStream.length - 1,
                paragraphId: `border-paragraph-${index}`,
                paragraphStyle: {
                    lineSpacing: 20,
                    spacingRule: SpacingRule.EXACT,
                    borderTop: border,
                    borderBottom: border,
                    borderBetween: border,
                },
            };
        });
        dataStream += sectionToken;
        const snapshot = {
            id: 'incremental-paragraph-borders',
            body: {
                dataStream,
                paragraphs,
                sectionBreaks: [{ sectionId: 'body-section', startIndex: dataStream.length - 1 }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 180, height: 100 },
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 10,
                marginRight: 10,
            },
        };

        expectIncrementalSkeletonToEqualSynchronous(snapshot, localeService);

        univer.dispose();
    });

    it('keeps a paginated body table structurally identical after incremental layout', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const T = DataStreamTreeTokenType;
        const cellText = 'A long table cell keeps flowing across physical pages. '.repeat(80);
        const tableStream = [
            T.TABLE_START,
            T.TABLE_ROW_START,
            T.TABLE_CELL_START,
            cellText,
            T.PARAGRAPH,
            T.SECTION_BREAK,
            T.TABLE_CELL_END,
            T.TABLE_ROW_END,
            T.TABLE_END,
        ].join('');
        const trailingText = `Paragraph after the table.${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const dataStream = `${tableStream}${trailingText}`;
        const cellParagraphIndex = 3 + cellText.length;
        const snapshot = {
            id: 'incremental-table-equivalence',
            body: {
                dataStream,
                paragraphs: [
                    { startIndex: cellParagraphIndex, paragraphId: 'cell-paragraph' },
                    { startIndex: dataStream.length - 2, paragraphId: 'trailing-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'cell-section', startIndex: cellParagraphIndex + 1 },
                    { sectionId: 'body-section', startIndex: dataStream.length - 1 },
                ],
                tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'body-table' }],
            },
            tableSource: {
                'body-table': {
                    tableId: 'body-table',
                    align: TableAlignmentType.CENTER,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 220 } },
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 220 } } }],
                    tableRows: [{
                        repeatHeaderRow: BooleanNumber.FALSE,
                        trHeight: {
                            hRule: TableRowHeightRule.AUTO,
                            val: { v: 0 },
                        },
                        tableCells: [{ vAlign: VerticalAlignmentType.TOP }],
                    }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 280, height: 220 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        };

        expectIncrementalSkeletonToEqualSynchronous(snapshot, localeService, Math.floor(cellText.length / 2));

        univer.dispose();
    });

    it('publishes a traditional first-open layout one stable page at a time', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 100 },
            (_, index) => `Opening paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        const generation = skeleton.startIncrementalLayout({ reason: 'initial' });
        const publications: number[] = [];
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let index = 0; index < 500 && !progress.complete; index++) {
            if (progress.didPublish) {
                publications.push(progress.publishedPageCount);
            }
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        if (progress.didPublish) {
            publications.push(progress.publishedPageCount);
        }

        expect(progress.complete).toBe(true);
        expect(publications.length).toBeGreaterThan(2);
        expect(publications[0]).toBe(1);
        expect(publications.every((count, index) => index === 0 || count - publications[index - 1] === 1)).toBe(true);

        skeleton.dispose();
        univer.dispose();
    });

    it('keeps already-published adjacent pages visible when editing before first-open layout completes', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 180 },
            (_, index) => `Opening paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const viewModel = new DocumentViewModel(documentModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);

        const initialGeneration = skeleton.startIncrementalLayout({ reason: 'initial' });
        let initialProgress = skeleton.stepIncrementalLayout(initialGeneration, 10_000);
        for (let index = 0; index < 8 && initialProgress.publishedPageCount < 6; index++) {
            initialProgress = skeleton.publishIncrementalLayoutBacklog(initialGeneration);
        }

        expect(initialProgress.complete).toBe(false);
        expect(skeleton.hasCompleteLayout()).toBe(false);
        const initiallyPublishedPages = skeleton.getSkeletonData()?.pages ?? [];
        expect(initiallyPublishedPages.length).toBeGreaterThanOrEqual(6);
        const anchorLine = initiallyPublishedPages[0].sections[0]?.columns[0]?.lines.at(-2);
        if (anchorLine == null) {
            throw new Error('Expected an editable line near the end of the first published page.');
        }
        const anchor = anchorLine.ed;
        const insertion = 'A long inserted phrase '.repeat(20);
        const nextSnapshot = structuredClone(documentModel.getSnapshot());
        const previousDataStream = nextSnapshot.body!.dataStream;
        nextSnapshot.body!.dataStream = `${previousDataStream.slice(0, anchor)}${insertion}${previousDataStream.slice(anchor)}`;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex += insertion.length;
            }
        }
        for (const sectionBreak of nextSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= anchor) {
                sectionBreak.startIndex += insertion.length;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);

        const editGeneration = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + insertion.length,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + insertion.length,
            },
            reuseUnaffectedTail: false,
        });
        let editProgress = skeleton.stepIncrementalLayout(editGeneration, 0);
        for (let index = 0; index < 100 && !editProgress.anchorReady; index++) {
            editProgress = skeleton.stepIncrementalLayout(editGeneration, 0);
        }

        expect(editProgress.anchorReady).toBe(true);
        const adjacentPage = skeleton.getSkeletonData()?.pages[editProgress.publishedPageCount];
        expect(adjacentPage).toBeDefined();
        expect(adjacentPage?.isMaterializationPlaceholder).not.toBe(true);
        expect(adjacentPage?.sections.length).toBeGreaterThan(0);

        nextModel.dispose();
        skeleton.dispose();
        documentModel.dispose();
        univer.dispose();
    });

    it('publishes computed page backlog without advancing layout work', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 100 },
            (_, index) => `Backlog paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        const generation = skeleton.startIncrementalLayout({ reason: 'initial' });
        const first = skeleton.stepIncrementalLayout(generation, 10_000);
        const backlog = skeleton.publishIncrementalLayoutBacklog(generation);

        expect(first.didPublish).toBe(true);
        expect(first.publishedPageCount).toBe(1);
        expect(first.processedBlockCount).toBe(first.totalBlockCount);
        expect(backlog.didPublish).toBe(true);
        expect(backlog.publishedPageCount).toBe(2);
        expect(backlog.processedBlockCount).toBe(first.processedBlockCount);

        skeleton.dispose();
        univer.dispose();
    });

    it('does not report a page backlog for continuous layout', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 100 },
            (_, index) => `Continuous paragraph ${index} remains in one document flow.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        const generation = skeleton.startIncrementalLayout({ reason: 'initial' });
        const first = skeleton.stepIncrementalLayout(generation, 0);
        const backlog = skeleton.publishIncrementalLayoutBacklog(generation);

        expect(first.didPublish).toBe(true);
        expect(backlog.didPublish).toBe(false);
        expect(backlog.processedBlockCount).toBe(first.processedBlockCount);
        expect(backlog.publicationRevision).toBe(first.publicationRevision);

        skeleton.dispose();
        univer.dispose();
    });

    it('merges legacy section identities into one continuous modern page', () => {
        const first = `First modern section${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second modern section${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'modern-legacy-sections',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'legacy-first-section', startIndex: first.length - 1 },
                    { sectionId: 'legacy-second-section', startIndex: first.length + second.length - 1 },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 320, height: 400 },
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        const generation = skeleton.startIncrementalLayout({ reason: 'initial' });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 20 && !progress.complete; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }

        expect(progress).toMatchObject({ complete: true, mode: 'continuous', pageCount: 1 });
        expect(skeleton.getSkeletonData()?.pages).toHaveLength(1);

        skeleton.dispose();
        univer.dispose();
    });

    it('drains pages sequentially when the final block creates a multi-page tail', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const pageBreak = DataStreamTreeTokenType.PAGE_BREAK;
        const tail = Array.from({ length: 20 }, (_, index) => `Tail page ${index}${pageBreak}`).join('');
        const documentModel = createDocumentModelWithStyle(
            `${tail}\r`,
            {}
        );
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        const generation = skeleton.startIncrementalLayout({ reason: 'initial' });
        const publications: number[] = [];
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let index = 0; index < 2_000 && !progress.complete; index++) {
            if (progress.didPublish) {
                publications.push(progress.publishedPageCount);
            }
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        if (progress.didPublish) {
            publications.push(progress.publishedPageCount);
        }

        expect(progress.complete).toBe(true);
        expect(publications.length).toBeGreaterThan(10);
        expect(publications.every((count, index) => index === 0 || count - publications[index - 1] === 1)).toBe(true);
        expect(publications.at(-1)).toBe(skeleton.getSkeletonData()?.pages.length);

        skeleton.dispose();
        univer.dispose();
    });

    it('publishes the edited page first and then advances the affected tail one page at a time', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 140 },
            (_, index) => `Editing paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();
        const previousPages = skeleton.getSkeletonData()!.pages;
        expect(previousPages.length).toBeGreaterThan(7);
        const editedPageIndex = 6;

        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: previousPages[editedPageIndex].st,
        });
        const publications: number[] = [];
        const anchorPublications: boolean[] = [];
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let index = 0; index < 500 && !progress.complete; index++) {
            if (progress.didPublish) {
                publications.push(progress.publishedPageCount);
                anchorPublications.push(progress.didPublishAnchor);
            }
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        if (progress.didPublish) {
            publications.push(progress.publishedPageCount);
            anchorPublications.push(progress.didPublishAnchor);
        }

        expect(progress.complete).toBe(true);
        expect(publications[0]).toBe(editedPageIndex + 1);
        expect(publications.every((count, index) => index === 0 || count - publications[index - 1] === 1)).toBe(true);
        expect(anchorPublications[0]).toBe(true);
        expect(anchorPublications.slice(1).every((didPublishAnchor) => !didPublishAnchor)).toBe(true);

        skeleton.dispose();
        univer.dispose();
    });

    it('reuses the unaffected tail when an insertion keeps the edited page boundary stable', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 140 },
            (_, index) => `Stable paragraph ${index} leaves room for a local insertion.\r`
        ).join('');
        const oldModel = createDocumentModelWithStyle(content, {});
        oldModel.updateDocumentDataPageSize(240, 260);
        const viewModel = new DocumentViewModel(oldModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();
        const previousPages = skeleton.getSkeletonData()!.pages;
        expect(previousPages.length).toBeGreaterThan(7);
        const editedPageIndex = 6;
        const anchor = previousPages[editedPageIndex].st + 5;
        const oldDataStream = oldModel.getBody()!.dataStream;
        const nextContent = `${oldDataStream.slice(0, anchor)}x${oldDataStream.slice(anchor)}`;
        const nextSnapshot = structuredClone(oldModel.getSnapshot());
        nextSnapshot.body!.dataStream = nextContent;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex++;
            }
        }
        for (const sectionBreak of nextSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= anchor) {
                sectionBreak.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);
        const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        expected.calculate();
        const expectedPageCount = expected.getSkeletonData()!.pages.length;

        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + 1,
            },
        });
        const publications: ReturnType<DocumentSkeleton['stepIncrementalLayout']>[] = [];
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let index = 0; index < 500 && !progress.complete; index++) {
            if (progress.didPublish) {
                publications.push(progress);
            }
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        if (progress.didPublish) {
            publications.push(progress);
        }

        expect(progress.complete).toBe(true);
        expect(publications).toHaveLength(1);
        expect(publications[0]).toMatchObject({
            didPublishAnchor: true,
            publishedPageCount: expectedPageCount,
        });
        expect(normalizeSkeleton(skeleton.getSkeletonData()?.pages)).toEqual(
            normalizeSkeleton(expected.getSkeletonData()?.pages)
        );

        expected.dispose();
        skeleton.dispose();
        univer.dispose();
    });

    it.each([
        { layoutType: PositionedObjectLayoutType.INLINE, resize: false, list: false },
        { layoutType: PositionedObjectLayoutType.WRAP_NONE, resize: false, list: false },
        { layoutType: PositionedObjectLayoutType.WRAP_SQUARE, resize: false, list: false },
        { layoutType: PositionedObjectLayoutType.INLINE, resize: true, list: false },
        { layoutType: PositionedObjectLayoutType.INLINE, resize: false, list: true },
    ])('reuses only compatible image-rich pages after hyperlink edits ($layoutType, resize: $resize, list: $list)', ({ layoutType, resize, list }) => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const paragraphs = Array.from({ length: 60 }, (_, index) => `Image ${index} ${DataStreamTreeTokenType.CUSTOM_BLOCK} hyperlink text\r`);
        const model = createDocumentModelWithStyle(paragraphs.join(''), {});
        model.updateDocumentDataPageSize(240, 260);
        const snapshot = structuredClone(model.getSnapshot());
        Object.assign(snapshot.documentStyle!, { marginTop: 20, marginBottom: 20, marginLeft: 20, marginRight: 20 });
        snapshot.drawings = {};
        snapshot.body!.customBlocks = [];
        if (list) {
            for (const paragraph of snapshot.body!.paragraphs ?? []) {
                paragraph.bullet = { listId: 'image-list', listType: PresetListType.ORDER_LIST, nestingLevel: 0 };
            }
        }
        let offset = 0;
        for (const [index, paragraph] of paragraphs.entries()) {
            const id = `image-${index}`;
            const drawing = createSkeletonDrawing(id, snapshot.id).drawingOrigin;
            drawing.layoutType = layoutType;
            snapshot.drawings[id] = drawing;
            snapshot.body!.customBlocks.push({ blockId: id, startIndex: offset + paragraph.indexOf(DataStreamTreeTokenType.CUSTOM_BLOCK) });
            offset += paragraph.length;
        }
        const viewModel = new DocumentViewModel(new DocumentDataModel(snapshot));
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();
        const previousPages = skeleton.getSkeletonData()!.pages;
        expect(previousPages.length).toBeGreaterThan(1);
        expect(previousPages[0].skeDrawings.size).toBeGreaterThan(0);

        for (const customRanges of [[{
            startIndex: 2,
            endIndex: 4,
            rangeId: 'link',
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://example.com' },
        }], []]) {
            const nextSnapshot = structuredClone(snapshot);
            nextSnapshot.body!.customRanges = customRanges;
            if (resize && customRanges.length > 0) {
                nextSnapshot.drawings!['image-0'].docTransform.size.width = 120;
            }
            const nextModel = new DocumentDataModel(nextSnapshot);
            viewModel.reset(nextModel);
            const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
            expected.calculate();
            const generation = skeleton.startIncrementalLayout({
                reason: 'edit',
                anchor: 2,
                invalidation: { oldStart: 2, oldEnd: 5, newEnd: 5 },
            });
            let publications = 0;
            let progress;
            do {
                progress = skeleton.stepIncrementalLayout(generation, 0);
                publications += Number(progress.didPublish);
            } while (!progress.complete);

            if (!resize && layoutType !== PositionedObjectLayoutType.WRAP_SQUARE) {
                expect(publications).toBe(1);
            } else {
                expect(publications).toBeGreaterThan(1);
            }
            expect(normalizeSkeleton(skeleton.getSkeletonData()?.pages)).toEqual(
                normalizeSkeleton(expected.getSkeletonData()?.pages)
            );
            if (layoutType !== PositionedObjectLayoutType.WRAP_SQUARE) {
                expect([...skeleton.getSkeletonData()!.drawingAnchor!.get('')!.keys()].sort((a, b) => a - b)).toEqual(
                    [...expected.getSkeletonData()!.drawingAnchor!.get('')!.keys()].sort((a, b) => a - b)
                );
            }
            if (list) {
                expect(skeleton.getSkeletonData()!.skeListLevel!.get('image-list')!.map((level) => level.map(({ paragraph }) => paragraph.startIndex))).toEqual(
                    expected.getSkeletonData()!.skeListLevel!.get('image-list')!.map((level) => level.map(({ paragraph }) => paragraph.startIndex))
                );
            }
            expected.dispose();
        }
        skeleton.dispose();
        univer.dispose();
    });

    it.each([false, true])('reuses a table page tail for offset-preserving metadata edits (placeholder tail: %s)', (placeholderTail) => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const T = DataStreamTreeTokenType;
        const linkedText = 'Linked table cell';
        const cellText = linkedText;
        const cell = `${cellText}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${cell}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const tail = Array.from(
            { length: 80 },
            (_, index) => `Trailing paragraph ${index} fills later pages.${T.PARAGRAPH}`
        ).join('');
        const dataStream = `${table}${tail}${T.SECTION_BREAK}`;
        const snapshot: IDocumentData = {
            id: 'metadata-only-table-tail-reuse',
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                    startIndex: match.index!,
                    paragraphId: `paragraph-${index}`,
                })),
                sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, index) => ({
                    startIndex: match.index!,
                    sectionId: `section-${index}`,
                })),
                tables: [{ tableId: 'table', startIndex: 0, endIndex: table.length }],
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
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 220 } },
                    tableRows: [{
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 220 } } }],
                        trHeight: { val: { v: 30 }, hRule: TableRowHeightRule.AUTO },
                    }],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 220 } } }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 260, height: 240 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        };
        const viewModel = new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot)));
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();
        const previousPages = skeleton.getSkeletonData()!.pages;
        expect(previousPages.length).toBeGreaterThan(5);
        expect(previousPages[0].skeTables.size).toBe(1);
        if (placeholderTail) {
            skeleton.getSkeletonData()!.pages = previousPages.map((page, index) => {
                if (index < 5) {
                    return page;
                }
                return {
                    ...page,
                    isMaterializationPlaceholder: true,
                    sections: [],
                    skeDrawings: new Map(),
                    skeTables: new Map(),
                    skeColumnGroups: new Map(),
                    parent: undefined,
                };
            });
        }

        const linkStart = dataStream.indexOf(linkedText);
        const linkEnd = linkStart + linkedText.length;
        const nextSnapshot = structuredClone(snapshot);
        nextSnapshot.body!.customRanges = [{
            startIndex: linkStart,
            endIndex: linkEnd - 1,
            rangeId: 'link',
            rangeType: CustomRangeType.HYPERLINK,
            properties: { url: 'https://example.com' },
        }];
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);
        const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        expected.calculate();

        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: linkStart,
            invalidation: { oldStart: linkStart, oldEnd: linkEnd, newEnd: linkEnd },
            allowMetadataOnlyStructuralTailReuse: true,
        } as Parameters<DocumentSkeleton['startIncrementalLayout']>[0]);
        let publications = 0;
        let progress;
        do {
            progress = skeleton.stepIncrementalLayout(generation, 0, 1);
            publications += Number(progress.didPublish);
        } while (!progress.complete);

        expect(publications).toBe(1);
        const actualPages = skeleton.getSkeletonData()!.pages;
        const expectedPages = expected.getSkeletonData()!.pages;
        if (placeholderTail) {
            expect(normalizeSkeleton(actualPages.slice(0, 5))).toEqual(normalizeSkeleton(expectedPages.slice(0, 5)));
            expect(actualPages.slice(5).every((page) => page.isMaterializationPlaceholder)).toBe(true);
            expect(actualPages.map(({ st, ed }) => ({ st, ed }))).toEqual(
                expectedPages.map(({ st, ed }) => ({ st, ed }))
            );
        } else {
            expect(normalizeSkeleton(actualPages)).toEqual(normalizeSkeleton(expectedPages));
        }

        expected.dispose();
        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('rebuilds the active interaction page without synchronously traversing an earlier remote edit', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 180 },
            (_, index) => `Collaborative paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const oldModel = createDocumentModelWithStyle(content, {});
        oldModel.updateDocumentDataPageSize(180, 200);
        const viewModel = new DocumentViewModel(oldModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();
        const previousPages = skeleton.getSkeletonData()!.pages;
        expect(previousPages.length).toBeGreaterThan(10);

        const dirtyPageIndex = 1;
        const activePageIndex = 8;
        const dirtyOffset = previousPages[dirtyPageIndex].st + 2;
        const previousActiveOffset = previousPages[activePageIndex].st + 5;
        const nextSnapshot = structuredClone(oldModel.getSnapshot());
        const previousDataStream = nextSnapshot.body!.dataStream;
        nextSnapshot.body!.dataStream = `${previousDataStream.slice(0, dirtyOffset)}B${previousDataStream.slice(dirtyOffset)}`;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= dirtyOffset) {
                paragraph.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);

        const priorityAnchor = previousActiveOffset + 1;
        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: priorityAnchor,
            priorityAnchor,
            invalidation: {
                oldStart: dirtyOffset,
                oldEnd: dirtyOffset,
                newEnd: dirtyOffset + 1,
            },
            preserveInteractionWindow: true,
        });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 500 && !progress.anchorReady; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }

        expect(progress.anchorReady).toBe(true);
        expect(progress.publishedPageCount).toBeGreaterThanOrEqual(activePageIndex + 1);
        expect(skeleton.getSkeletonData()?.pages[dirtyPageIndex]).toMatchObject({
            isLayoutPlaceholder: true,
        });
        expect(skeleton.findNodePositionByCharIndex(priorityAnchor)?.page).toBeGreaterThanOrEqual(activePageIndex - 1);

        skeleton.dispose();
        nextModel.dispose();
        univer.dispose();
    });

    it('preserves logical offsets after explicit page breaks in a foreground interaction publication', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const pageBreak = DataStreamTreeTokenType.PAGE_BREAK;
        const content = [
            `First explicit page${pageBreak}`,
            `Second explicit page${pageBreak}`,
            `Third explicit page${pageBreak}`,
            `Fourth explicit page${pageBreak}`,
            'The target paragraph ends here.\r',
        ].join('');
        const initialModel = createDocumentModelWithStyle(content, {});
        initialModel.updateDocumentDataPageSize(240, 260);
        const viewModel = new DocumentViewModel(initialModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();

        const initialBody = initialModel.getBody();
        if (initialBody == null) {
            throw new Error('Expected an initial document body');
        }
        const initialStream = initialBody.dataStream;
        const insertionOffset = initialStream.indexOf('ends here') + 'ends here'.length;
        const nextSnapshot = structuredClone(initialModel.getSnapshot());
        if (nextSnapshot.body == null) {
            throw new Error('Expected a cloned document body');
        }
        nextSnapshot.body.dataStream = `${initialStream.slice(0, insertionOffset)}Y${initialStream.slice(insertionOffset)}`;
        for (const paragraph of nextSnapshot.body.paragraphs ?? []) {
            if (paragraph.startIndex >= insertionOffset) {
                paragraph.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);

        const priorityAnchor = insertionOffset + 1;
        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: insertionOffset,
            priorityAnchor,
            invalidation: {
                oldStart: insertionOffset,
                oldEnd: insertionOffset,
                newEnd: priorityAnchor,
            },
            preserveInteractionWindow: true,
        });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 500 && !progress.anchorReady; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }

        expect(progress.anchorReady).toBe(true);
        const position = skeleton.findNodePositionByCharIndex(priorityAnchor, true);
        if (position == null) {
            throw new Error('Expected a caret position for the foreground anchor');
        }
        expect(skeleton.findCharIndexByPosition(position)).toBe(priorityAnchor);
        const skeletonData = skeleton.getSkeletonData();
        if (skeletonData == null) {
            throw new Error('Expected foreground skeleton data');
        }
        const targetGlyph = skeletonData.pages
            .flatMap((page) => page.sections)
            .flatMap((section) => section.columns)
            .flatMap((column) => column.lines)
            .flatMap((line) => line.divides)
            .flatMap((divide) => divide.glyphGroup)
            .find((glyph) => (glyph.raw ?? glyph.content) === 'Y');
        if (targetGlyph == null) {
            throw new Error('Expected the inserted glyph in the foreground skeleton');
        }
        const targetPosition = skeleton.findPositionByGlyph(targetGlyph, -1);
        if (targetPosition == null) {
            throw new Error('Expected a caret position for the inserted glyph');
        }
        expect(skeleton.findCharIndexByPosition({ ...targetPosition, isBack: false })).toBe(priorityAnchor);

        skeleton.dispose();
        nextModel.dispose();
        univer.dispose();
    });

    it('preserves explicit page-break offsets when foreground layout restarts at the document start', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const pageBreak = DataStreamTreeTokenType.PAGE_BREAK;
        const phrase = 'The target paragraph ends here.';
        const content = [
            `First explicit page${pageBreak}`,
            `Second explicit page${pageBreak}`,
            `Third explicit page${pageBreak}`,
            `Fourth explicit page${pageBreak}`,
            `${phrase}\r`,
        ].join('');
        const dataModel = createDocumentModelWithStyle(content, {});
        dataModel.updateDocumentDataPageSize(240, 260);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(dataModel), localeService);
        skeleton.calculate();

        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: 0,
            priorityAnchor: 0,
        });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 500 && progress.publishedPageCount < 5; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }

        const expectedOffset = content.indexOf(phrase) + phrase.length;
        const skeletonData = skeleton.getSkeletonData();
        if (skeletonData == null) {
            throw new Error('Expected foreground skeleton data');
        }
        const targetLine = skeletonData.pages
            .flatMap((page) => page.sections)
            .flatMap((section) => section.columns)
            .flatMap((column) => column.lines)
            .find((line) => line.divides
                .flatMap((divide) => divide.glyphGroup)
                .map((glyph) => glyph.raw ?? glyph.content)
                .join('')
                .includes(phrase));
        if (targetLine == null) {
            throw new Error('Expected the target paragraph in the foreground skeleton');
        }
        const targetText = targetLine.divides
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.raw ?? glyph.content)
            .join('');
        expect(targetLine.st + targetText.indexOf(phrase) + phrase.length).toBe(expectedOffset);

        skeleton.dispose();
        dataModel.dispose();
        univer.dispose();
    });

    it('preserves the cover when a continued paragraph rewinds past an explicit page break', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = `Cover title\r\f\r${'A continued paragraph crosses several physical pages. '.repeat(240)}\r`;
        const model = createDocumentModelWithStyle(content, {});
        model.updateDocumentDataPageSize(240, 260);
        const viewModel = new DocumentViewModel(model);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();
        const initialPages = skeleton.getSkeletonData()!.pages;
        expect(initialPages.length).toBeGreaterThan(4);
        const anchor = initialPages[3].st + 12;
        const nextSnapshot = structuredClone(model.getSnapshot());
        const body = nextSnapshot.body!;
        body.dataStream = `${body.dataStream.slice(0, anchor)}Z${body.dataStream.slice(anchor)}`;
        for (const paragraph of body.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex++;
            }
        }
        for (const section of body.sectionBreaks ?? []) {
            if (section.startIndex >= anchor) {
                section.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        viewModel.reset(nextModel);
        const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        expected.calculate();
        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + 1,
            reuseUnaffectedTail: false,
            invalidation: { oldStart: anchor, oldEnd: anchor, newEnd: anchor + 1 },
        });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 500 && !progress.anchorReady; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(progress.anchorReady).toBe(true);
        expect(skeleton.findNodePositionByCharIndex(anchor + 1)?.page)
            .toBe(expected.findNodePositionByCharIndex(anchor + 1)?.page);
        expect(normalizeSkeleton(skeleton.getSkeletonData()!.pages[0]))
            .toEqual(normalizeSkeleton(expected.getSkeletonData()!.pages[0]));
        for (let step = 0; step < 1000 && !progress.complete; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(progress.complete).toBe(true);
        expect(normalizeSkeleton(skeleton.getSkeletonData())).toEqual(normalizeSkeleton(expected.getSkeletonData()));
        skeleton.dispose();
        expected.dispose();
        nextModel.dispose();
        univer.dispose();
    });

    it('keeps cancelled typing generations anchored to the first dirty physical page', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 140 },
            (_, index) => `Typing paragraph ${index} wraps onto compact physical pages.\r`
        ).join('');
        const initialModel = createDocumentModelWithStyle(content, {});
        initialModel.updateDocumentDataPageSize(160, 180);
        const viewModel = new DocumentViewModel(initialModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);
        skeleton.calculate();

        const initialPages = skeleton.getSkeletonData()!.pages;
        expect(initialPages.length).toBeGreaterThan(7);
        const editedPageIndex = 6;
        const firstDirtyOffset = initialPages[editedPageIndex].ed - 8;
        skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: firstDirtyOffset,
            invalidation: {
                oldStart: firstDirtyOffset,
                oldEnd: firstDirtyOffset,
                newEnd: firstDirtyOffset + 1,
            },
        });

        // Continuous typing can advance the logical caret past the stale page end
        // before the previous generation completes. The replacement page must still
        // be the physical page containing the first uncommitted edit.
        const latestOffset = initialPages[editedPageIndex].ed + 8;
        const latestGeneration = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: latestOffset,
            invalidation: {
                oldStart: latestOffset,
                oldEnd: latestOffset,
                newEnd: latestOffset + 1,
            },
        });
        let progress = skeleton.stepIncrementalLayout(latestGeneration, 0);
        for (let step = 0; step < 500 && !progress.anchorReady; step++) {
            progress = skeleton.stepIncrementalLayout(latestGeneration, 0);
        }
        expect(progress.anchorReady).toBe(true);
        expect(progress.laidOutThrough).toBeGreaterThanOrEqual(latestOffset + 1);

        skeleton.dispose();
        univer.dispose();
    });

    it('reuses a safe single-column prefix for an anchored modern layout', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const paragraphs = Array.from(
            { length: 120 },
            (_, index) => `Modern paragraph ${index} keeps the continuous prefix stable.\r`
        );
        const content = paragraphs.join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const snapshot = structuredClone(documentModel.getSnapshot());
        const skeleton = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
            localeService
        );
        const expected = DocumentSkeleton.create(
            new DocumentViewModel(new DocumentDataModel(structuredClone(snapshot))),
            localeService
        );
        skeleton.calculate();
        expected.calculate();

        const anchor = paragraphs.slice(0, 100).join('').length + 5;
        const generation = skeleton.startIncrementalLayout({ anchor });
        const firstProgress = skeleton.stepIncrementalLayout(generation, 0);

        expect(firstProgress.anchorReady).toBe(true);
        expect(firstProgress.processedBlockCount).toBeGreaterThan(100);
        let finalProgress = firstProgress;
        for (let index = 0; index < 30 && !finalProgress.complete; index++) {
            finalProgress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(finalProgress.complete).toBe(true);
        const actualNormalized = normalizeSkeleton(skeleton.getSkeletonData());
        const expectedNormalized = normalizeSkeleton(expected.getSkeletonData());
        expect(actualNormalized).toEqual(expectedNormalized);

        skeleton.dispose();
        expected.dispose();
        univer.dispose();
    });

    it('falls back to full incremental layout for a complex modern page', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const paragraphs = Array.from(
            { length: 20 },
            (_, index) => `Modern fallback paragraph ${index}.\r`
        );
        const documentModel = createDocumentModelWithStyle(paragraphs.join(''), {});
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.MODERN });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();
        skeleton.getSkeletonData()?.pages[0].skeDrawings.set(
            'complex-drawing',
            createSkeletonDrawing('complex-drawing', documentModel.getUnitId())
        );

        const anchor = paragraphs.slice(0, 15).join('').length + 2;
        const generation = skeleton.startIncrementalLayout({ anchor });
        const firstProgress = skeleton.stepIncrementalLayout(generation, 0);

        expect(firstProgress.anchorReady).toBe(false);
        expect(firstProgress.processedBlockCount).toBe(1);

        skeleton.dispose();
        univer.dispose();
    });

    it('reuses the stable page prefix when an edit anchors a later traditional page', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 120 },
            (_, index) => `Paragraph ${index} has enough text to wrap across several lines on a compact page.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();
        const initialSkeleton = normalizeSkeleton(skeleton.getSkeletonData());
        const initialPages = skeleton.getSkeletonData()?.pages ?? [];
        expect(initialPages.length).toBeGreaterThan(8);

        const anchorPageIndex = 6;
        const anchor = initialPages[anchorPageIndex].st;
        const generation = skeleton.startIncrementalLayout({ anchor });
        expect(skeleton.findNodeByCoord(
            new Vector2(initialPages[0].marginLeft + 5, initialPages[0].marginTop + 5),
            PageLayoutType.VERTICAL,
            0,
            20
        )).toBeTruthy();
        const firstProgress = skeleton.stepIncrementalLayout(generation, 0);

        expect(firstProgress.anchorReady).toBe(false);
        let foregroundProgress = firstProgress;
        for (let index = 0; index < 200 && !foregroundProgress.anchorReady; index++) {
            foregroundProgress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(foregroundProgress.anchorReady).toBe(true);
        expect(foregroundProgress.pageCount).toBeGreaterThanOrEqual(anchorPageIndex + 1);
        expect(foregroundProgress.estimatedPageCount).toBe(initialPages.length);
        expect(foregroundProgress.processedBlockCount).toBeGreaterThan(1);
        expect(skeleton.getSkeletonData()?.pages.every((page) => page.ed >= page.st)).toBe(true);
        expect(skeleton.getSkeletonData()?.pages).toHaveLength(initialPages.length);
        expect(skeleton.findNodePositionByCharIndex(anchor, false)?.page).toBe(anchorPageIndex);
        expect(skeleton.getSkeletonData()?.pages[anchorPageIndex]).toMatchObject({
            st: initialPages[anchorPageIndex].st,
            ed: initialPages[anchorPageIndex].ed,
            height: initialPages[anchorPageIndex].height,
        });
        const publishedAnchorPage = skeleton.getSkeletonData()?.pages[anchorPageIndex];
        const publishedGlyph = publishedAnchorPage?.sections[0]?.columns[0]?.lines[0]?.divides[0]?.glyphGroup[0];
        if (publishedGlyph == null) {
            throw new Error('Expected the foreground publication to contain an addressable glyph.');
        }
        const publishedPosition = skeleton.findPositionByGlyph(publishedGlyph, -1);
        if (publishedPosition == null) {
            throw new Error('Expected the foreground glyph to resolve to a node position.');
        }
        expect(publishedPosition.page).toBe(anchorPageIndex);
        expect(publishedPosition.path).toEqual(['pages', anchorPageIndex]);
        expect(skeleton.findCharIndexByPosition({ ...publishedPosition, isBack: true })).toBeTypeOf('number');
        expect(skeleton.getSkeletonData()?.pages[anchorPageIndex + 1]).toMatchObject({
            isLayoutPlaceholder: true,
            sections: [],
            st: -1,
            ed: -1,
            pageWidth: initialPages[anchorPageIndex + 1].pageWidth,
            pageHeight: initialPages[anchorPageIndex + 1].pageHeight,
        });

        let finalProgress = foregroundProgress;
        for (let index = 0; index < 200 && !finalProgress.complete; index++) {
            finalProgress = skeleton.stepIncrementalLayout(generation, 0);
        }

        expect(finalProgress).toMatchObject({ complete: true, cancelled: false });
        expect(normalizeSkeleton(skeleton.getSkeletonData())).toEqual(initialSkeleton);

        skeleton.dispose();
        univer.dispose();
    });

    it.each([
        { paragraphCount: 20, anchorPageIndex: 0, firstParagraph: true, horizontalAlign: HorizontalAlign.LEFT },
        { paragraphCount: 300, anchorPageIndex: 0, firstParagraph: true, horizontalAlign: HorizontalAlign.LEFT },
        { paragraphCount: 300, anchorPageIndex: 2, firstParagraph: true, horizontalAlign: HorizontalAlign.LEFT },
        { paragraphCount: 300, anchorPageIndex: 2, firstParagraph: false, horizontalAlign: HorizontalAlign.LEFT },
        { paragraphCount: 20, anchorPageIndex: 0, firstParagraph: true, horizontalAlign: HorizontalAlign.CENTER },
    ])('reuses a geometrically stable page tail after a Worker interaction edit ($paragraphCount paragraphs, page $anchorPageIndex, first: $firstParagraph, alignment: $horizontalAlign)', ({ paragraphCount, anchorPageIndex, firstParagraph, horizontalAlign }) => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 8,
            actualBoundingBoxDescent: 2,
        }));
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: paragraphCount },
            (_, index) => `Short paragraph ${index}.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {}, { horizontalAlign });
        documentModel.updateDocumentDataPageSize(600, 600);
        documentModel.updateDocumentStyle({ documentFlavor: DocumentFlavor.TRADITIONAL });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();
        const initialPages = skeleton.getSkeletonData()?.pages ?? [];
        expect(initialPages.length).toBeGreaterThan(anchorPageIndex);
        if (paragraphCount === 20) {
            expect(initialPages).toHaveLength(1);
        }
        const anchorPage = initialPages[anchorPageIndex];
        const anchorLines = anchorPage.sections[0].columns[0].lines;
        expect(anchorLines.length).toBeGreaterThan(2);
        const anchor = anchorLines[firstParagraph ? 0 : Math.floor(anchorLines.length / 2)].st + 1;
        const nextSnapshot = structuredClone(documentModel.getSnapshot());
        const previousDataStream = nextSnapshot.body!.dataStream;
        nextSnapshot.body!.dataStream = `${previousDataStream.slice(0, anchor)}x${previousDataStream.slice(anchor)}`;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex++;
            }
        }
        for (const sectionBreak of nextSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= anchor) {
                sectionBreak.startIndex++;
            }
        }
        const nextModel = new DocumentDataModel(nextSnapshot);
        const viewModel = skeleton.getViewModel();
        viewModel.reset(nextModel);
        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + 1,
            invalidation: {
                oldStart: anchor,
                oldEnd: anchor,
                newEnd: anchor + 1,
            },
            reuseUnaffectedTail: false,
        });
        let foregroundProgress = skeleton.stepIncrementalLayout(generation, 0);
        let foregroundSteps = 1;
        for (; foregroundSteps < 100 && !foregroundProgress.anchorReady; foregroundSteps++) {
            foregroundProgress = skeleton.stepIncrementalLayout(generation, 0);
        }

        expect(foregroundProgress.anchorReady).toBe(true);
        expect(foregroundSteps).toBeLessThanOrEqual(4);
        expect(foregroundSteps).toBeLessThan(anchorLines.length);
        expect(skeleton.findNodePositionByCharIndex(anchor + 1, false)?.page).toBe(anchorPageIndex);
        const firstExpected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        firstExpected.calculate();
        expect(normalizeSkeleton(skeleton.getSkeletonData()?.pages[anchorPageIndex]))
            .toEqual(normalizeSkeleton(firstExpected.getSkeletonData()?.pages[anchorPageIndex]));
        firstExpected.dispose();

        const foregroundPages = skeleton.getSkeletonData()?.pages ?? [];
        const retainedInteractionPages = foregroundPages.slice(
            anchorPageIndex + 1,
            Math.min(initialPages.length, anchorPageIndex + 5)
        );
        expect(retainedInteractionPages.every((page) => !page.isLayoutPlaceholder)).toBe(true);
        retainedInteractionPages.forEach((page, index) => {
            const previousPage = initialPages[anchorPageIndex + index + 1];
            expect(page.st).toBe(previousPage.st + 1);
            expect(page.ed).toBe(previousPage.ed + 1);
            expect(page.sections.length).toBeGreaterThan(0);
        });

        skeleton.cancelIncrementalLayout(generation);
        const secondInsertionOffset = anchor + 1;
        const secondSnapshot = structuredClone(nextModel.getSnapshot());
        const onceEditedDataStream = secondSnapshot.body!.dataStream;
        secondSnapshot.body!.dataStream = `${onceEditedDataStream.slice(0, secondInsertionOffset)}y${onceEditedDataStream.slice(secondInsertionOffset)}`;
        for (const paragraph of secondSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= secondInsertionOffset) {
                paragraph.startIndex++;
            }
        }
        for (const sectionBreak of secondSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= secondInsertionOffset) {
                sectionBreak.startIndex++;
            }
        }
        const secondModel = new DocumentDataModel(secondSnapshot);
        viewModel.reset(secondModel);
        const secondExpected = DocumentSkeleton.create(new DocumentViewModel(secondModel), localeService);
        secondExpected.calculate();
        const secondExpectedSkeleton = normalizeSkeleton(secondExpected.getSkeletonData());
        const secondGeneration = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor: secondInsertionOffset,
            priorityAnchor: secondInsertionOffset + 1,
            invalidation: {
                oldStart: secondInsertionOffset,
                oldEnd: secondInsertionOffset,
                newEnd: secondInsertionOffset + 1,
            },
            reuseUnaffectedTail: false,
        });
        let finalProgress = skeleton.stepIncrementalLayout(secondGeneration, 0);
        let secondForegroundSteps = 1;
        for (; secondForegroundSteps < 100 && !finalProgress.anchorReady; secondForegroundSteps++) {
            finalProgress = skeleton.stepIncrementalLayout(secondGeneration, 0);
        }
        expect(secondForegroundSteps).toBeLessThan(anchorLines.length);
        expect(secondForegroundSteps).toBeLessThanOrEqual(4);
        for (let index = 0; index < 300 && !finalProgress.complete; index++) {
            finalProgress = skeleton.stepIncrementalLayout(secondGeneration, 0);
        }

        expect(finalProgress).toMatchObject({ complete: true, cancelled: false });
        expect(normalizeSkeleton(skeleton.getSkeletonData())).toEqual(secondExpectedSkeleton);

        secondExpected.dispose();
        secondModel.dispose();
        nextModel.dispose();
        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it.each([
        { label: 'wrap', insertion: 'A long inserted phrase '.repeat(30), continuation: false },
        { label: 'paragraph split', insertion: '\r', continuation: false },
        { label: 'continued paragraph', insertion: 'x', continuation: true },
    ])('keeps canonical pagination when a page-first edit requires $label recovery', ({ insertion, continuation }) => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = `${continuation ? 'Long first paragraph '.repeat(200) : 'First paragraph.'}\r${'Following paragraph.\r'.repeat(60)}`;
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(240, 260);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        skeleton.calculate();
        const anchor = continuation ? skeleton.getSkeletonData()!.pages[1].st + 1 : 1;
        const nextModel = createDocumentModelWithStyle(`${content.slice(0, anchor)}${insertion}${content.slice(anchor)}`, {});
        nextModel.updateDocumentDataPageSize(240, 260);
        nextModel.getBody()!.sectionBreaks![0].sectionId = documentModel.getBody()!.sectionBreaks![0].sectionId;
        skeleton.getViewModel().reset(nextModel);
        const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        expected.calculate();
        const generation = skeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + insertion.length,
            invalidation: { oldStart: anchor, oldEnd: anchor, newEnd: anchor + insertion.length },
            reuseUnaffectedTail: false,
        });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let step = 0; step < 100 && !progress.anchorReady; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(progress.anchorReady).toBe(true);
        if (!continuation) {
            const recoveryPage = skeleton.getSkeletonData()?.pages[progress.publishedPageCount];
            expect(recoveryPage).toBeDefined();
            expect(recoveryPage?.isMaterializationPlaceholder).not.toBe(true);
            expect(recoveryPage?.sections.length).toBeGreaterThan(0);
        }
        for (let step = 0; step < 2_000 && !progress.complete; step++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        expect(progress.complete).toBe(true);
        expect(normalizeSkeleton(skeleton.getSkeletonData())).toEqual(normalizeSkeleton(expected.getSkeletonData()));
        expected.dispose();
        skeleton.dispose();
        nextModel.dispose();
        documentModel.dispose();
        univer.dispose();
    });

    it('rebuilds an edit batch without scalar invalidation instead of reusing a stale page tail', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 180 },
            (_, index) => `Batch paragraph ${index} keeps enough text on each physical page.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(240, 260);
        const batchViewModel = new DocumentViewModel(documentModel);
        const preciseViewModel = new DocumentViewModel(documentModel);
        const batchSkeleton = DocumentSkeleton.create(batchViewModel, localeService);
        const preciseSkeleton = DocumentSkeleton.create(preciseViewModel, localeService);

        batchSkeleton.calculate();
        preciseSkeleton.calculate();
        const initialPages = batchSkeleton.getSkeletonData()?.pages ?? [];
        expect(initialPages.length).toBeGreaterThan(3);
        const anchorPage = initialPages[2];
        const anchorLine = anchorPage.sections[0]?.columns[0]?.lines[1];
        if (anchorLine == null) {
            throw new Error('Expected an editable line on the third physical page');
        }
        const anchor = anchorLine.st + 2;
        const insertion = '\rBATCH-LINE';
        const nextSnapshot = structuredClone(documentModel.getSnapshot());
        const previousDataStream = nextSnapshot.body!.dataStream;
        nextSnapshot.body!.dataStream = `${previousDataStream.slice(0, anchor)}${insertion}${previousDataStream.slice(anchor)}`;
        for (const paragraph of nextSnapshot.body!.paragraphs ?? []) {
            if (paragraph.startIndex >= anchor) {
                paragraph.startIndex += insertion.length;
            }
        }
        for (const sectionBreak of nextSnapshot.body!.sectionBreaks ?? []) {
            if (sectionBreak.startIndex >= anchor) {
                sectionBreak.startIndex += insertion.length;
            }
        }

        const nextModel = new DocumentDataModel(nextSnapshot);
        batchViewModel.reset(nextModel);
        preciseViewModel.reset(nextModel);
        const expected = DocumentSkeleton.create(new DocumentViewModel(nextModel), localeService);
        expected.calculate();
        const batchGeneration = batchSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + insertion.length,
            reuseUnaffectedTail: false,
        });
        let batchProgress = batchSkeleton.stepIncrementalLayout(batchGeneration, 0);
        for (let step = 0; step < 2_000 && !batchProgress.complete; step++) {
            batchProgress = batchSkeleton.stepIncrementalLayout(batchGeneration, 0);
        }
        const preciseGeneration = preciseSkeleton.startIncrementalLayout({
            reason: 'edit',
            anchor,
            priorityAnchor: anchor + insertion.length,
            invalidation: {
                newEnd: anchor + insertion.length,
                oldEnd: anchor,
                oldStart: anchor,
            },
            reuseUnaffectedTail: false,
        });
        let preciseProgress = preciseSkeleton.stepIncrementalLayout(preciseGeneration, 0);
        for (let step = 0; step < 2_000 && !preciseProgress.complete; step++) {
            preciseProgress = preciseSkeleton.stepIncrementalLayout(preciseGeneration, 0);
        }

        const expectedSkeleton = normalizeSkeleton(expected.getSkeletonData());
        expect(batchProgress).toMatchObject({ complete: true, cancelled: false });
        expect(preciseProgress).toMatchObject({ complete: true, cancelled: false });
        expect(normalizeSkeleton(batchSkeleton.getSkeletonData())).toEqual(expectedSkeleton);
        expect(normalizeSkeleton(preciseSkeleton.getSkeletonData())).toEqual(expectedSkeleton);

        expected.dispose();
        nextModel.dispose();
        preciseSkeleton.dispose();
        batchSkeleton.dispose();
        univer.dispose();
    });

    it('reuses a plain-paragraph checkpoint when only aggregate page ranges overlap the anchor', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const content = Array.from(
            { length: 120 },
            (_, index) => `Paragraph ${index} has enough text to wrap across several lines on a compact page.\r`
        ).join('');
        const documentModel = createDocumentModelWithStyle(content, {});
        documentModel.updateDocumentDataPageSize(160, 180);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();
        const initialPages = skeleton.getSkeletonData()?.pages ?? [];
        const anchorPageIndex = 6;
        const anchorPage = initialPages[anchorPageIndex];
        const anchor = anchorPage.sections[0].columns[0].lines[0].st;
        const previousFirstPage = initialPages[0];
        initialPages[0].ed = anchorPage.ed;
        anchorPage.st = initialPages[0].st;
        anchorPage.ed = content.length - 1;

        const generation = skeleton.startIncrementalLayout({ anchor });
        let progress = skeleton.stepIncrementalLayout(generation, 0);
        for (let index = 0; index < 200 && !progress.anchorReady; index++) {
            progress = skeleton.stepIncrementalLayout(generation, 0);
        }
        const rebuiltPages = skeleton.getSkeletonData()?.pages ?? [];

        expect(progress.anchorReady).toBe(true);
        expect(progress.laidOutThrough).toBeLessThan(content.length - 1);
        expect(rebuiltPages[0]).toBe(previousFirstPage);

        skeleton.dispose();
        univer.dispose();
    });

    it('cancels an obsolete incremental generation before it can commit', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = createDocumentModelWithStyle('First paragraph.\rSecond paragraph.\rThird paragraph.\r', {});
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);
        const cancelledProgress: number[] = [];
        const subscription = skeleton.layoutProgress$.subscribe((progress) => {
            if (progress.cancelled) {
                cancelledProgress.push(progress.generation);
            }
        });

        const obsoleteGeneration = skeleton.startIncrementalLayout({ anchor: 40 });
        skeleton.stepIncrementalLayout(obsoleteGeneration, 0);
        const currentGeneration = skeleton.startIncrementalLayout({ anchor: 2 });

        expect(skeleton.stepIncrementalLayout(obsoleteGeneration, 0).cancelled).toBe(true);
        expect(cancelledProgress).toContain(obsoleteGeneration);
        expect(skeleton.stepIncrementalLayout(currentGeneration, 0).cancelled).toBe(false);

        subscription.unsubscribe();
        skeleton.dispose();
        univer.dispose();
    });

    it('creates an initial page when the first laid out section is continuous', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);

        const documentModel = new DocumentDataModel({
            id: 'continuous-doc',
            body: {
                dataStream: 'A\r\n',
                textRuns: [
                    {
                        st: 0,
                        ed: 1,
                        ts: {},
                    },
                ],
                paragraphs: [
                    {
                        startIndex: 1,
                        paragraphId: 'para_continuous',
                    },
                ],
                sectionBreaks: [
                    {
                        sectionId: 'section_fixture_301',
                        startIndex: 2,
                        sectionType: SectionType.CONTINUOUS,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: {
                    width: 160,
                    height: 220,
                },
            },
        });

        const viewModel = new DocumentViewModel(documentModel);
        const skeleton = DocumentSkeleton.create(viewModel, localeService);

        expect(() => skeleton.calculate()).not.toThrow();
        expect(skeleton.getSkeletonData()?.pages.length).toBeGreaterThan(0);

        skeleton.dispose();
        univer.dispose();
    });

    it('starts a NEXT_PAGE section on a distinct physical page', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'next-page-sections',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e keeps a nested table in the outer cell skeleton', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const T = DataStreamTreeTokenType;
        const inner = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Inner${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const outer = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}Before${T.PARAGRAPH}${inner}${T.PARAGRAPH}After${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${outer}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const innerStart = outer.indexOf(inner);
        const table = (tableId: string, width: number) => ({
            tableId,
            align: 0,
            indent: { v: 0 },
            textWrap: 0,
            position: {
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
            },
            dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
            size: { type: TableSizeType.SPECIFIED, width: { v: width } },
            tableRows: [{
                tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: width } } }],
                trHeight: { val: { v: 0 }, hRule: 0 },
            }],
            tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: width } } }],
        });
        const documentModel = new DocumentDataModel({
            id: 'nested-table-skeleton',
            body: {
                dataStream,
                tables: [
                    { tableId: 'outer', startIndex: 0, endIndex: outer.length },
                    { tableId: 'inner', startIndex: innerStart, endIndex: innerStart + inner.length },
                ],
                sectionBreaks: [{ sectionId: 'body', startIndex: dataStream.length - 1 }],
            },
            tableSource: {
                outer: table('outer', 280),
                inner: table('inner', 240),
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const outerSkeleton = skeleton.getSkeletonData()?.pages[0]?.skeTables.get('outer');
        const outerCell = outerSkeleton?.rows[0]?.cells[0];
        expect(outerCell?.skeTables.has('inner')).toBe(true);
        expect(outerCell?.skeTables.get('inner')?.rows[0]?.cells[0]?.sections[0]?.columns[0]?.lines.length).toBeGreaterThan(0);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('DOCX golden e2e honors a rendered page break inside a traditional table cell', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const T = DataStreamTreeTokenType;
        const cell = `Before${T.PARAGRAPH}${T.PAGE_BREAK}After${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${cell}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${table}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const documentModel = new DocumentDataModel({
            id: 'rendered-page-break-in-table-cell',
            body: {
                dataStream,
                renderedPageBreaks: [dataStream.indexOf(T.PAGE_BREAK)],
                paragraphs: [
                    { startIndex: dataStream.indexOf(T.PARAGRAPH), paragraphId: 'before' },
                    { startIndex: dataStream.indexOf(T.PARAGRAPH, dataStream.indexOf(T.PAGE_BREAK)), paragraphId: 'after' },
                ],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: table.length }],
                sectionBreaks: [
                    { sectionId: 'cell', startIndex: dataStream.indexOf(T.SECTION_BREAK) },
                    { sectionId: 'body', startIndex: dataStream.length - 1 },
                ],
            },
            tableSource: {
                table: {
                    tableId: 'table',
                    align: 0,
                    indent: { v: 0 },
                    textWrap: 0,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 280 } },
                    tableRows: [{
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                        trHeight: { val: { v: 0 }, hRule: 0 },
                    }],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 200 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages).toHaveLength(2);
        expect(pages.every((page) => [...page.skeTables.keys()].some((tableId) => tableId.startsWith('table')))).toBe(true);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('DOCX golden e2e does not duplicate a table-cell rendered break after natural overflow', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const T = DataStreamTreeTokenType;
        const before = 'Before '.repeat(70);
        const cell = `${before}${T.PARAGRAPH}${T.PAGE_BREAK}After${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${cell}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${table}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const documentModel = new DocumentDataModel({
            id: 'natural-overflow-before-rendered-table-break',
            body: {
                dataStream,
                renderedPageBreaks: [dataStream.indexOf(T.PAGE_BREAK)],
                paragraphs: [
                    { startIndex: dataStream.indexOf(T.PARAGRAPH), paragraphId: 'before' },
                    { startIndex: dataStream.indexOf(T.PARAGRAPH, dataStream.indexOf(T.PAGE_BREAK)), paragraphId: 'after' },
                ],
                tables: [{ tableId: 'table', startIndex: 0, endIndex: table.length }],
                sectionBreaks: [
                    { sectionId: 'cell', startIndex: dataStream.indexOf(T.SECTION_BREAK) },
                    { sectionId: 'body', startIndex: dataStream.length - 1 },
                ],
            },
            tableSource: {
                table: {
                    tableId: 'table',
                    align: 0,
                    indent: { v: 0 },
                    textWrap: 0,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 280 } },
                    tableRows: [{
                        tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                        trHeight: { val: { v: 0 }, hRule: 0 },
                    }],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 280 } } }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 200 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages).toHaveLength(2);
        expect(pages.every((page) => [...page.skeTables.keys()].some((tableId) => tableId.startsWith('table')))).toBe(true);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('keeps the document-grid line height inside a traditional table cell', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const T = DataStreamTreeTokenType;
        const qualifyingCell = `${'一'.repeat(30)}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const compactCell = `${'二'.repeat(30)}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const firstRow = `${T.TABLE_ROW_START}${T.TABLE_CELL_START}${qualifyingCell}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`;
        const secondRow = `${T.TABLE_ROW_START}${T.TABLE_CELL_START}${compactCell}${T.TABLE_CELL_END}${T.TABLE_ROW_END}`;
        const table = `${T.TABLE_START}${firstRow}${secondRow}${T.TABLE_END}`;
        const bodyText = '一'.repeat(100);
        const dataStream = `${table}${bodyText}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const firstParagraph = dataStream.indexOf(T.PARAGRAPH);
        const secondParagraph = dataStream.indexOf(T.PARAGRAPH, firstParagraph + 1);
        const bodyParagraph = table.length + bodyText.length;
        const documentModel = new DocumentDataModel({
            id: 'table-cell-document-grid',
            body: {
                dataStream,
                paragraphs: [firstParagraph, secondParagraph, bodyParagraph].map((startIndex, index) => ({
                    startIndex,
                    paragraphId: `cell-paragraph-${index}`,
                    paragraphStyle: {
                        lineSpacing: 1.5,
                        spacingRule: SpacingRule.AUTO,
                        ...(index === 1 ? {} : { spaceBelow: { v: 10.666666666666666 } }),
                        ...(index === 2 ? { snapToGrid: BooleanNumber.FALSE } : {}),
                    },
                })),
                tables: [{ tableId: 'table', startIndex: 0, endIndex: table.length }],
                sectionBreaks: [
                    {
                        sectionId: 'qualifying-cell-section',
                        startIndex: table.indexOf(T.SECTION_BREAK),
                        linePitch: 20.8,
                        gridType: GridType.LINES,
                    },
                    {
                        sectionId: 'compact-cell-section',
                        startIndex: table.indexOf(T.SECTION_BREAK, table.indexOf(T.SECTION_BREAK) + 1),
                        linePitch: 20.8,
                        gridType: GridType.LINES,
                    },
                    {
                        sectionId: 'body-section',
                        startIndex: dataStream.length - 1,
                        linePitch: 20.8,
                        gridType: GridType.LINES,
                    },
                ],
            },
            tableSource: {
                table: {
                    tableId: 'table',
                    align: 0,
                    indent: { v: 0 },
                    textWrap: 0,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 200 } },
                    tableRows: [
                        {
                            tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } }],
                            trHeight: { val: { v: 0 }, hRule: 0 },
                        },
                        {
                            tableCells: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } }],
                            trHeight: { val: { v: 0 }, hRule: 0 },
                        },
                    ],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 200 } } }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
                adjustLineHeightInTable: BooleanNumber.TRUE,
                textStyle: { fs: 12 },
            },
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const rows = skeleton.getSkeletonData()?.pages[0]?.skeTables.get('table')?.rows ?? [];
        const qualifyingLines = rows[0]?.cells[0]?.sections[0]?.columns[0]?.lines ?? [];
        expect(qualifyingLines.map(({ paragraphIndex, top, lineHeight, spaceBelowApply }) => ({ paragraphIndex, top, lineHeight, spaceBelowApply }))).toEqual([
            { paragraphIndex: firstParagraph, top: 0, lineHeight: 41.6, spaceBelowApply: 10.666666666666666 },
            { paragraphIndex: firstParagraph, top: 41.6, lineHeight: 41.6, spaceBelowApply: 10.666666666666666 },
        ]);
        expect(rows[0]?.height).toBeCloseTo(103.86666666666666);
        const compactLines = rows[1]?.cells[0]?.sections[0]?.columns[0]?.lines ?? [];
        expect(compactLines.map(({ paragraphIndex, top, lineHeight, spaceBelowApply }) => ({ paragraphIndex, top, lineHeight, spaceBelowApply }))).toEqual([
            { paragraphIndex: secondParagraph, top: 0, lineHeight: 23.4, spaceBelowApply: 0 },
            { paragraphIndex: secondParagraph, top: 23.4, lineHeight: 23.4, spaceBelowApply: 0 },
        ]);
        expect(rows[1]?.height).toBeCloseTo(56.8);
        const bodyLines = skeleton
            .getSkeletonData()
            ?.pages[0]
            ?.sections[0]
            ?.columns[0]
            ?.lines
            .filter(({ paragraphIndex }) => paragraphIndex === bodyParagraph) ?? [];
        expect(bodyLines.map(({ lineHeight }) => lineHeight)).toEqual([
            15,
            15,
            15,
        ]);

        const originalSnapshot = structuredClone(documentModel.getSnapshot());
        const nextSnapshot = structuredClone(originalSnapshot);
        nextSnapshot.body!.paragraphs![0].paragraphStyle!.snapToGrid = BooleanNumber.FALSE;
        skeleton.getViewModel().reset(new DocumentDataModel(nextSnapshot));
        skeleton.calculate();
        const changedRows = skeleton.getSkeletonData()!.pages[0].skeTables.get('table')!.rows;
        expect(changedRows[0].height).toBeLessThan(rows[0].height);
        skeleton.getViewModel().reset(new DocumentDataModel(originalSnapshot));
        skeleton.calculate();
        expect(skeleton.getSkeletonData()!.pages[0].skeTables.get('table')!.rows[0].height).toBeCloseTo(rows[0].height);

        const widerGrid = structuredClone(originalSnapshot);
        widerGrid.body!.sectionBreaks!.forEach((section) => {
            section.linePitch = 31.2;
        });
        const widerSkeleton = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(widerGrid)), localeService);
        widerSkeleton.calculate();
        const widerRowHeights = widerSkeleton.getSkeletonData()!.pages[0].skeTables.get('table')!.rows.map((row) => row.height);
        expect(widerRowHeights[0]).not.toBeCloseTo(rows[0].height);

        const combined = structuredClone(originalSnapshot);
        const firstBody = originalSnapshot.body!;
        const secondBody = widerGrid.body!;
        const offset = firstBody.dataStream.length;
        combined.body = {
            ...firstBody,
            dataStream: firstBody.dataStream + secondBody.dataStream,
            paragraphs: [
                ...firstBody.paragraphs!,
                ...secondBody.paragraphs!.map((paragraph) => ({ ...paragraph, startIndex: paragraph.startIndex + offset })),
            ],
            sectionBreaks: [
                ...firstBody.sectionBreaks!,
                ...secondBody.sectionBreaks!.map((section) => ({ ...section, startIndex: section.startIndex + offset, sectionId: `${section.sectionId}-second` })),
            ],
            tables: [...firstBody.tables!, { tableId: 'table-second', startIndex: offset, endIndex: offset + table.length }],
        };
        combined.tableSource!['table-second'] = { ...combined.tableSource!.table, tableId: 'table-second' };
        const combinedSkeleton = DocumentSkeleton.create(new DocumentViewModel(new DocumentDataModel(combined)), localeService);
        combinedSkeleton.calculate();
        const combinedPages = combinedSkeleton.getSkeletonData()!.pages;
        const secondTable = combinedPages.flatMap((page) => [...page.skeTables.values()]).find((item) => item.tableSource.tableId === 'table-second')!;
        expect(secondTable.rows.map((row) => row.height)).toEqual(widerRowHeights);
        combinedSkeleton.dispose();
        widerSkeleton.dispose();

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('reuses an empty page created by a manual break for the following NEXT_PAGE section', () => {
        const first = `First${DataStreamTreeTokenType.PAGE_BREAK}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'page-break-before-next-page-section',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);

        skeleton.dispose();
        univer.dispose();
    });

    it('reuses a marker-only overflow page for the following NEXT_PAGE section', () => {
        const paragraph = DataStreamTreeTokenType.PARAGRAPH;
        const section = DataStreamTreeTokenType.SECTION_BREAK;
        const first = `First${paragraph}Second${paragraph}${section}`;
        const second = `Next${paragraph}${section}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'next-page-after-marker-overflow',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: 'First'.length, paragraphId: 'first-paragraph' },
                    { startIndex: `First${paragraph}Second`.length, paragraphId: 'second-paragraph' },
                    { startIndex: first.length + 'Next'.length, paragraphId: 'next-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 76 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e starts a NEXT_COLUMN section in the next available column', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const columns = [
            { width: 130, paddingEnd: 20 },
            { width: 130, paddingEnd: 0 },
        ];
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'next-column-sections',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1, columnProperties: columns },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_COLUMN,
                        columnProperties: columns,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages).toHaveLength(1);
        expect(pages[0].sections).toHaveLength(2);
        expect(pages[0].sections[1].columns[0].isFull).toBe(true);
        expect(pages[0].sections[1].columns[1].lines.length).toBeGreaterThan(0);

        skeleton.dispose();
        univer.dispose();
    });

    it('keeps NEXT_COLUMN below the top of a preceding continuous section', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const third = `Third${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const columns = [
            { width: 130, paddingEnd: 20 },
            { width: 130, paddingEnd: 0 },
        ];
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-next-column-sections',
            body: {
                dataStream: `${first}${second}${third}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                    { startIndex: first.length + second.length + third.length - 2, paragraphId: 'third-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1, columnProperties: columns },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        columnProperties: columns,
                    },
                    {
                        sectionId: 'third-section',
                        startIndex: first.length + second.length + third.length - 1,
                        sectionType: SectionType.NEXT_COLUMN,
                        columnProperties: columns,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const sections = skeleton.getSkeletonData()?.pages[0].sections ?? [];
        expect(sections).toHaveLength(3);
        expect(sections[2].top).toBe(sections[1].top);
        expect(sections[2].columns[0].isFull).toBe(true);
        expect(sections[2].columns[1].lines.length).toBeGreaterThan(0);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e moves NEXT_COLUMN to the next page when no column remains', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'next-column-overflow',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_COLUMN,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e does not create a blank page for a rendered page break immediately after a section break', () => {
        const first = `Landscape content${DataStreamTreeTokenType.PARAGRAPH.repeat(3)}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `${DataStreamTreeTokenType.PAGE_BREAK}Portrait content${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'rendered-page-break-after-section-break',
            body: {
                dataStream: `${first}${second}`,
                renderedPageBreaks: [first.length],
                paragraphs: [
                    { startIndex: 'Landscape content'.length, paragraphId: 'landscape-content' },
                    { startIndex: 'Landscape content'.length + 1, paragraphId: 'landscape-empty-1' },
                    { startIndex: 'Landscape content'.length + 2, paragraphId: 'landscape-empty-2' },
                    {
                        startIndex: first.length + 'Portrait content'.length + 1,
                        paragraphId: 'portrait-content',
                    },
                ],
                sectionBreaks: [
                    {
                        sectionId: 'landscape-section',
                        startIndex: first.length - 1,
                        pageSize: { width: 400, height: 240 },
                    },
                    {
                        sectionId: 'portrait-section',
                        startIndex: first.length + second.length - 1,
                        pageSize: { width: 240, height: 400 },
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 240, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map((page) => ({
            pageNumber: page.pageNumber,
            pageSize: [page.pageWidth, page.pageHeight],
            lineText: page.sections.flatMap((section) =>
                section.columns.flatMap((column) =>
                    column.lines.flatMap((line) =>
                        line.divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content))
                    )
                )
            ).join('').replace(/[\r\n\f]/g, ''),
        }))).toMatchInlineSnapshot(`
          [
            {
              "lineText": "Landscape content",
              "pageNumber": 1,
              "pageSize": [
                400,
                240,
              ],
            },
            {
              "lineText": "Portrait content",
              "pageNumber": 2,
              "pageSize": [
                240,
                400,
              ],
            },
          ]
        `);

        skeleton.dispose();
        univer.dispose();
    });

    it('does not wrap traditional text only because of the invisible paragraph mark', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text === DataStreamTreeTokenType.PARAGRAPH ? 4 : text.length * 8.833333333333334,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const text = 'Click/tap';
        const dataStream = `${text}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'traditional-invisible-paragraph-mark-width',
            body: {
                dataStream,
                paragraphs: [{ startIndex: text.length, paragraphId: 'click-tap' }],
                sectionBreaks: [{ sectionId: 'body', startIndex: dataStream.length - 1 }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 100, height: 120 },
                marginTop: 10,
                marginBottom: 10,
                marginLeft: 10,
                marginRight: 10,
                paragraphLineGapDefault: 0,
                textStyle: { ff: 'Arial', fs: 11 },
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const lines = skeleton.getSkeletonData()?.pages[0]?.sections[0]?.columns[0]?.lines ?? [];
        expect(lines.map((line) => ({
            text: line.divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content)).join('').replace(/\r/g, ''),
            paragraphMarks: line.divides
                .flatMap((divide) => divide.glyphGroup)
                .filter((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH)
                .length,
        }))).toMatchInlineSnapshot(`
          [
            {
              "paragraphMarks": 1,
              "text": "Click/tap",
            },
          ]
        `);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('DOCX golden e2e adds one skeleton-only filler page for an ODD_PAGE section', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'odd-page-section',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.ODD_PAGE,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2, 3]);
        expect(pages[1].sections.every((section) => section.columns.every((column) => column.lines.length === 0))).toBe(true);
        expect(pages[2].sections.some((section) => section.columns.some((column) => column.lines.length > 0))).toBe(true);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e adds one skeleton-only filler page for an EVEN_PAGE section', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'even-page-section',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.EVEN_PAGE,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageNumberStart: 2,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages.map(({ pageNumber }) => pageNumber)).toEqual([2, 3, 4]);
        expect(pages[1].sections.every((section) => section.columns.every((column) => column.lines.length === 0))).toBe(true);
        expect(pages[2].sections.some((section) => section.columns.some((column) => column.lines.length > 0))).toBe(true);

        skeleton.dispose();
        univer.dispose();
    });

    it('treats an unspecified Section Type as NEXT_PAGE without changing the snapshot value', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'unspecified-section',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.SECTION_TYPE_UNSPECIFIED,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2]);
        expect(documentModel.getBody()?.sectionBreaks?.[1].sectionType).toBe(SectionType.SECTION_TYPE_UNSPECIFIED);

        skeleton.dispose();
        univer.dispose();
    });

    it.each([1, 7])('restarts page numbering from an explicit section pageNumberStart of %i', (pageNumberStart) => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'section-page-number-start',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                        pageNumberStart,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, pageNumberStart]);

        skeleton.dispose();
        univer.dispose();
    });

    it('keeps a continuous section on the current page when only its margins change', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-margin-change',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        marginTop: 30,
                        marginBottom: 30,
                        marginLeft: 30,
                        marginRight: 30,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages).toHaveLength(1);
        expect(pages[0].sections).toHaveLength(2);

        skeleton.dispose();
        univer.dispose();
    });

    it('moves a continuous section when its first line does not fit the current page', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-section-first-line-overflow',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    {
                        startIndex: first.length - 2,
                        paragraphId: 'first-paragraph',
                        paragraphStyle: { lineSpacing: 50, spacingRule: SpacingRule.EXACT },
                    },
                    {
                        startIndex: first.length + second.length - 2,
                        paragraphId: 'second-paragraph',
                        paragraphStyle: { lineSpacing: 50, spacingRule: SpacingRule.EXACT },
                    },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map((page) => ({
            pageNumber: page.pageNumber,
            sectionTops: page.sections.map((section) => section.top),
            paragraphIndexes: page.sections.flatMap((section) =>
                section.columns.flatMap((column) => column.lines.map((line) => line.paragraphIndex))
            ),
        }))).toEqual([
            { pageNumber: 1, sectionTops: [0, 50], paragraphIndexes: [first.length - 2] },
            { pageNumber: 2, sectionTops: [0], paragraphIndexes: [first.length + second.length - 2] },
        ]);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('balances the final page of a multi-column section before a continuous section', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const paragraphToken = DataStreamTreeTokenType.PARAGRAPH;
        const sectionToken = DataStreamTreeTokenType.SECTION_BREAK;
        const firstParagraphs = [
            'Alpha paragraph wraps across the column.',
            'Beta paragraph wraps across the column.',
            'Gamma paragraph wraps across the column.',
            'Delta paragraph wraps across the column.',
        ];
        let first = '';
        const paragraphs = firstParagraphs.map((text, index) => {
            first += `${text}${paragraphToken}`;
            return { startIndex: first.length - 1, paragraphId: `column-paragraph-${index}` };
        });
        first += sectionToken;
        const second = `Following section${paragraphToken}${sectionToken}`;
        paragraphs.push({
            startIndex: first.length + 'Following section'.length,
            paragraphId: 'following-section-paragraph',
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'balanced-continuous-columns',
            body: {
                dataStream: `${first}${second}`,
                paragraphs,
                sectionBreaks: [
                    {
                        sectionId: 'column-section',
                        startIndex: first.length - 1,
                        columnProperties: [
                            { width: 130, paddingEnd: 20 },
                            { width: 130, paddingEnd: 0 },
                        ],
                    },
                    {
                        sectionId: 'following-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        columnProperties: [{ width: 280, paddingEnd: 0 }],
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 500 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        const [columnSection, followingSection] = pages[0].sections;
        expect(pages).toHaveLength(1);
        expect(columnSection.columns.every((column) => column.lines.length > 0)).toBe(true);
        expect(Math.abs((columnSection.columns[0].height ?? 0) - (columnSection.columns[1].height ?? 0)))
            .toBeLessThanOrEqual(Math.max(...columnSection.columns.flatMap((column) => column.lines.map((line) => line.lineHeight))));
        expect(followingSection.top).toBe(columnSection.top + columnSection.height);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('keeps column flow when a continuous section has unchanged column geometry', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const paragraphToken = DataStreamTreeTokenType.PARAGRAPH;
        const sectionToken = DataStreamTreeTokenType.SECTION_BREAK;
        const columns = [
            { width: 130, paddingEnd: 20 },
            { width: 130, paddingEnd: 0 },
        ];
        const first = `Alpha paragraph wraps across the column.${paragraphToken}${sectionToken}`;
        const second = `Following section${paragraphToken}${sectionToken}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-unchanged-columns',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'column-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'following-section-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'column-section', startIndex: first.length - 1, columnProperties: columns },
                    {
                        sectionId: 'following-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        columnProperties: columns,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 500 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        const [columnSection] = pages[0].sections;
        expect(pages).toHaveLength(1);
        expect(columnSection.columns[0].lines.length).toBeGreaterThan(0);
        expect(columnSection.columns[1].lines).toHaveLength(0);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('starts a continuous section on the next page when the current page is full', () => {
        const measureSpy = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as any);
        const paragraphToken = DataStreamTreeTokenType.PARAGRAPH;
        const sectionToken = DataStreamTreeTokenType.SECTION_BREAK;
        const texts = ['First', 'Second', 'Third'];
        let first = '';
        const paragraphs: IParagraph[] = texts.map((text, index) => {
            first += `${text}${paragraphToken}`;
            return {
                startIndex: first.length - 1,
                paragraphId: `full-page-paragraph-${index}`,
                paragraphStyle: { lineSpacing: 20, spacingRule: SpacingRule.EXACT },
            };
        });
        first += sectionToken;
        const second = `Following section${paragraphToken}${sectionToken}`;
        paragraphs.push({
            startIndex: first.length + second.length - 2,
            paragraphId: 'following-section-paragraph',
        });
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-after-full-page',
            body: {
                dataStream: `${first}${second}`,
                paragraphs,
                sectionBreaks: [
                    { sectionId: 'full-page-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'following-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages).toHaveLength(2);
        expect(pages[0].height).toBe(60);
        expect(pages[1].sections[0].top).toBe(0);

        skeleton.dispose();
        univer.dispose();
        measureSpy.mockRestore();
    });

    it('DOCX golden e2e preserves physical page parity when an even-and-odd section restarts numbering', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'section-page-number-parity',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.NEXT_PAGE,
                        pageNumberStart: 1,
                        evenAndOddHeaders: 1,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        expect(skeleton.getSkeletonData()?.pages.map(({ pageNumber }) => pageNumber)).toEqual([1, 2, 1]);

        skeleton.dispose();
        univer.dispose();
    });

    it('starts a continuous section on a new page when its physical page changes', () => {
        const first = `First${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const second = `Second${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const documentModel = new DocumentDataModel({
            id: 'continuous-geometry-change',
            body: {
                dataStream: `${first}${second}`,
                paragraphs: [
                    { startIndex: first.length - 2, paragraphId: 'first-paragraph' },
                    { startIndex: first.length + second.length - 2, paragraphId: 'second-paragraph' },
                ],
                sectionBreaks: [
                    { sectionId: 'first-section', startIndex: first.length - 1 },
                    {
                        sectionId: 'second-section',
                        startIndex: first.length + second.length - 1,
                        sectionType: SectionType.CONTINUOUS,
                        pageSize: { width: 400, height: 320 },
                        pageOrient: PageOrientType.LANDSCAPE,
                        marginLeft: 30,
                        marginRight: 30,
                    },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 320, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        skeleton.calculate();

        const pages = skeleton.getSkeletonData()?.pages ?? [];
        expect(pages.map(({ pageWidth, pageHeight }) => [pageWidth, pageHeight])).toEqual([
            [320, 400],
            [400, 320],
        ]);
        expect(pages[1].pageOrient).toBe(PageOrientType.LANDSCAPE);
        expect(pages[1].marginLeft).toBe(30);

        skeleton.dispose();
        univer.dispose();
    });

    it('DOCX golden e2e lays out a traditional form document with header footer and long fields', () => {
        const univer = new Univer();
        const localeService = univer.__getInjector().get(LocaleService);
        const lines = [
            'FORM AUTHORIZATION',
            '',
            'Customer __________________________________',
            'Identifier __________________________________',
            'Agent',
            'Name __________________________________',
            'Identifier __________________________________',
            'Permissions',
            'review account history and invoices in the customer portal',
            'create and close agreements',
            'other',
            'Valid until ________________________________',
            'Signatures',
            '________________________________ (identifier __________-______)',
            '________________________________ (identifier __________-______)',
            '________________________________ (identifier __________-______)',
            '________________________________ (identifier __________-______)',
        ];
        const dataStream = `${lines.join('\r')}\r\n`;
        const paragraphs = Array.from(dataStream.matchAll(/\r/g)).map((match) => ({
            startIndex: match.index!,
            paragraphId: `p-${match.index}`,
            paragraphStyle: {
                spaceBelow: { v: 8 },
            },
        }));
        const documentModel = new DocumentDataModel({
            id: 'docx-form-doc',
            body: {
                dataStream,
                textRuns: [
                    {
                        st: 0,
                        ed: dataStream.length - 2,
                        ts: {},
                    },
                ],
                paragraphs,
                sectionBreaks: [
                    {
                        sectionId: 'section_fixture_302',
                        startIndex: dataStream.length - 1,
                        pageSize: {
                            width: 793.7333333333332,
                            height: 1122.5333333333333,
                        },
                        marginTop: 37.8,
                        marginBottom: 61.6,
                        marginLeft: 86.93333333333334,
                        marginRight: 98.26666666666667,
                        marginHeader: 37.8,
                        marginFooter: 0,
                        linePitch: 24,
                        defaultHeaderId: 'header',
                        defaultFooterId: 'footer',
                    },
                ],
            },
            headers: {
                header: {
                    headerId: 'header',
                    body: {
                        dataStream: '\x1A\x1B\x1C\b\r\n\x1D\x1C\r\n\x1D\x1C\r\n\x1D\x0E\x0F\r\r\n',
                        paragraphs: [
                            {
                                startIndex: 4,
                                paragraphId: 'header-p-1',
                            },
                            {
                                startIndex: 8,
                                paragraphId: 'header-p-2',
                            },
                            {
                                startIndex: 12,
                                paragraphId: 'header-p-3',
                            },
                            {
                                startIndex: 18,
                                paragraphId: 'header-p-4',
                            },
                            {
                                startIndex: 19,
                                paragraphId: 'header-p-5',
                            },
                        ],
                        sectionBreaks: [
                            {
                                sectionId: 'section_fixture_303',
                                startIndex: 5,
                            },
                            {
                                sectionId: 'section_fixture_304',
                                startIndex: 9,
                            },
                            {
                                sectionId: 'section_fixture_305',
                                startIndex: 13,
                            },
                            {
                                sectionId: 'section_fixture_306',
                                startIndex: 20,
                            },
                        ],
                        tables: [
                            {
                                startIndex: 0,
                                endIndex: 16,
                                tableId: 'header-table',
                            },
                        ],
                    },
                    tableSource: {
                        'header-table': {
                            tableId: 'header-table',
                            align: 0,
                            indent: {
                                v: 0,
                            },
                            size: {
                                type: 0,
                                width: {
                                    v: 0,
                                },
                            },
                            position: {
                                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                            },
                            dist: {
                                distT: 0,
                                distB: 0,
                                distL: 0,
                                distR: 0,
                            },
                            tableRows: [
                                {
                                    tableCells: [{}, {}, {}],
                                    trHeight: {
                                        val: { v: 0 },
                                        hRule: 0,
                                    },
                                },
                            ],
                            tableColumns: [
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 356.8666666666666 } } },
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 264.59999999999997 } } },
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 56.73333333333333 } } },
                            ],
                            textWrap: 0,
                        },
                    },
                },
            },
            footers: {
                footer: {
                    footerId: 'footer',
                    body: {
                        dataStream: '\x1A\x1B\x1CFooter company address\rFooter postal address\rFooter website\r\n\x1D\x1CFooter legal name\rBusiness id\r\n\x1D\x1CNetwork company\rBusiness id\r\n\x1D\x0E\x0F\r\r\n',
                        paragraphs: [
                            {
                                startIndex: 22,
                                paragraphId: 'footer-p-1',
                            },
                            {
                                startIndex: 44,
                                paragraphId: 'footer-p-2',
                            },
                            {
                                startIndex: 59,
                                paragraphId: 'footer-p-3',
                            },
                            {
                                startIndex: 78,
                                paragraphId: 'footer-p-4',
                            },
                            {
                                startIndex: 90,
                                paragraphId: 'footer-p-5',
                            },
                            {
                                startIndex: 107,
                                paragraphId: 'footer-p-6',
                            },
                            {
                                startIndex: 119,
                                paragraphId: 'footer-p-7',
                            },
                            {
                                startIndex: 125,
                                paragraphId: 'footer-p-8',
                            },
                        ],
                        sectionBreaks: [
                            {
                                sectionId: 'section_fixture_307',
                                startIndex: 60,
                            },
                            {
                                sectionId: 'section_fixture_308',
                                startIndex: 91,
                            },
                            {
                                sectionId: 'section_fixture_309',
                                startIndex: 120,
                            },
                            {
                                sectionId: 'section_fixture_310',
                                startIndex: 127,
                            },
                        ],
                        tables: [
                            {
                                startIndex: 0,
                                endIndex: 124,
                                tableId: 'footer-table',
                            },
                        ],
                    },
                    tableSource: {
                        'footer-table': {
                            tableId: 'footer-table',
                            align: 0,
                            indent: {
                                v: 0,
                            },
                            size: {
                                type: 0,
                                width: {
                                    v: 0,
                                },
                            },
                            position: {
                                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                                positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
                            },
                            dist: {
                                distT: 0,
                                distB: 0,
                                distL: 0,
                                distR: 0,
                            },
                            tableRows: [
                                {
                                    tableCells: [{}, {}, {}],
                                    trHeight: {
                                        val: { v: 0 },
                                        hRule: 0,
                                    },
                                },
                            ],
                            tableColumns: [
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 239.33333333333334 } } },
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 204.86666666666667 } } },
                                { size: { type: TableSizeType.SPECIFIED, width: { v: 170.13333333333333 } } },
                            ],
                            textWrap: 0,
                        },
                    },
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
        });

        const skeleton = DocumentSkeleton.create(new DocumentViewModel(documentModel), localeService);

        expect(() => skeleton.calculate()).not.toThrow();
        expect(skeleton.getSkeletonData()?.pages.length).toBeGreaterThan(0);
        expect(skeleton.getSkeletonData()?.skeHeaders.size).toBeGreaterThan(0);
        expect(skeleton.getSkeletonData()?.skeFooters.size).toBeGreaterThan(0);

        expectIncrementalSkeletonToEqualSynchronous(documentModel.getSnapshot(), localeService);

        skeleton.dispose();
        univer.dispose();
    });
});
