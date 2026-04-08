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

import { BooleanNumber } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';

import { RichText } from '../rich-text';

const h = vi.hoisted(() => ({
    documentSkeletonCreateMock: vi.fn(),
    documentViewModelCtorMock: vi.fn(),
    documentsCtorMock: vi.fn(),
    documentsRenderMock: vi.fn(),
    updatePageSizeMock: vi.fn(),
    makeDirtyMock: vi.fn(),
    calculateMock: vi.fn(),
    skeletonData: {
        pages: [
            { width: 120, height: 40 },
        ],
    } as any,
}));

vi.mock('../../components/docs/view-model/document-view-model', () => ({
    DocumentViewModel: class {
        constructor(model: any) {
            h.documentViewModelCtorMock(model);
        }
    },
}));

vi.mock('../../components/docs/layout/doc-skeleton', () => ({
    DocumentSkeleton: {
        create: (viewModel: any, localeService: any) => {
            h.documentSkeletonCreateMock(viewModel, localeService);
            return {
                getViewModel: () => ({
                    getDataModel: () => ({
                        updateDocumentDataPageSize: (...args: any[]) => h.updatePageSizeMock(...args),
                    }),
                }),
                getSkeletonData: () => h.skeletonData,
                makeDirty: (...args: any[]) => h.makeDirtyMock(...args),
                calculate: (...args: any[]) => h.calculateMock(...args),
            };
        },
    },
}));

vi.mock('../../components/docs/document', () => ({
    Documents: class {
        constructor(key: string, skeleton: any, config: any) {
            h.documentsCtorMock(key, skeleton, config);
        }

        render(ctx: any) {
            h.documentsRenderMock(ctx);
        }
    },
}));

function createCtx() {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        transform: vi.fn(),
    } as any;
}

describe('rich text shape', () => {
    it('builds document data from plain text and exposes getters/json', () => {
        h.skeletonData = { pages: [{ width: 120, height: 40 }] } as any;
        const rich = new RichText({} as any, 'rt-1', {
            text: 'hello',
            fs: 14,
            ff: 'Arial',
            it: BooleanNumber.FALSE,
            bl: BooleanNumber.TRUE,
            zIndex: 2,
            left: 0,
            top: 0,
            width: 120,
            height: 40,
        } as any);

        expect(rich.fs).toBe(14);
        expect(rich.text).toContain('hello');
        expect(rich.documentData.body?.dataStream).toContain('hello');
        expect(h.documentSkeletonCreateMock).toHaveBeenCalled();
        expect(h.documentsCtorMock).toHaveBeenCalled();
        expect(rich.getDocsSkeletonPageSize()).toEqual({ width: 120, height: 40 });

        rich.setProps({ left: 10, top: 20, zIndex: 9, fs: 99, text: 'ignore' } as any);
        expect((rich as any)._left).toBe(10);
        expect(rich.fs).toBe(14);

        const json = rich.toJson();
        expect(json).toEqual(expect.objectContaining({
            fs: 14,
            text: expect.any(String),
        }));
    });

    it('covers render branches and draw delegation', () => {
        const rich = new RichText({} as any, 'rt-2', {
            text: 'abc',
            fs: 12,
            zIndex: 1,
            width: 100,
            height: 30,
        } as any);
        const ctx = createCtx();

        const makeDirtySpy = vi.spyOn(rich, 'makeDirty');
        (rich as any)._visible = false;
        rich.render(ctx);
        expect(makeDirtySpy).toHaveBeenCalledWith(false);

        (rich as any)._visible = true;
        vi.spyOn(rich, 'isRender').mockReturnValue(true);
        (rich as any)._strokeWidth = 1;
        (rich as any).width = 10;
        (rich as any).height = 10;
        rich.render(ctx, {
            viewBound: {
                left: 100,
                right: 200,
                top: 100,
                bottom: 200,
            },
        } as any);
        expect(h.documentsRenderMock).not.toHaveBeenCalled();

        (rich.isRender as any).mockReturnValue(false);
        rich.render(ctx);
        expect(ctx.save).toHaveBeenCalled();
        expect(ctx.transform).toHaveBeenCalled();
        expect(ctx.restore).toHaveBeenCalled();
        expect(h.documentsRenderMock).toHaveBeenCalled();
    });

    it('refreshes skeleton/documents and resizes to content', () => {
        const rich = new RichText({} as any, 'rt-3', {
            text: 'refresh',
            fs: 12,
            zIndex: 1,
            width: 80,
            height: 20,
        } as any);

        const transformSpy = vi.spyOn(rich, 'transformByState');
        const createCountBefore = h.documentSkeletonCreateMock.mock.calls.length;

        rich.refreshDocumentByDocData();
        expect(h.documentSkeletonCreateMock.mock.calls.length).toBeGreaterThan(createCountBefore);
        expect(h.updatePageSizeMock).toHaveBeenCalled();
        expect(h.calculateMock).toHaveBeenCalled();

        h.skeletonData = { pages: [{ width: 80, height: 66 }] } as any;
        rich.resizeToContentSize();
        expect(transformSpy).toHaveBeenCalledWith(expect.objectContaining({ height: 66 }));

        h.skeletonData = { pages: [{ width: 0, height: 0 }] } as any;
        const callCount = transformSpy.mock.calls.length;
        rich.resizeToContentSize();
        expect(transformSpy.mock.calls.length).toBe(callCount);

        (rich as any)._documentSkeleton = { getSkeletonData: () => null };
        expect(rich.getDocsSkeletonPageSize()).toBeUndefined();
    });
});
