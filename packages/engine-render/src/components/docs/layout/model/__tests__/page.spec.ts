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
    DocumentFlavor,
    GridType,
    PageOrientType,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType } from '../../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy } from '../../../document-compatibility';
import {
    createNullCellPage,
    createSkeletonCellPages,
    createSkeletonPage,
    expandCellPageHeightForFlowTables,
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

    it('keeps traditional document margins when header and footer content overlap the body', () => {
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => ({
            pages: [{
                ...areaPage,
                height: 80,
                sections: [{ columns: [{ lines: [{ paragraphIndex: 0 }] }] }],
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
                pageSize: { width: 816, height: 1056 },
                headerIds: { defaultHeaderId: 'h-default' },
                footerIds: { defaultFooterId: 'f-default' },
                headerTreeMap: new Map([['h-default', { getChildren: () => [{}] }]]),
                footerTreeMap: new Map([['f-default', { getChildren: () => [{}] }]]),
                columnProperties: [],
                marginTop: 24,
                marginBottom: 42,
                marginHeader: 24,
                marginFooter: 24,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            } as any,
            skeletonResourceReference,
            1
        );

        expect(page.originMarginTop).toBe(24);
        expect(page.marginTop).toBe(24);
        expect(page.originMarginBottom).toBe(42);
        expect(page.marginBottom).toBe(42);
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

    it('preserves document text-layout settings in a table cell section', () => {
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference: createSkeletonResourceReference(),
            isDirty: false,
        } as any;
        const compatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL);
        const sectionBreakConfig = {
            sectionId: 'traditional-section',
            lists: [],
            localeService: {} as any,
            drawings: {},
            pageSize: { width: 300, height: 200 },
            headerTreeMap: new Map(),
            footerTreeMap: new Map(),
            documentCompatibilityPolicy: compatibilityPolicy,
            documentTextStyle: { ff: '宋体', fs: 12 },
            paragraphLineGapDefault: 2,
            defaultTabStop: 28,
            adjustLineHeightInTable: BooleanNumber.TRUE,
            characterSpacingControl: 2,
            useFELayout: BooleanNumber.TRUE,
            spaceWidthEastAsian: BooleanNumber.TRUE,
            autoHyphenation: BooleanNumber.TRUE,
            consecutiveHyphenLimit: 3,
            doNotHyphenateCaps: BooleanNumber.TRUE,
            hyphenationZone: 12,
            charSpace: 1,
            linePitch: 20.8,
            gridType: GridType.LINES,
            renderConfig: { horizontalAlign: 1 },
        } as any;
        const tableConfig = {
            tableId: 'traditional-table',
            tableRows: [{ tableCells: [{}] }],
            tableColumns: [{ size: { width: { v: 120 } } }],
        } as any;

        const { sectionBreakConfig: cellConfig } = createNullCellPage(
            ctx,
            sectionBreakConfig,
            tableConfig,
            0,
            0
        );

        expect({
            documentTextStyle: cellConfig.documentTextStyle,
            paragraphLineGapDefault: cellConfig.paragraphLineGapDefault,
            defaultTabStop: cellConfig.defaultTabStop,
            adjustLineHeightInTable: cellConfig.adjustLineHeightInTable,
            characterSpacingControl: cellConfig.characterSpacingControl,
            useFELayout: cellConfig.useFELayout,
            spaceWidthEastAsian: cellConfig.spaceWidthEastAsian,
            autoHyphenation: cellConfig.autoHyphenation,
            consecutiveHyphenLimit: cellConfig.consecutiveHyphenLimit,
            doNotHyphenateCaps: cellConfig.doNotHyphenateCaps,
            hyphenationZone: cellConfig.hyphenationZone,
            charSpace: cellConfig.charSpace,
            linePitch: cellConfig.linePitch,
            gridType: cellConfig.gridType,
            renderConfig: cellConfig.renderConfig,
        }).toEqual({
            documentTextStyle: { ff: '宋体', fs: 12 },
            paragraphLineGapDefault: 2,
            defaultTabStop: 28,
            adjustLineHeightInTable: BooleanNumber.TRUE,
            characterSpacingControl: 2,
            useFELayout: BooleanNumber.TRUE,
            spaceWidthEastAsian: BooleanNumber.TRUE,
            autoHyphenation: BooleanNumber.TRUE,
            consecutiveHyphenLimit: 3,
            doNotHyphenateCaps: BooleanNumber.TRUE,
            hyphenationZone: 12,
            charSpace: 1,
            linePitch: 20.8,
            gridType: GridType.LINES,
            renderConfig: { horizontalAlign: 1 },
        });
        expect(cellConfig.documentCompatibilityPolicy).toBe(compatibilityPolicy);

        const { sectionBreakConfig: compactCellConfig } = createNullCellPage(
            ctx,
            sectionBreakConfig,
            tableConfig,
            0,
            0,
            Number.POSITIVE_INFINITY,
            Number.POSITIVE_INFINITY,
            false
        );

        expect({
            documentTextStyle: compactCellConfig.documentTextStyle,
            documentCompatibilityPolicy: compactCellConfig.documentCompatibilityPolicy,
            adjustLineHeightInTable: compactCellConfig.adjustLineHeightInTable,
            linePitch: compactCellConfig.linePitch,
        }).toEqual({
            documentTextStyle: sectionBreakConfig.documentTextStyle,
            documentCompatibilityPolicy: compatibilityPolicy,
            adjustLineHeightInTable: BooleanNumber.TRUE,
            linePitch: undefined,
        });
    });

    it('finishes dirty floating-object relayout inside the table cell segment', () => {
        dealWithSectionMock.mockClear();
        resetContextMock.mockClear();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference: createSkeletonResourceReference(),
            isDirty: false,
        } as any;
        resetContextMock.mockImplementationOnce(() => {
            ctx.isDirty = false;
        });
        dealWithSectionMock
            .mockImplementationOnce((_ctx: any, _vm: any, _node: any, areaPage: any) => {
                ctx.isDirty = true;
                ctx.layoutStartPointer['table-1'] = 7;
                return {
                    pages: [
                        { ...createDealPage(areaPage), pageNumber: 1 },
                        { ...createDealPage(areaPage), pageNumber: 2 },
                    ],
                };
            })
            .mockImplementationOnce((_ctx: any, _vm: any, _node: any, areaPage: any, _config: any, layoutAnchor: any) => {
                expect(layoutAnchor).toBe(7);
                expect(areaPage.pageNumber).toBe(2);
                return { pages: [createDealPage(areaPage)] };
            });

        const pages = createSkeletonCellPages(
            ctx,
            {} as any,
            { startIndex: 10, endIndex: 20, children: [{}] } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
                pageSize: { width: 300, height: 200 },
                headerTreeMap: new Map(),
                footerTreeMap: new Map(),
            } as any,
            {
                tableId: 'table-1',
                tableRows: [{ tableCells: [{}] }],
                tableColumns: [{ size: { width: { v: 80 } } }],
            } as any,
            0,
            0
        );

        expect(pages.map((page) => page.pageNumber)).toEqual([1, 2]);
        expect(ctx.isDirty).toBe(false);
        expect(ctx.layoutStartPointer['table-1']).toBeNull();
        expect(dealWithSectionMock).toHaveBeenCalledTimes(2);
        expect(resetContextMock).toHaveBeenCalledTimes(1);
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

    it('keeps the outer table height constraint when a cell contains a rendered page break', () => {
        let initialPageHeight = 0;
        dealWithSectionMock.mockImplementation((_ctx: any, _vm: any, _node: any, areaPage: any) => {
            initialPageHeight = areaPage.pageHeight;
            return { pages: [createDealPage(areaPage)] };
        });

        const ctx = {
            dataModel: {
                getBody: () => ({
                    dataStream: '0123456789\f123456789',
                    renderedPageBreaks: [10],
                }),
            },
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
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
        } as any;

        createSkeletonCellPages(
            ctx,
            {} as any,
            { startIndex: 8, endIndex: 12, children: [{}] } as any,
            sectionBreakConfig,
            {
                tableId: 'table-1',
                tableRows: [{ tableCells: [{}] }],
                tableColumns: [{ size: { width: { v: 80 } } }],
            } as any,
            0,
            0,
            80,
            120
        );

        expect(initialPageHeight).toBe(80);
    });

    it('uses grid columns after preceding compact column spans', () => {
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
            tableId: 'compact-spans',
            tableRows: [{ tableCells: [{ columnSpan: 2 }, { columnSpan: 2 }] }],
            tableColumns: [20, 30, 40, 50].map((width) => ({ size: { width: { v: width } } })),
        } as any;

        const first = createNullCellPage(ctx, sectionBreakConfig, tableConfig, 0, 0);
        const second = createNullCellPage(ctx, sectionBreakConfig, tableConfig, 0, 1);

        expect(first.page.pageWidth).toBe(50);
        expect(second.page.pageWidth).toBe(90);
    });

    it('keeps vertically covered grid columns when sizing following cells', () => {
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
            tableId: 'vertical-merge',
            tableRows: [
                { tableCells: [{ rowSpan: 2 }, {}, {}] },
                { tableCells: [{ rowSpan: 0, columnSpan: 0 }, {}, {}] },
            ],
            tableColumns: [20, 80, 40].map((width) => ({ size: { width: { v: width } } })),
        } as any;

        const secondColumn = createNullCellPage(ctx, sectionBreakConfig, tableConfig, 1, 1);

        expect(secondColumn.page.pageWidth).toBe(80);
    });

    it('sizes cells from their logical grid column after gridBefore', () => {
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
            tableId: 'grid-before',
            tableRows: [{ gridBefore: 1, tableCells: [{}] }],
            tableColumns: [20, 80, 40].map((width) => ({ size: { width: { v: width } } })),
        } as any;

        const middleColumn = createNullCellPage(ctx, sectionBreakConfig, tableConfig, 0, 0);

        expect(middleColumn.page.pageWidth).toBe(80);
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

    it('DOCX golden e2e expands table cell height to include inline drawings', () => {
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

    it('expands table cell height to include nested flow tables', () => {
        const page = {
            height: 20,
            skeTables: new Map([
                ['flow-table', {
                    top: 12,
                    height: 80,
                    tableSource: {},
                }],
                ['floating-table', {
                    top: 10,
                    height: 100,
                    tableSource: { textWrap: 1 },
                }],
            ]),
        };

        expandCellPageHeightForFlowTables([page as never]);

        expect(page.height).toBe(92);
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

    it('DOCX golden e2e locks public layout projections from the sample failure clusters', () => {
        const resource = createSkeletonResourceReference();
        const ctx = {
            layoutStartPointer: {},
            skeletonResourceReference: resource,
            isDirty: false,
        } as any;
        const section = {
            pageNumberStart: 1,
            pageSize: { width: 816, height: 1056 },
            marginLeft: 96,
            marginRight: 96,
            marginTop: 96,
            marginBottom: 96,
            headerTreeMap: new Map(),
            footerTreeMap: new Map(),
            columnProperties: [
                { width: 180, paddingEnd: 24 },
                { width: 210, paddingEnd: 36 },
                { width: 174, paddingEnd: 0 },
            ],
            columnSeparatorType: ColumnSeparatorType.BETWEEN_EACH_COLUMN,
            documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            documentTextStyle: { ff: 'SimSun', fs: 12 },
            adjustLineHeightInTable: BooleanNumber.TRUE,
            linePitch: 20.8,
            gridType: GridType.LINES,
        } as any;
        const page = createSkeletonPage(ctx, section, resource, 1);
        const table = {
            tableId: 'golden-table',
            tableRows: [{ gridBefore: 1, tableCells: [{ columnSpan: 2 }, {}] }],
            tableColumns: [20, 80, 40, 50].map((width) => ({ size: { width: { v: width } } })),
        } as any;
        const firstCell = createNullCellPage(ctx, section, table, 0, 0);
        const secondCell = createNullCellPage(ctx, section, table, 0, 1);
        const inlinePage = {
            height: 20,
            skeDrawings: new Map([
                ['inline-image', {
                    aTop: 6,
                    height: 48,
                    drawingOrigin: { layoutType: PositionedObjectLayoutType.INLINE },
                }],
            ]),
        };
        const nestedTablePage = {
            height: 20,
            skeTables: new Map([
                ['nested-table', { top: 12, height: 80, tableSource: {} }],
            ]),
        };

        expandCellPageHeightForInlineDrawings([inlinePage as never]);
        expandCellPageHeightForFlowTables([nestedTablePage as never]);

        expect({
            '0004-table-image-mix': {
                inlineCellHeight: inlinePage.height,
                nestedTableCellHeight: nestedTablePage.height,
            },
            '0006-long-table-grid': {
                cellWidths: [firstCell.page.pageWidth, secondCell.page.pageWidth],
            },
            '0009-document-grid': {
                adjustLineHeightInTable: firstCell.sectionBreakConfig.adjustLineHeightInTable,
                fontFamily: firstCell.sectionBreakConfig.documentTextStyle?.ff,
                gridType: firstCell.sectionBreakConfig.gridType,
                linePitch: firstCell.sectionBreakConfig.linePitch,
            },
            '0026-multi-section-columns': {
                columns: page.sections[0].columns.map((column) => ({ left: column.left, width: column.width })),
                pageSize: [page.pageWidth, page.pageHeight],
            },
        }).toMatchInlineSnapshot(`
          {
            "0004-table-image-mix": {
              "inlineCellHeight": 54,
              "nestedTableCellHeight": 92,
            },
            "0006-long-table-grid": {
              "cellWidths": [
                120,
                50,
              ],
            },
            "0009-document-grid": {
              "adjustLineHeightInTable": 1,
              "fontFamily": "SimSun",
              "gridType": 1,
              "linePitch": 20.8,
            },
            "0026-multi-section-columns": {
              "columns": [
                {
                  "left": 0,
                  "width": 180,
                },
                {
                  "left": 204,
                  "width": 210,
                },
                {
                  "left": 450,
                  "width": 174,
                },
              ],
              "pageSize": [
                816,
                1056,
              ],
            },
          }
        `);
    });
});
