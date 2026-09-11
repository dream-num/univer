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

// @vitest-environment jsdom

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IPointerEvent } from '@univerjs/engine-render';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DocumentFlavor, getDocsEmptySnapshot, ICommandService, IUniverInstanceService, LocaleType, RichTextBuilder, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import {
    CanvasColorService,
    DocBackground,
    Documents,
    Engine,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    RenderUnit,
    Scene,
    ScrollBar,
    Viewport,
} from '@univerjs/engine-render';
import { DesktopLayoutService, ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DOCS_VIEW_KEY, VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { DocPageLayoutService } from '../../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../../services/doc-view-scale';
import { EditorService, IEditorService } from '../../../services/editor/editor-manager.service';
import { MobileDocSelectionRenderService } from '../../../services/mobile/doc-selection-render.service';
import { MobileDocViewScaleService } from '../../../services/mobile/doc-view-scale';
import { NodePositionConvertToCursor } from '../../../services/selection/convert-text-range';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { getAnchorBounding } from '../../../services/selection/text-range';
import { DocBackScrollRenderController } from '../back-scroll.render-controller';
import { MobileDocBackScrollRenderController } from '../mobile/back-scroll.render-controller';

function createEditor() {
    const univer = new Univer();
    const injector = univer.__getInjector();
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
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
    render.addRenderDependencies([[DocViewScaleService], [DocPageLayoutService], [DocSelectionRenderService], [DocBackScrollRenderController]]);
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

beforeEach(() => {
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

describe('DocBackScrollRenderController', () => {
    beforeEach(() => vi.useFakeTimers());

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

    it('waits for a usable document viewport before revealing an SDK range', async () => {
        const editor = createEditor();
        try {
            const documentComponent = editor.render.mainComponent as Documents;
            const target = editor.skeleton.getSkeletonData()!.pages[4].st;
            editor.select(3);
            await vi.advanceTimersByTimeAsync(20);
            documentComponent.translate(-10000, -10000);
            editor.controller.scrollToRange({ startOffset: target, endOffset: target, collapsed: true });
            // A resize/layout refresh can replay the pre-request selection while
            // the real viewport is becoming ready. It must not steal ownership.
            editor.select(3, false);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBe(0);

            documentComponent.translate(0, 20);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.viewport.viewportScrollY).toBeGreaterThan(1000);
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

describe('back scroll controller platform boundaries', () => {
    it('keeps mobile-only state and services out of the desktop controller', () => {
        const desktopSource = readFileSync(resolve(process.cwd(), 'src/controllers/render-controllers/back-scroll.render-controller.ts'), 'utf8');
        const mobileSource = readFileSync(resolve(process.cwd(), 'src/controllers/render-controllers/mobile/back-scroll.render-controller.ts'), 'utf8');

        expect(desktopSource).not.toContain('mobileKeyboard');
        expect(desktopSource).not.toContain('_initViewportOcclusion');
        expect(desktopSource).not.toContain('DocSelectionRenderService');
        expect(desktopSource).not.toContain('DocPageLayoutService');
        expect(desktopSource).not.toContain('setBottomReserve');
        expect(mobileSource).toContain('extends DocBackScrollRenderController');
    });
});

const cleanup: Array<() => void> = [];

function createRender(mobile = true, documentFlavor = DocumentFlavor.MODERN, zoomRatio = 1) {
    const originalViewport = window.visualViewport;
    const visualViewport = Object.assign(new EventTarget(), {
        height: 800,
        width: 430,
        offsetTop: 0,
        offsetLeft: 0,
    });
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: visualViewport });
    cleanup.push(() => Object.defineProperty(window, 'visualViewport', {
        configurable: true,
        value: originalViewport,
    }));

    const univer = new Univer({ locale: LocaleType.EN_US });
    cleanup.push(() => univer.dispose());
    const injector = univer.__getInjector();
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([IEditorService, { useClass: EditorService }]);
    injector.add([DocLayoutExecutorService]);
    injector.add([DocSelectionManagerService]);

    const data = getDocsEmptySnapshot('keyboard-doc', LocaleType.EN_US, 'Keyboard', documentFlavor);
    data.settings = { ...data.settings, zoomRatio };
    const builder = RichTextBuilder.create();
    for (let index = 0; index < 80; index++) {
        builder.paragraph({ spaceAfter: 8 }).span(`Mobile paragraph ${index}`, { fontSize: 18 });
    }
    const body = builder.getData().body;
    if (!body) {
        throw new Error('The keyboard regression document must have a body');
    }
    data.body = {
        ...body,
        sectionBreaks: [{ sectionId: 'keyboard-section', startIndex: body.dataStream.length - 1 }],
    };
    data.documentStyle = {
        ...data.documentStyle,
        pageSize: { width: 400, height: Infinity },
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    };
    const doc = univer.createUnit(UniverInstanceType.UNIVER_DOC, data);
    const engine = injector.createInstance(Engine, doc.getUnitId(), { elementWidth: 430, elementHeight: 800 });
    cleanup.push(() => engine.dispose());
    const scene = new Scene('document', engine);
    cleanup.push(() => scene.dispose());
    const render = injector.createInstance(RenderUnit, { unit: doc, engine, scene, isMainScene: true });
    cleanup.push(() => render.dispose());
    render.addRenderDependencies([
        [DocSkeletonManagerService],
        [DocViewScaleService, { useClass: mobile ? MobileDocViewScaleService : DocViewScaleService }],
        [DocPageLayoutService],
        [DocSelectionRenderService, { useClass: mobile ? MobileDocSelectionRenderService : DocSelectionRenderService }],
    ]);
    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    const documents = new Documents(DOCS_VIEW_KEY.MAIN, skeleton);
    const background = new DocBackground(DOCS_VIEW_KEY.BACKGROUND, skeleton);
    documents.resize(400, skeleton.getActualSize().actualHeight + 40);
    render.mainComponent = documents;
    render.components.set(DOCS_VIEW_KEY.BACKGROUND, background);
    scene.addObjects([documents, background]);
    const viewport = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, { left: 0, top: 0, right: 0, bottom: 0 });
    const scrollbar = new ScrollBar(viewport);
    cleanup.push(() => scrollbar.dispose());
    render.with(DocPageLayoutService).calculatePagePosition();
    render.addRenderDependencies([[DocBackScrollRenderController, { useClass: mobile ? MobileDocBackScrollRenderController : DocBackScrollRenderController }]]);
    render.with(DocBackScrollRenderController);
    const selection = render.with(DocSelectionRenderService);
    if (mobile) {
        (selection as MobileDocSelectionRenderService).enterMobileEditMode();
    }
    const manager = injector.get(DocSelectionManagerService);

    const getCaretBounds = (paragraph: number) => {
        const offset = data.body?.paragraphs?.[paragraph].startIndex ?? 0;
        const position = skeleton.findNodePositionByCharIndex(offset, true);
        const converter = new NodePositionConvertToCursor(documents.getOffsetConfig(), skeleton);
        const { contentBoxPointGroup } = converter.getRangePointData(position, position);
        const bounds = getAnchorBounding(contentBoxPointGroup);
        return { top: bounds.top + documents.top, bottom: bounds.top + documents.top + bounds.height, position };
    };
    const setCaret = (paragraph: number) => {
        const offset = data.body?.paragraphs?.[paragraph].startIndex ?? 0;
        manager.__TEST_ONLY_add([{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true }]);
        return getCaretBounds(paragraph);
    };
    const setKeyboardHeight = (height: number) => {
        visualViewport.height = 800 - height;
        visualViewport.dispatchEvent(new Event('resize'));
    };
    return { engine, scene, render, viewport, getCaretBounds, setCaret, setKeyboardHeight };
}

describe('DocBackScrollRenderController mobile keyboard visibility', () => {
    afterEach(() => {
        for (const dispose of cleanup.reverse()) {
            dispose();
        }
        cleanup.length = 0;
        vi.restoreAllMocks();
    });

    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])(
        'reveals an obscured caret synchronously before the next frame for document flavor %s',
        (flavor) => {
            const { viewport, engine, getCaretBounds, setCaret, setKeyboardHeight } = createRender(true, flavor);
            const before = viewport.calcViewportInfo().viewBound;
            let paragraph = 0;
            while (paragraph < 79 && getCaretBounds(paragraph).bottom <= before.bottom - 380 - 48) {
                paragraph++;
            }
            const caret = setCaret(paragraph);
            expect(caret.bottom).toBeLessThan(before.bottom);
            expect(caret.bottom).toBeGreaterThan(before.bottom - 380 - 48);

            setKeyboardHeight(380);
            const after = viewport.calcViewportInfo().viewBound;
            expect(after.top).toBeGreaterThan(before.top);
            expect(caret.bottom).toBeLessThanOrEqual(after.bottom - 380 - 48);
            expect(caret.top - after.top).toBeCloseTo(
                (after.bottom - after.top - 380 - 48 - (caret.bottom - caret.top)) * 0.4,
                0
            );
            expect(engine.height).toBe(800);
            const scrollTop = viewport.viewportScrollY;
            setKeyboardHeight(380);
            expect(viewport.viewportScrollY).toBe(scrollTop);
        }
    );

    it.each([0.5, 1, 2])('places an offscreen caret above center at scale %s without moving it again', (scale) => {
        const { scene, render, viewport, setCaret, setKeyboardHeight } = createRender(true, DocumentFlavor.TRADITIONAL, scale);
        expect(scene.getAncestorScale().scaleY).toBe(scale);
        const caret = setCaret(40);
        setKeyboardHeight(380);
        const assertPosition = () => {
            const bound = viewport.calcViewportInfo().viewBound;
            const expectedTop = (bound.bottom - bound.top - 428 / scale - (caret.bottom - caret.top)) * 0.4;
            // Viewport scrolling rounds to physical pixels.
            expect(Math.abs(caret.top - bound.top - expectedTop) * scale).toBeLessThan(1);
        };
        assertPosition();

        const controller = render.with(DocBackScrollRenderController);
        const scroll = viewport.viewportScrollY;
        controller.scrollToNode(caret.position);
        expect(viewport.viewportScrollY).toBe(scroll);

        viewport.scrollToViewportPos({ viewportScrollY: viewport.viewportScrollY + 400 / scale });
        controller.scrollToNode(caret.position);
        assertPosition();
    });

    it('does not move a visible caret or pull the document back as the keyboard closes', () => {
        const { viewport, setCaret, setKeyboardHeight } = createRender();
        setCaret(0);
        const initialScroll = viewport.viewportScrollY;
        setKeyboardHeight(380);
        expect(viewport.viewportScrollY).toBe(initialScroll);

        viewport.scrollToViewportPos({ viewportScrollY: 100 });
        setKeyboardHeight(180);
        expect(viewport.viewportScrollY).toBeCloseTo(100);
        setKeyboardHeight(0);
        expect(viewport.viewportScrollY).toBeCloseTo(100);
    });

    it('does not apply mobile keyboard compensation to desktop documents', () => {
        const { viewport, setCaret, setKeyboardHeight } = createRender(false);
        setCaret(15);
        const initialScroll = viewport.viewportScrollY;
        setKeyboardHeight(380);
        expect(viewport.viewportScrollY).toBe(initialScroll);
    });
});
