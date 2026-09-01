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
import type { RenderUnit } from '@univerjs/engine-render';
import { DocumentFlavor, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { CanvasColorService, DocBackground, Documents, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { DesktopSidebarService, ISidebarService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { DOCS_VIEW_KEY } from '../../../basics/docs-view-key';
import { DocPageLayoutService } from '../../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../../services/doc-view-scale';
import { DocResizeRenderController, hasRenderableDocSkeleton } from '../doc-resize.render-controller';

describe('hasRenderableDocSkeleton', () => {
    it('rejects missing and empty skeletons', () => {
        expect(hasRenderableDocSkeleton(undefined)).toBe(false);
        expect(hasRenderableDocSkeleton({ getSkeleton: () => null })).toBe(false);
        expect(hasRenderableDocSkeleton({ getSkeleton: () => ({ getSkeletonData: () => ({ pages: [] }) }) })).toBe(false);
    });

    it('accepts a skeleton with at least one page', () => {
        expect(hasRenderableDocSkeleton({
            getSkeleton: () => ({ getSkeletonData: () => ({ pages: [{}] }) }),
        })).toBe(true);
    });
});

describe('DocResizeRenderController', () => {
    it('refreshes the host logical selection even while a comment editor owns the current selection', async () => {
        vi.useFakeTimers();
        const context = new Proxy({
            font: '',
            measureText: (text: string) => ({ width: text.length * 8, actualBoundingBoxAscent: 8, actualBoundingBoxDescent: 2 }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([ISidebarService, { useClass: DesktopSidebarService }]);
            injector.add([DocLayoutExecutorService]);
            injector.add([DocSelectionManagerService]);
            const unitId = 'resize-host';
            univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: unitId,
                body: {
                    dataStream: 'Host text\r\n',
                    paragraphs: [{ startIndex: 9, paragraphId: 'host-paragraph' }],
                    sectionBreaks: [{ startIndex: 10, sectionId: 'host-section' }],
                },
                documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 300, height: 400 } },
            });
            injector.get(IUniverInstanceService).setCurrentUnitForType(unitId);
            const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
            render.deactivate();
            render.engine.resizeBySize(800, 600);
            render.addRenderDependencies([[DocSkeletonManagerService], [DocViewScaleService], [DocPageLayoutService]]);
            const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
            const documents = new Documents('host-doc', skeleton);
            documents.resize(300, 400);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.components.set(DOCS_VIEW_KEY.BACKGROUND, new DocBackground('host-background', skeleton));
            const selections = injector.get(DocSelectionManagerService);
            selections.__TEST_ONLY_setCurrentSelection({ unitId, subUnitId: unitId });
            selections.__TEST_ONLY_add([{ startOffset: 1, endOffset: 4, collapsed: false }]);
            selections.__TEST_ONLY_setCurrentSelection({ unitId: 'comment-editor', subUnitId: 'comment-editor' });
            const refreshes: Array<{ unitId: string; offsets: number[] }> = [];
            const subscription = selections.refreshSelection$.subscribe((event) => {
                if (event) {
                    refreshes.push({ unitId: event.unitId, offsets: event.docRanges.map((range) => range.startOffset) });
                }
            });
            render.addRenderDependencies([[DocResizeRenderController]]);
            render.with(DocResizeRenderController);
            await vi.advanceTimersByTimeAsync(20);
            refreshes.length = 0;
            injector.get(ISidebarService).open({ children: { label: 'comment-panel' }, width: 320 });
            await vi.advanceTimersByTimeAsync(20);

            expect(refreshes).toContainEqual({ unitId, offsets: [1] });
            expect(refreshes.every((event) => event.unitId === unitId)).toBe(true);
            expect(selections.__getCurrentSelection()?.unitId).toBe('comment-editor');
            expect(documents.left).toBeGreaterThan(0);
            subscription.unsubscribe();
        } finally {
            univer.dispose();
            vi.restoreAllMocks();
            vi.useRealTimers();
        }
    });
});
