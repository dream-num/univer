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

import type { IDocDrawingBase } from '@univerjs/core';
import {
    CustomRangeType,
    DocumentDataModel,
    DocumentFlavor,
    DrawingTypeEnum,
    Injector,
    LocaleService,
    LocaleType,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { DocumentSkeleton, DocumentViewModel } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { DocPrintInterceptorService } from '../doc-print-interceptor.service';

function createService(): DocPrintInterceptorService {
    const injector = new Injector();
    injector.add([DocPrintInterceptorService]);
    return injector.get(DocPrintInterceptorService);
}

describe('DocPrintInterceptorService', () => {
    it('maps editor components to print components and keeps default interceptors pass-through', () => {
        const service = createService();
        const interceptPoints = service.interceptor.getInterceptPoints();
        const domCollection = { dispose: () => {} };

        service.registerPrintComponent('doc-component', 'print-doc-component');

        expect(service.getPrintComponent('doc-component')).toBe('print-doc-component');
        expect(service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_COMPONENT_COLLECT)(undefined, { unitId: 'doc-1' } as never)).toBeUndefined();
        expect(service.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_DOM_COLLECT)(domCollection as never, { unitId: 'doc-1' } as never)).toBe(domCollection);
    });

    it('prints an inline footnote image only on the page containing its note', () => {
        const injector = new Injector([[DocPrintInterceptorService], [LocaleService]]);
        const model = new DocumentDataModel({
            id: 'note-print',
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 300, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                dataStream: 'A\uFFFC\rB\r\n',
                paragraphs: [{ startIndex: 2, paragraphId: 'p1' }, {
                    startIndex: 4,
                    paragraphId: 'p2',
                    paragraphStyle: { pageBreakBefore: 1 },
                }],
                sectionBreaks: [{ startIndex: 5, sectionId: 's' }],
                customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 1, endIndex: 1, wholeEntity: true, properties: { noteId: 'note' } }],
            },
            notes: { note: { type: 'footnote' as const, noteId: 'note', body: {
                dataStream: '\b\r\n',
                paragraphs: [{ startIndex: 1, paragraphId: 'np' }],
                customBlocks: [{ startIndex: 0, blockId: 'note-image' }],
            }, drawings: { 'note-image': {
                drawingId: 'note-image',
                unitId: 'note-print',
                subUnitId: 'note-print',
                drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: { angle: 0, size: { width: 40, height: 20 }, positionH: { relativeFrom: 0, posOffset: 0 }, positionV: { relativeFrom: 0, posOffset: 0 } },
            } }, drawingsOrder: ['note-image'] } },
        });
        const skeleton = DocumentSkeleton.create(new DocumentViewModel(model), injector.get(LocaleService));
        try {
            skeleton.calculate();
            expect(skeleton.getSkeletonData()?.pages).toHaveLength(2);
            const service = injector.get(DocPrintInterceptorService);
            expect([...service.getPageDrawingIds(skeleton, 0)!]).toEqual(['note-image']);
            expect([...service.getPageDrawingIds(skeleton, 1)!]).toEqual([]);
        } finally {
            skeleton.dispose();
            model.dispose();
            injector.dispose();
        }
    });

    it.each([false, true])('includes nested drawing groups from body, repeated stories and notes without changing the model (cycle: %s)', (cycle) => {
        const injector = new Injector([[DocPrintInterceptorService], [LocaleService]]);
        const groupDrawings = (root: string): Record<string, IDocDrawingBase> => {
            const members: Array<[string, string | undefined, DrawingTypeEnum]> = [
                [`${root}-image`, `${root}-nested`, DrawingTypeEnum.DRAWING_IMAGE],
                [`${root}-nested`, root, DrawingTypeEnum.DRAWING_GROUP],
                [`${root}-shape`, root, DrawingTypeEnum.DRAWING_SHAPE],
                [root, cycle && root === 'first' ? `${root}-nested` : undefined, DrawingTypeEnum.DRAWING_GROUP],
            ];
            return Object.fromEntries(members.map(([drawingId, groupId, drawingType]) => [drawingId, {
                drawingId,
                groupId,
                drawingType,
                hidden: drawingId === root && ['first', 'note-group'].includes(root),
                unitId: 'group-print',
                subUnitId: 'group-print',
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: { angle: 0, size: { width: 20, height: 20 }, positionH: { relativeFrom: 0, posOffset: 0 }, positionV: { relativeFrom: 0, posOffset: 0 } },
            }]));
        };
        const story = (blockId: string) => ({
            dataStream: '\b\r\n',
            paragraphs: [{ startIndex: 1, paragraphId: `${blockId}-p` }],
            customBlocks: [{ startIndex: 0, blockId }],
        });
        const model = injector.createInstance(DocumentDataModel, {
            id: 'group-print',
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 400 }, marginTop: 60, marginBottom: 60, marginLeft: 20, marginRight: 20, marginHeader: 10, marginFooter: 10, defaultHeaderId: 'header', defaultFooterId: 'footer' },
            body: {
                dataStream: 'A\uFFFC\b\r\b\r\n',
                paragraphs: [{ startIndex: 3, paragraphId: 'p1' }, { startIndex: 5, paragraphId: 'p2', paragraphStyle: { pageBreakBefore: 1 } }],
                sectionBreaks: [{ startIndex: 6, sectionId: 's' }],
                customBlocks: [{ startIndex: 2, blockId: 'first' }, { startIndex: 4, blockId: 'second' }],
                customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 1, endIndex: 1, wholeEntity: true, properties: { noteId: 'note' } }],
            },
            headers: { header: { headerId: 'header', body: story('header') } },
            footers: { footer: { footerId: 'footer', body: story('footer') } },
            drawings: { ...groupDrawings('first'), ...groupDrawings('second'), ...groupDrawings('header'), ...groupDrawings('footer'), ...groupDrawings('unanchored') },
            notes: { note: { noteId: 'note', type: 'footnote', body: story('note-group'), drawings: groupDrawings('note-group') } },
        });
        const view = injector.createInstance(DocumentViewModel, model);
        const skeleton = DocumentSkeleton.create(view, injector.get(LocaleService));
        try {
            skeleton.calculate();
            expect(skeleton.getSkeletonData()!.pages).toHaveLength(2);
            const before = JSON.stringify(model.getSnapshot());
            const service = injector.get(DocPrintInterceptorService);
            for (const pageIndex of [0, 1]) {
                const roots = pageIndex === 0 ? ['first', 'header', 'footer', 'note-group'] : ['second', 'header', 'footer'];
                const expected = roots.flatMap((root) => Object.keys(groupDrawings(root))).sort();
                expect([...service.getPageDrawingIds(skeleton, pageIndex)!].sort()).toEqual(expected);
            }
            for (const id of ['first-shape', 'footer-shape']) {
                const drawing = model.getDrawings()![id];
                expect(service.getDrawingForPrint(skeleton, { ...drawing, hidden: true }).hidden).toBe(id === 'first-shape');
            }
            const noteImage = model.getSnapshot().notes!.note.drawings!['note-group-image'];
            expect(service.getDrawingForPrint(skeleton, { ...noteImage, hidden: false }).hidden).toBe(true);
            expect(JSON.stringify(model.getSnapshot())).toBe(before);
        } finally {
            skeleton.dispose();
            view.dispose();
            model.dispose();
            injector.dispose();
        }
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('prints only actual story drawings when a single skeleton page is sliced (%s)', (documentFlavor) => {
        const injector = new Injector([[DocPrintInterceptorService], [LocaleService]]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: {} });
        locale.setLocale(LocaleType.EN_US);
        locale.setDirection('ltr');
        const drawing = (drawingId: string): IDocDrawingBase => ({
            drawingId,
            unitId: 'single-print',
            subUnitId: 'single-print',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.INLINE,
            docTransform: { angle: 0, size: { width: 40, height: 20 }, positionH: { relativeFrom: 0 }, positionV: { relativeFrom: 0 } },
        });
        const model = injector.createInstance(DocumentDataModel, {
            id: 'single-print',
            documentStyle: { documentFlavor, pageSize: { width: 300, height: 400 } },
            body: { dataStream: '\b\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'body-p' }], sectionBreaks: [{ startIndex: 2, sectionId: 'body-s' }], customBlocks: [{ startIndex: 0, blockId: 'body-image' }] },
            headers: { unused: { headerId: 'unused', body: { dataStream: '\b\r\n', paragraphs: [{ startIndex: 1, paragraphId: 'header-p' }], customBlocks: [{ startIndex: 0, blockId: 'header-image' }] } } },
            drawings: { 'body-image': drawing('body-image'), 'header-image': drawing('header-image') },
        });
        const view = injector.createInstance(DocumentViewModel, model);
        const skeleton = DocumentSkeleton.create(view, locale);
        try {
            skeleton.calculate();
            expect(skeleton.getSkeletonData()!.pages).toHaveLength(1);
            const before = JSON.stringify(model.getSnapshot());
            const service = injector.get(DocPrintInterceptorService);
            const slices = documentFlavor === DocumentFlavor.MODERN ? [0, 1, 57] : [0];
            for (const pageIndex of slices) {
                expect([...service.getPageDrawingIds(skeleton, pageIndex)!]).toEqual(['body-image']);
            }
            expect(service.getPageDrawingIds(skeleton)).toBeNull();
            expect(JSON.stringify(model.getSnapshot())).toBe(before);
        } finally {
            skeleton.dispose();
            view.dispose();
            model.dispose();
            injector.dispose();
        }
    });

    it('waits for registered print preparation handlers', async () => {
        const service = createService();
        const handler = vi.fn(async () => undefined);
        const dispose = service.registerPrintPreparation(handler);

        await service.preparePrint({ unitId: 'doc-1', dpr: 2 });

        expect(handler).toHaveBeenCalledWith({ unitId: 'doc-1', dpr: 2 });
        dispose();
        await service.preparePrint({ unitId: 'doc-2', dpr: 1 });
        expect(handler).toHaveBeenCalledOnce();
    });
});
