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
import type { IPointerEvent, RenderUnit } from '@univerjs/engine-render';
import { DocumentFlavor, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import {
    CanvasColorService,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    Viewport,
} from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { EditorService, IEditorService } from '../../../services/editor/editor-manager.service';
import { DocBackScrollRenderController } from '../back-scroll.render-controller';

function createEditor() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
    const dataStream = `${Array.from({ length: 100 }, (_, i) => `Paragraph ${i} has enough text to wrap onto several lines.\r`).join('')}\n`;
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'back-scroll-test',
        body: {
            dataStream,
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                startIndex: match.index!,
                paragraphId: `paragraph-${index}`,
            })),
            sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'body' }],
        },
        documentStyle: {
            documentFlavor: DocumentFlavor.TRADITIONAL,
            pageSize: { width: 300, height: 400 },
            marginLeft: 20,
            marginRight: 20,
            marginTop: 20,
            marginBottom: 20,
        },
    });
    const unitId = model.getUnitId();
    injector.get(IUniverInstanceService).setCurrentUnitForType(unitId);
    const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
    render.deactivate();
    render.engine.resizeBySize(400, 250);
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    const pages = skeleton.getSkeletonData()!.pages;
    expect(pages.length).toBeGreaterThan(4);
    const height = pages.reduce((sum, page) => sum + page.pageHeight + 20, 0);
    render.scene.transformByState({ width: 400, height });
    const documents = new Documents('doc-main', skeleton, { pageMarginTop: 20, pageMarginLeft: 0 });
    documents.resize(300, height);
    render.mainComponent = documents;
    render.scene.addObject(documents);
    const viewport = new Viewport(VIEWPORT_KEY.VIEW_MAIN, render.scene, {
        left: 0,
        top: 0,
        width: 400,
        height: 250,
        active: true,
    });
    new ScrollBar(viewport, { mainScene: render.scene });
    viewport.resetCanvasSizeAndUpdateScroll();
    expect(viewport.isActive).toBe(true);
    render.addRenderDependencies([[DocBackScrollRenderController]]);
    const controller = render.with(DocBackScrollRenderController);
    const selections = injector.get(DocSelectionManagerService);
    return {
        controller,
        render,
        skeleton,
        viewport,
        select(offset: number, isEditing = true): void {
            selections.__TEST_ONLY_add([{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true }], isEditing);
            selections.__replaceTextRangesWithNoRefresh({
                ...selections.getSelectionInfo()!,
                textRanges: [{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true }],
                rectRanges: [],
                isEditing,
            }, { unitId, subUnitId: unitId });
            expect(selections.getActiveTextRange()?.startOffset).toBe(offset);
        },
        dispose(): void {
            univer.dispose();
        },
    };
}

describe('DocBackScrollRenderController', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('keeps a new manual scroll instead of replaying an earlier input scroll', async () => {
        const editor = createEditor();
        try {
            editor.select(3);
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            const userScroll = editor.viewport.viewportScrollY;
            expect(userScroll).toBeGreaterThan(1000);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(userScroll);
        } finally {
            editor.dispose();
        }
    });

    it('does not reuse an input scroll for a newer non-editing selection', async () => {
        const editor = createEditor();
        try {
            editor.select(3);
            editor.select(editor.skeleton.getSkeletonData()!.pages[4].st, false);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(0);
        } finally {
            editor.dispose();
        }
    });

    it('still follows typing when no newer interaction takes ownership', async () => {
        const editor = createEditor();
        try {
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            expect(editor.viewport.viewportScrollY).toBeGreaterThan(1000);
            editor.select(3);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(0);
        } finally {
            editor.dispose();
        }
    });

    it('does not let a later layout refresh reclaim a manually scrolled viewport', async () => {
        const editor = createEditor();
        try {
            editor.select(3);
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            await vi.advanceTimersByTimeAsync(20);
            editor.select(3);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(1200);
            editor.select(4);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(0);
        } finally {
            editor.dispose();
        }
    });

    it('cancels an earlier input scroll as soon as a pointer selection starts', async () => {
        const editor = createEditor();
        try {
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            editor.select(3);
            editor.render.scene.onPointerDown$.emitEvent({ offsetX: 40, offsetY: 40, button: 0 } as IPointerEvent);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(1200);
        } finally {
            editor.dispose();
        }
    });

    it('cancels a materialization retry when the user scrolls elsewhere', async () => {
        const editor = createEditor();
        try {
            const pages = editor.skeleton.getSkeletonData()!.pages;
            const original = pages[4];
            pages[4] = { ...original, isMaterializationPlaceholder: true, sections: [], skeTables: new Map() };
            editor.controller.scrollToRange({ startOffset: original.st, endOffset: original.st, collapsed: true });
            expect(editor.viewport.viewportScrollY).toBeGreaterThan(1200);
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            pages[4] = original;
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(1200);
        } finally {
            editor.dispose();
        }
    });

    it('releases an outstanding input scroll on disposal', async () => {
        const editor = createEditor();
        try {
            editor.viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            editor.select(3);
            editor.controller.dispose();
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(1200);
        } finally {
            editor.dispose();
        }
    });
});
