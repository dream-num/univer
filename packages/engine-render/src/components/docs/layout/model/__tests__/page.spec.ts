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
    BooleanNumber,
    ColumnSeparatorType,
    DocumentBlockRangeType,
    PageOrientType,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType } from '../../../../../basics/i-document-skeleton-cached';
import {
    createNullCellPage,
    createSkeletonCellPages,
    createSkeletonPage,
    expandCellPageHeightForInlineDrawings,
} from '../page';

const dealWithSectionMock = vi.fn();
const updateBlockIndexMock = vi.fn();
const updateInlineDrawingCoordsAndBorderMock = vi.fn();
const resetContextMock = vi.fn();

vi.mock('../../block/section', () => ({
    dealWithSection: (...args: unknown[]) => dealWithSectionMock(...args),
}));

vi.mock('../../tools', () => ({
    resetContext: (...args: unknown[]) => resetContextMock(...args),
    updateBlockIndex: (...args: unknown[]) => updateBlockIndexMock(...args),
    updateInlineDrawingCoordsAndBorder: (...args: unknown[]) => updateInlineDrawingCoordsAndBorderMock(...args),
}));

function createSkeletonResourceReference() {
    return {
        skeHeaders: new Map(),
        skeFooters: new Map(),
        skeListLevel: new Map(),
    } as any;
}

function createDealPage(areaPage: any) {
    return {
        ...areaPage,
        height: 20,
        sections: [
            {
                columns: [
                    {
                        lines: [{ paragraphIndex: 0 }],
                    },
                ],
            },
        ],
        skeDrawings: new Map(),
        skeTables: new Map(),
    };
}

