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

import { ColumnSeparatorType, createDocumentModelWithStyle, LocaleService, Univer } from '@univerjs/core';
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
});
