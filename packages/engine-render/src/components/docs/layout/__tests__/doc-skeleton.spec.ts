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

import {
    ColumnSeparatorType,
    createDocumentModelWithStyle,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    SectionType,
    TableSizeType,
    Univer,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType, GlyphType, PageLayoutType } from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { DocumentViewModel } from '../../view-model/document-view-model';
import { DocumentSkeleton } from '../doc-skeleton';

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

        const row = { cells: [cell.page] } as any;
        const table = { rows: [row], tableId: 'table-1' } as any;
        row.parent = table;
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
        expect(cellPos?.path).toEqual(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);

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
        const nodePosHeader = skeleton.findNodePositionByCharIndex(201, false, 'header-seg', 0);
        expect(nodePosHeader?.pageType).toBe(DocumentSkeletonPageType.HEADER);
        const nodePosFooter = skeleton.findNodePositionByCharIndex(301, false, 'footer-seg', 0);
        expect(nodePosFooter?.pageType).toBe(DocumentSkeletonPageType.FOOTER);
        const nodePosCell = skeleton.findNodePositionByCharIndex(101, true);
        expect(nodePosCell?.pageType).toBe(DocumentSkeletonPageType.CELL);

        expect(skeleton.findNodeByCharIndex(2)).toBe(body.glyphs.glyphB);
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
        skeleton.calculate();

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

    it('lays out a traditional form document with header footer and long fields', () => {
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

        skeleton.dispose();
        univer.dispose();
    });
});
