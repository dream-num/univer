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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IPageRenderConfig, RenderUnit, UniverRenderingContext } from '@univerjs/engine-render';
import type { Subject } from 'rxjs';
import { CustomRangeType, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    generateParagraphs,
} from '@univerjs/docs';
import {
    CanvasColorService,
    DocumentEditArea,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
    RenderManagerService,
} from '@univerjs/engine-render';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocEventManagerService } from '../../../services/doc-event-manager.service';
import { DocFieldRenderController } from '../doc-field.render-controller';

const cleanups: Array<() => void> = [];
afterEach(() => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    vi.restoreAllMocks();
});

function createTestBed() {
    const canvas = new Proxy({
        font: '',
        webkitBackingStorePixelRatio: 1,
        measureText: (text: string) => ({ width: text.length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2, fontBoundingBoxAscent: 8, fontBoundingBoxDescent: 2 }),
    }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvas as never);
    const univer = new Univer();
    cleanups.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    const text = 'Body\rSecond\r\n';
    const paragraphs = generateParagraphs(text);
    paragraphs[1].paragraphStyle = { pageBreakBefore: 1 };
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'field-chrome',
        body: { dataStream: text, paragraphs },
        documentStyle: { documentFlavor: 1, pageSize: { width: 300, height: 400 }, marginTop: 40, marginBottom: 40, marginLeft: 20, marginRight: 20, marginHeader: 10, defaultHeaderId: 'header' },
        headers: { header: { headerId: 'header', body: {
            dataStream: '\u001F1\u001E\r\n',
            paragraphs: [{ paragraphId: 'header-p', startIndex: 3 }],
            customRanges: [{ rangeId: 'page', startIndex: 0, endIndex: 2, rangeType: CustomRangeType.FIELD, properties: { fieldType: 'PAGE', instruction: 'PAGE', cachedResult: '1' } }],
        } } },
    });
    const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    skeleton.calculate();
    skeleton.getViewModel().setEditArea(DocumentEditArea.HEADER);
    const documents = new Documents('field-chrome-doc', skeleton);
    render.mainComponent = documents;
    render.scene.addObject(documents);
    render.addRenderDependencies([[DocEventManagerService], [DocFieldRenderController]]);
    const controller = render.with(DocFieldRenderController);
    const events = render.with(DocEventManagerService);
    const selections = injector.get(DocSelectionManagerService);
    selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
    injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
    const pages = skeleton.getSkeletonData()!.pages;
    const fillRect = vi.fn();
    const ctx = { save: vi.fn(), restore: vi.fn(), beginPath: vi.fn(), rect: vi.fn(), clip: vi.fn(), fillRect, globalAlpha: 1 } as unknown as UniverRenderingContext;
    const paint = (pageIndex: number) => (documents as unknown as { _pageRender$: Subject<IPageRenderConfig> })._pageRender$.next({ page: pages[pageIndex], pageLeft: 0, pageTop: pageIndex * 420, ctx });
    return { controller, events, selections, render, pages, fillRect, paint };
}

describe('DocFieldRenderController', () => {
    it('shades only the selected copy of a shared header field and removes shading outside it', () => {
        const { selections, pages, fillRect, paint } = createTestBed();
        expect(pages).toHaveLength(2);
        selections.__TEST_ONLY_add([{ startOffset: 1, endOffset: 1, collapsed: true, isActive: true, segmentId: 'header', segmentPage: 1 }]);
        paint(0);
        expect(fillRect).not.toHaveBeenCalled();
        paint(1);
        expect(fillRect).toHaveBeenCalledTimes(1);
        fillRect.mockClear();
        selections.replaceSelectionInfoWithoutRefresh({
            textRanges: [{ startOffset: 3, endOffset: 3, collapsed: true, isActive: true, segmentId: 'header', segmentPage: 1 }],
            rectRanges: [],
            segmentId: 'header',
            segmentPage: 1,
            isEditing: true,
            style: NORMAL_TEXT_SELECTION_PLUGIN_STYLE,
        });
        paint(1);
        expect(fillRect).not.toHaveBeenCalled();
    });

    it('keeps a text cursor while hovering fields, paints their bounds and releases subscriptions', () => {
        const { controller, events, render, fillRect, paint } = createTestBed();
        const bound = events.getCustomRangeBounds().find((item) => item.segmentPageIndex === 0)!;
        const rect = bound.rects[0];
        render.scene.onPointerMove$.emitEvent({ buttons: 0, offsetX: (rect.left + rect.right) / 2, offsetY: (rect.top + rect.bottom) / 2 } as never);
        expect(render.scene.getCursor()).not.toBe('pointer');
        paint(0);
        expect(fillRect).toHaveBeenCalledTimes(1);
        controller.dispose();
        fillRect.mockClear();
        paint(0);
        expect(fillRect).not.toHaveBeenCalled();
    });
});
