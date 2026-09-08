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

import { CustomRangeType, DocumentDataModel, DocumentFlavor, DrawingTypeEnum, Injector, LocaleService, PositionedObjectLayoutType } from '@univerjs/core';
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
                customRanges: [{ rangeId: 'ref', rangeType: CustomRangeType.FOOTNOTE, startIndex: 1, endIndex: 1, wholeEntity: true, properties: { footnoteId: 'note' } }],
            },
            footnotes: { note: { footnoteId: 'note', body: {
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
