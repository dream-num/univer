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

import type { IDocumentSkeletonPage } from '../../../basics/i-document-skeleton-cached';
import { DocumentFlavor } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PageLayoutType } from '../../../basics/i-document-skeleton-cached';
import { Path, Rect } from '../../../shape';
import { DocBackground } from '../doc-background';

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
    } as any;
}

function createPage(overrides: Partial<IDocumentSkeletonPage> = {}) {
    return {
        width: 200,
        height: 120,
        pageWidth: 200,
        pageHeight: 120,
        marginLeft: 20,
        marginRight: 20,
        marginTop: 16,
        marginBottom: 16,
        originMarginTop: 16,
        originMarginBottom: 16,
        sections: [],
        ...overrides,
    } as IDocumentSkeletonPage;
}

function createSkeleton(pages: IDocumentSkeletonPage[], documentFlavor = DocumentFlavor.TRADITIONAL) {
    return {
        getSkeletonData: () => ({ pages }),
        getViewModel: () => ({
            getDataModel: () => ({
                getSnapshot: () => ({
                    documentStyle: {
                        documentFlavor,
                    },
                }),
            }),
        }),
    } as any;
}

describe('DocBackground', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('positions multiple traditional pages horizontally and draws their margin identifiers', () => {
        const background = DocBackground.create(
            'horizontal-background',
            createSkeleton([createPage(), createPage({ pageWidth: 180, pageHeight: 100 })]),
            {
                pageLayoutType: PageLayoutType.HORIZONTAL,
                pageMarginLeft: 24,
                pageMarginTop: 18,
                backgroundFillColor: '#eeeeee',
                pageFillColor: '#ffffff',
                pageStrokeColor: '#999999',
                marginStrokeColor: '#3366ff',
            }
        );
        background.resize(500, 240);
        const ctx = createCtx();
        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        const pathDraw = vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        background.draw(ctx);

        expect(rectDraw).toHaveBeenCalledTimes(3);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({ width: 500, height: 240, fill: '#eeeeee' });
        expect(rectDraw.mock.calls[1][1]).toMatchObject({ width: 200, height: 120, fill: '#ffffff', stroke: '#999999' });
        expect(rectDraw.mock.calls[2][1]).toMatchObject({ width: 180, height: 100, fill: '#ffffff', stroke: '#999999' });
        expect(ctx.translate).toHaveBeenNthCalledWith(1, 0, 0);
        expect(ctx.translate).toHaveBeenNthCalledWith(2, -0.5, -0.5);
        expect(ctx.translate).toHaveBeenNthCalledWith(3, 223.5, -0.5);
        expect(pathDraw).toHaveBeenCalledTimes(2);
        const firstMarginPath = pathDraw.mock.calls[0]?.[1] as any;
        expect(firstMarginPath).toMatchObject({ stroke: '#3366ff', strokeWidth: 1.5 });
        expect(firstMarginPath.dataArray[0].points).toEqual([5, 16]);

        background.dispose();
    });

    it('updates fill colors for the next draw and skips unchanged empty viewport paints', () => {
        const background = new DocBackground(
            'modern-background',
            createSkeleton([createPage()], DocumentFlavor.MODERN),
            {
                pageLayoutType: PageLayoutType.VERTICAL,
                pageMarginLeft: 24,
                pageMarginTop: 18,
            }
        );
        background.resize(320, 180);
        const rectDraw = vi.spyOn(Rect, 'drawWith').mockImplementation(() => {});
        vi.spyOn(Path, 'drawWith').mockImplementation(() => {});

        background.setFillColors('#111111', '#222222', '#333333', '#444444');
        background.draw(createCtx());
        expect(rectDraw).toHaveBeenCalledTimes(1);
        expect(rectDraw.mock.calls[0][1]).toMatchObject({ width: 320, height: 180, fill: '#111111' });

        rectDraw.mockClear();
        background.setFillColors('#111111', '#222222', '#333333', '#444444');
        background.draw(createCtx(), {
            viewBound: { left: 10, top: 20, right: 10, bottom: 120 },
        } as any);
        expect(rectDraw).not.toHaveBeenCalled();

        background.dispose();
    });
});
