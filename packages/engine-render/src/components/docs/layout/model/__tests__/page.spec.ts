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

import { BooleanNumber, ColumnSeparatorType, PageOrientType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { DocumentSkeletonPageType } from '../../../../../basics/i-document-skeleton-cached';

import {
    createNullCellPage,
    createSkeletonCellPages,
    createSkeletonPage,
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
        expect(firstPage.footerId).toBe('f-first');
        expect(firstPage.pageWidth).toBe(200);
        expect(firstPage.pageHeight).toBe(300);
        expect(firstPage.sections.length).toBeGreaterThan(0);
        expect(skeletonResourceReference.skeHeaders.get('h-first')?.has(200)).toBe(true);
        expect(skeletonResourceReference.skeFooters.get('f-first')?.has(200)).toBe(true);

        const evenPage = createSkeletonPage(ctx, sectionBreakConfig, skeletonResourceReference, 2);
        expect(evenPage.headerId).toBe('h-even');
        expect(evenPage.footerId).toBe('f-even');
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
});
