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

import type { IParagraph } from '@univerjs/core';
import {
    BooleanNumber,
    ColumnSeparatorType,
    createDocumentModelWithStyle,
    DataStreamTreeTokenType,
    DocumentDataModel,
    DocumentFlavor,
    GridType,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PageOrientType,
    PositionedObjectLayoutType,
    SectionType,
    SpacingRule,
    TableSizeType,
    Univer,
    WrapTextType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType, GlyphType, PageLayoutType } from '../../../../basics/i-document-skeleton-cached';
import { Vector2 } from '../../../../basics/vector2';
import { DocumentViewModel } from '../../view-model/document-view-model';
import { DocumentSkeleton } from '../doc-skeleton';
import { FontCache } from '../shaping-engine/font-cache';

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

        skeleton.dispose();
        univer.dispose();
    });
});
