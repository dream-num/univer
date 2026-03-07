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

import { DataStreamTreeTokenType, PositionedObjectLayoutType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BreakType } from '../../../../../../basics/i-document-skeleton-cached';

import { lineBreaking } from '../linebreaking';

const createSkeletonPageMock = vi.fn((ctx: any, _config: any, _ref: any, pageNumber: number, breakType?: BreakType): any => ({
    segmentId: 'segment-1',
    pageNumber,
    breakType,
}));

const setColumnFullStateMock = vi.fn((..._args: any[]): any => undefined);
const getLastNotFullColumnInfoMock = vi.fn((..._args: any[]): any => undefined);
const dealWithBulletMock = vi.fn((..._args: any[]): any => ({ id: 'bullet-skeleton' }));
const layoutParagraphMock = vi.fn((...args: any[]): any => {
    const glyphs = args[1] as any[];
    const pages = args[2] as any[];
    return glyphs.length > 0 ? [...pages] : pages;
});

vi.mock('../../../model/page', () => ({
    createSkeletonPage: (
        ctx: any,
        config: any,
        ref: any,
        pageNumber: number,
        breakType?: BreakType
    ) => createSkeletonPageMock(ctx, config, ref, pageNumber, breakType),
}));

vi.mock('../../../model/section', () => ({
    setColumnFullState: (column: any, full: boolean) => setColumnFullStateMock(column, full),
}));

vi.mock('../../../tools', () => ({
    getLastNotFullColumnInfo: (page: any) => getLastNotFullColumnInfoMock(page),
}));

vi.mock('../bullet', () => ({
    dealWithBullet: (bullet: any, lists: any, listLevelAncestors: any, localeService: any) => dealWithBulletMock(bullet, lists, listLevelAncestors, localeService),
}));

vi.mock('../layout-ruler', () => ({
    layoutParagraph: (
        ctx: any,
        glyphs: any[],
        pages: any[],
        sectionBreakConfig: any,
        paragraphConfig: any,
        isParagraphFirstShapedText: boolean,
        breakPointType: any
    ) => layoutParagraphMock(ctx, glyphs, pages, sectionBreakConfig, paragraphConfig, isParagraphFirstShapedText, breakPointType),
}));

function createContext() {
    return {
        paragraphConfigCache: new Map(),
        skeletonResourceReference: {
            skeHeaders: new Map(),
            skeFooters: new Map(),
            skeListLevel: new Map(),
            drawingAnchor: new Map(),
        },
    } as any;
}

function createViewModel() {
    return {
        getParagraph: vi.fn(() => ({
            startIndex: 0,
            paragraphStyle: {},
            bullet: { listId: 'l1', nestingLevel: 0 },
        })),
        getCustomBlock: vi.fn((charIndex: number) => {
            if (charIndex === 1) {
                return { blockId: 'inline-1' };
            }
            if (charIndex === 2) {
                return { blockId: 'float-1' };
            }
            return null;
        }),
    } as any;
}

describe('linebreaking', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles page-break and non-last column-break branches', () => {
        const ctx = createContext();
        const viewModel = createViewModel();
        getLastNotFullColumnInfoMock.mockReturnValue({
            column: { id: 'c1' },
            isLast: false,
        });

        const curPage = {
            segmentId: 'segment-1',
            pageNumber: 1,
        } as any;

        const paragraphNode = {
            endIndex: 10,
            startIndex: 0,
            blocks: [1, 2],
            children: [{}],
        } as any;

        const sectionBreakConfig = {
            lists: [],
            localeService: {} as any,
            drawings: {
                'inline-1': {
                    drawingId: 'inline-1',
                    layoutType: PositionedObjectLayoutType.INLINE,
                },
                'float-1': {
                    drawingId: 'float-1',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                },
            },
        } as any;

        const shapedTextList = [
            {
                text: `A${DataStreamTreeTokenType.PAGE_BREAK}`,
                glyphs: [{ content: 'A' }],
                breakPointType: 0,
            },
            {
                text: `B${DataStreamTreeTokenType.COLUMN_BREAK}`,
                glyphs: [{ content: 'B' }],
                breakPointType: 0,
            },
            {
                text: 'C',
                glyphs: [{ content: 'C' }],
                breakPointType: 0,
            },
        ] as any;

        const tableSkeleton = { tableId: 'table-1' } as any;
        const pages = lineBreaking(
            ctx,
            viewModel,
            shapedTextList,
            curPage,
            paragraphNode,
            sectionBreakConfig,
            tableSkeleton
        );

        expect(dealWithBulletMock).toHaveBeenCalled();
        expect(layoutParagraphMock).toHaveBeenCalled();
        expect(createSkeletonPageMock).toHaveBeenCalledWith(
            ctx,
            sectionBreakConfig,
            ctx.skeletonResourceReference,
            2,
            BreakType.PAGE
        );
        expect(setColumnFullStateMock).toHaveBeenCalled();
        expect(ctx.paragraphConfigCache.get('segment-1')?.has(10)).toBe(true);
        expect(ctx.skeletonResourceReference.drawingAnchor.get('segment-1')).toBeTruthy();
        expect(pages.length).toBeGreaterThan(0);
    });

    it('reuses cached bullet skeleton and creates new page for last column', () => {
        const ctx = createContext();
        const cachedSegment = new Map();
        cachedSegment.set(10, { bulletSkeleton: { id: 'cached-bullet' } });
        ctx.paragraphConfigCache.set('segment-1', cachedSegment);

        const viewModel = createViewModel();
        getLastNotFullColumnInfoMock.mockReturnValue({
            column: { id: 'c-last' },
            isLast: true,
        });

        const pages = lineBreaking(
            ctx,
            viewModel,
            [{
                text: `X${DataStreamTreeTokenType.COLUMN_BREAK}`,
                glyphs: [{ content: 'X' }],
                breakPointType: 0,
            }] as any,
            {
                segmentId: 'segment-1',
                pageNumber: 5,
            } as any,
            {
                endIndex: 10,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(dealWithBulletMock).not.toHaveBeenCalled();
        expect(createSkeletonPageMock).toHaveBeenCalledWith(
            ctx,
            expect.any(Object),
            ctx.skeletonResourceReference,
            6,
            BreakType.COLUMN
        );
        expect(pages.length).toBeGreaterThanOrEqual(1);
    });
});
