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
import { createRequire } from 'node:module';
import { DocumentFlavor, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocCanvasPopManagerService, DocEventManagerService, DocLayoutInteractionService } from '@univerjs/docs-ui';
import { CanvasColorService, Documents, ICanvasColorService, IRenderManagerService, RenderManagerService, RenderUnit } from '@univerjs/engine-render';
import { CanvasPopupService, ICanvasPopupService } from '@univerjs/ui';
import { of } from 'rxjs';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { DocQuickInsertPopupService } from '../doc-quick-insert-popup.service';

beforeAll(() => {
    vi.stubGlobal('jest', vi);
    createRequire(import.meta.url)('jest-canvas-mock');
});
afterAll(() => vi.unstubAllGlobals());

function createTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([DocCanvasPopManagerService]);
    injector.add([DocQuickInsertPopupService]);
    return { univer, injector };
}

describe('DocQuickInsertPopupService', () => {
    it('uses the target document layout interaction instead of a global service', () => {
        const { univer, injector } = createTestBed();
        try {
            const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: 'quick-insert-doc',
                body: {
                    dataStream: '/\r\n',
                    paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
                    sectionBreaks: [{ startIndex: 2, sectionId: 'body' }],
                },
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                    pageSize: { width: 300, height: 400 },
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 20,
                    marginRight: 20,
                },
            });
            const render = injector.get(IRenderManagerService).createRender(model.getUnitId());
            if (!(render instanceof RenderUnit)) {
                throw new TypeError('Expected a render unit');
            }
            render.deactivate();
            render.engine.resizeBySize(300, 400);
            render.addRenderDependencies([[DocSkeletonManagerService], [DocLayoutInteractionService]]);
            const documents = new Documents('quick-insert-doc', render.with(DocSkeletonManagerService).getSkeleton());
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.addRenderDependencies([[DocEventManagerService]]);
            injector.get(DocSelectionManagerService).replaceDocRanges([{
                startOffset: 1,
                endOffset: 1,
                collapsed: true,
                segmentId: '',
            }]);
            const service = injector.get(DocQuickInsertPopupService);
            const interaction = render.with(DocLayoutInteractionService);
            const popup = { keyword: '/', menus$: of([]) };
            const unregister = service.registerPopup(popup);
            expect(service.resolvePopup('/')).toBe(popup);
            service.showPopup({ popup, index: 0, unitId: model.getUnitId() });
            expect(service.editPopup?.unitId).toBe(model.getUnitId());
            expect(interaction.isActive).toBe(true);
            service.setIsComposing(true);
            service.setIsComposing(false);
            service.closePopup();
            service.closePopup();
            expect(interaction.isActive).toBe(false);
            expect(service.editPopup).toBeNull();
            service.showPopup({ popup, index: 0, unitId: model.getUnitId() });
            expect(interaction.isActive).toBe(true);
            service.dispose();
            service.dispose();
            expect(interaction.isActive).toBe(false);
            expect(injector.get(ICanvasPopupService).popups).toHaveLength(0);
            unregister();
            expect(service.resolvePopup('/')).toBeUndefined();
        } finally {
            univer.dispose();
        }
    });

    it('does not open a popup for a document without a render', () => {
        const { univer, injector } = createTestBed();
        try {
            const service = injector.get(DocQuickInsertPopupService);
            service.showPopup({ popup: { keyword: '/', menus$: of([]) }, index: 0, unitId: 'missing' });
            expect(service.editPopup).toBeUndefined();
        } finally {
            univer.dispose();
        }
    });
});