describe('page model', () => {
    it('creates page with header/footer ids and section info', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [createDealPage(areaPage)],
        }));

        const skeletonResourceReference = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference,
            isDirty: false,
        } as any;

        const headerVM = { getChildren: () => [{}] };
        const footerVM = { getChildren: () => [{}] };
        const sectionBreakConfig = {
            sectionId: 'section-page-model',
            pageNumberStart: 1,
            pageSize: { width: 200, height: 300 },
            pageOrient: PageOrientType.PORTRAIT,
            headerIds: {
                defaultHeaderId: 'h-default',
                firstPageHeaderId: 'h-first',
                evenPageHeaderId: 'h-even',
            },
            footerIds: {
                defaultFooterId: 'f-default',
                firstPageFooterId: 'f-first',
                evenPageFooterId: 'f-even',
            },
            useFirstPageHeaderFooter: BooleanNumber.TRUE,
            evenAndOddHeaders: BooleanNumber.TRUE,
            headerTreeMap: new Map([
                ['h-first', headerVM],
                ['h-even', headerVM],
                ['h-default', headerVM],
            ]),
            footerTreeMap: new Map([
                ['f-first', footerVM],
                ['f-even', footerVM],
                ['f-default', footerVM],
            ]),
            columnProperties: [{ width: 60, paddingEnd: 10 }],
            columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            marginTop: 12,
            marginBottom: 14,
            marginHeader: 6,
            marginFooter: 8,
            marginLeft: 10,
            marginRight: 10,
            renderConfig: { a: 1 },
        } as any;

        const firstPage = createSkeletonPage(ctx, sectionBreakConfig, skeletonResourceReference, 1);
        expect(firstPage.headerId).toBe('h-first');
        expect(firstPage.sectionId).toBe('section-page-model');
        expect(firstPage.footerId).toBe('f-first');
        expect(firstPage.pageWidth).toBe(200);
        expect(firstPage.pageHeight).toBe(300);
        expect(firstPage.marginTop).toBe(31);
        expect(firstPage.marginBottom).toBe(33);
        expect(firstPage.sections.length).toBeGreaterThan(0);
        expect(skeletonResourceReference.skeHeaders.get('h-first')?.has(200)).toBe(true);
        expect(skeletonResourceReference.skeFooters.get('f-first')?.has(200)).toBe(true);

        const evenPage = createSkeletonPage(ctx, sectionBreakConfig, skeletonResourceReference, 2);
        expect(evenPage.headerId).toBe('h-even');
        expect(evenPage.footerId).toBe('f-even');
    });

    it('keeps the configured margin when header and footer content fit inside it', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [{
                ...areaPage,
                height: 8,
                sections: [
                    {
                        columns: [
                            {
                                lines: [{ paragraphIndex: 0 }],
                            },
                        ],
                    },
                ],
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        }));

        const skeletonResourceReference = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference,
            isDirty: false,
        } as any;

        const page = createSkeletonPage(
            ctx,
            {
                pageNumberStart: 1,
                pageSize: { width: 200, height: 300 },
                headerIds: { defaultHeaderId: 'h-default' },
                footerIds: { defaultFooterId: 'f-default' },
                headerTreeMap: new Map([['h-default', { getChildren: () => [{}] }]]),
                footerTreeMap: new Map([['f-default', { getChildren: () => [{}] }]]),
                columnProperties: [],
                marginTop: 40,
                marginBottom: 40,
                marginHeader: 6,
                marginFooter: 8,
            } as any,
            skeletonResourceReference,
            1
        );

        expect(page.marginTop).toBe(40);
        expect(page.marginBottom).toBe(40);
    });

    it('does not create negative-width columns for oversized single-column section properties', () => {
        const skeletonResourceReference = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference,
            isDirty: false,
        } as any;

        const page = createSkeletonPage(
            ctx,
            {
                pageNumberStart: 1,
                pageSize: { width: 816, height: 1056 },
                marginLeft: 120,
                marginRight: 120,
                marginTop: 96,
                marginBottom: 96,
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
                columnProperties: [{ width: 624, paddingEnd: 720 }],
                columnSeparatorType: ColumnSeparatorType.NONE,
            } as any,
            skeletonResourceReference,
            1
        );

        expect(page.sections[0].columns.map((column) => column.width)).toEqual([576]);
    });

    it('keeps every oversized DOCX multi-column section usable after fitting gaps', () => {
        const skeletonResourceReference = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference,
            isDirty: false,
        } as any;

        const page = createSkeletonPage(
            ctx,
            {
                pageNumberStart: 1,
                pageSize: { width: 793.7333333333332, height: 1122.5333333333333 },
                marginLeft: 48,
                marginRight: 48,
                marginTop: 48,
                marginBottom: 48,
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
                columnProperties: [
                    { width: 201.06666666666663, paddingEnd: 709 },
                    { width: 201.06666666666663, paddingEnd: 709 },
                    { width: 201.06666666666663, paddingEnd: 0 },
                ],
                columnSeparatorType: ColumnSeparatorType.NONE,
            } as any,
            skeletonResourceReference,
            1
        );

        const columns = page.sections[0].columns;
        expect(columns).toHaveLength(3);
        expect(columns.every((column) => column.width > 0)).toBe(true);
        expect(columns.at(-1)!.left + columns.at(-1)!.width).toBeLessThanOrEqual(697.7333333333332);
    });

    it('creates null cell page and skeleton cell pages', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [createDealPage(areaPage)],
        }));

        const skeletonResourceReference = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference,
            isDirty: false,
        } as any;

        const tableConfig = {
            tableId: 'table-1',
            cellMargin: {
                start: { v: 2 },
                end: { v: 3 },
                top: { v: 4 },
                bottom: { v: 5 },
            },
            tableRows: [
                {
                    tableCells: [
                        {},
                    ],
                },
            ],
            tableColumns: [
                {
                    size: { width: { v: 80 } },
                },
            ],
        } as any;

        const sectionBreakConfig = {
            lists: [],
            localeService: {} as any,
            drawings: {},
            pageSize: { width: 300, height: 200 },
            headerTreeMap: new Map(),
            footerTreeMap: new Map(),
        } as any;

        const nullPageResult = createNullCellPage(
            ctx,
            sectionBreakConfig,
            tableConfig,
            0,
            0,
            120,
            300
        );
        expect(nullPageResult.page.type).toBe(DocumentSkeletonPageType.CELL);
        expect(nullPageResult.page.segmentId).toBe('table-1');
        expect(nullPageResult.page.pageWidth).toBe(80);

        const viewModel = {} as any;
        const cellNode = {
            startIndex: 10,
            children: [{}],
        } as any;
        const pages = createSkeletonCellPages(
            ctx,
            viewModel,
            cellNode,
            sectionBreakConfig,
            tableConfig,
            0,
            0,
            100,
            300
        );

        expect(pages).toHaveLength(1);
        expect(pages[0].type).toBe(DocumentSkeletonPageType.CELL);
        expect(pages[0].segmentId).toBe('table-1');
        expect(updateBlockIndexMock).toHaveBeenCalled();
        expect(updateInlineDrawingCoordsAndBorderMock).toHaveBeenCalled();
    });

    it('shrinks default cell margins for extremely narrow table columns', () => {
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference: createSkeletonResourceReference(),
            isDirty: false,
        } as any;
        const sectionBreakConfig = {
            lists: [],
            localeService: {} as any,
            drawings: {},
            pageSize: { width: 300, height: 200 },
            headerTreeMap: new Map(),
            footerTreeMap: new Map(),
        } as any;
        const tableConfig = {
            tableId: 'narrow-table',
            tableRows: [{ tableCells: [{}] }],
            tableColumns: [{ size: { width: { v: 0.8 } } }],
        } as any;

        const { page, sectionBreakConfig: cellSectionBreakConfig } = createNullCellPage(
            ctx,
            sectionBreakConfig,
            tableConfig,
            0,
            0
        );

        expect(page.pageWidth).toBe(0.8);
        expect(cellSectionBreakConfig.marginLeft! + cellSectionBreakConfig.marginRight!).toBeLessThan(page.pageWidth);
        expect(page.sections[0].columns[0].width).toBeGreaterThan(0);
    });

    it('adds trailing block range spacing to table cell height when the block range is the last cell element', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [{
                ...areaPage,
                height: 20,
                sections: [
                    {
                        columns: [
                            {
                                lines: [{ paragraphIndex: 12, spaceBelowApply: 28 }],
                            },
                        ],
                    },
                ],
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        }));

        const ctx = {
            dataModel: {
                getBody: () => ({
                    blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 10, endIndex: 14 }],
                    paragraphs: [{ startIndex: 12, paragraphId: 'para_page_header' }],
                }),
            },
            layoutStartPointer: {},
            skeletonResourceReference: createSkeletonResourceReference(),
            isDirty: false,
        } as any;
        const pages = createSkeletonCellPages(
            ctx,
            {} as any,
            { startIndex: 9, endIndex: 16, children: [{}] } as any,
            {
                columnProperties: [],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: 0,
                startIndex: 0,
            } as any,
            {
                tableId: 'table-1',
                tableRows: [{ tableCells: [{}] }],
                tableColumns: [{ size: { width: { v: 80 } } }],
            } as any,
            0,
            0
        );

        expect(pages[0].height).toBe(48);
    });

    it('expands table cell height to include inline drawings', () => {
        const page = {
            height: 20,
            skeDrawings: new Map([
                ['shape-1', {
                    aTop: 6,
                    height: 48,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.INLINE,
                    },
                }],
                ['float-1', {
                    aTop: 10,
                    height: 100,
                    drawingOrigin: {
                        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    },
                }],
            ]),
        };

        expandCellPageHeightForInlineDrawings([page as never]);

        expect(page.height).toBe(54);
    });

    it('does not add trailing block range spacing when content follows in the cell', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [{
                ...areaPage,
                height: 20,
                sections: [
                    {
                        columns: [
                            {
                                lines: [{ paragraphIndex: 12, spaceBelowApply: 28 }],
                            },
                        ],
                    },
                ],
                skeDrawings: new Map(),
                skeTables: new Map(),
            }],
        }));

        const ctx = {
            dataModel: {
                getBody: () => ({
                    blockRanges: [{ blockId: 'callout-1', blockType: DocumentBlockRangeType.CALLOUT, startIndex: 10, endIndex: 14 }],
                    paragraphs: [
                        { startIndex: 12, paragraphId: 'para_page_header_1' },
                        { startIndex: 15, paragraphId: 'para_page_header_2' },
                    ],
                }),
            },
            layoutStartPointer: {},
            skeletonResourceReference: createSkeletonResourceReference(),
            isDirty: false,
        } as any;
        const pages = createSkeletonCellPages(
            ctx,
            {} as any,
            { startIndex: 9, endIndex: 16, children: [{}] } as any,
            {
                columnProperties: [],
                columnSeparatorType: ColumnSeparatorType.NONE,
                sectionType: 0,
                startIndex: 0,
            } as any,
            {
                tableId: 'table-1',
                tableRows: [{ tableCells: [{}] }],
                tableColumns: [{ size: { width: { v: 80 } } }],
            } as any,
            0,
            0
        );

        expect(pages[0].height).toBe(20);
    });
});
