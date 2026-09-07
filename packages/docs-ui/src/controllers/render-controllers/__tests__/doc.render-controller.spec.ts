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
import type { IDocLayoutExecutor } from '@univerjs/docs';
import type { Documents, IPointerEvent, RenderUnit } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentFlavor,
    DrawingTypeEnum,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateEmitService,
    InsertTextCommand,
    RichTextEditingMutation,
    SetTextSelectionsOperation,
} from '@univerjs/docs';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { ILayoutService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { AfterSpaceCommand } from '../../../commands/commands/auto-format.command';
import { BreakLineCommand } from '../../../commands/commands/break-line.command';
import { IMEInputCommand } from '../../../commands/commands/ime-input.command';
import { DocAutoFormatService } from '../../../services/doc-auto-format.service';
import { DocIMEInputManagerService } from '../../../services/doc-ime-input-manager.service';
import { DocLayoutInteractionService } from '../../../services/doc-layout-interaction.service';
import { DocMenuStyleService } from '../../../services/doc-menu-style.service';
import { DocPageLayoutService } from '../../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../../services/doc-view-scale';
import { EditorService, IEditorService } from '../../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { cursorConvertToTextRange } from '../../../services/selection/text-range';
import { DocBackScrollRenderController } from '../back-scroll.render-controller';
import { DocIMEInputController } from '../doc-ime-input.controller';
import { DocInputController } from '../doc-input.controller';
import { DocSelectionRenderController } from '../doc-selection-render.controller';
import { DocRenderController } from '../doc.render-controller';

function createEditor(paragraphCount = 8, withDrawing = true, workerBeforeLayout = false, documentFlavor = DocumentFlavor.TRADITIONAL) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const root = document.createElement('div');
    document.body.appendChild(root);
    injector.add([ILayoutService, { useValue: {
        rootContainerElement: root,
        registerContainerElement: () => ({ dispose() {} }),
    } as unknown as ILayoutService }]);
    injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
    injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
    injector.add([DocLayoutExecutorService]);
    // The transport boundary stays pending; the real controller and coordinator
    // must still hand off before Main paginates the entire document.
    const registerWorker = () => injector.get(DocLayoutExecutorService).register({
        type: 'worker',
        initialize: () => new Promise<void>(() => {}),
        disposeSession: async () => {},
    } as unknown as IDocLayoutExecutor);
    let registration = workerBeforeLayout ? registerWorker() : undefined;
    const startWorkerLayout = vi.spyOn(injector.get(DocLayoutExecutorService), 'startLayout');
    injector.add([DocSelectionManagerService]);
    injector.add([DocAutoFormatService]);
    injector.add([DocStateEmitService]);
    injector.add([DocMenuStyleService]);
    injector.add([IEditorService, { useClass: EditorService }]);
    const commands = injector.get(ICommandService);
    [InsertTextCommand, AfterSpaceCommand, BreakLineCommand, IMEInputCommand, RichTextEditingMutation, SetTextSelectionsOperation]
        .forEach((command) => commands.registerCommand(command));
    const firstParagraph = 'Hello world';
    const drawingToken = withDrawing ? DataStreamTreeTokenType.CUSTOM_BLOCK : '';
    const separator = documentFlavor === DocumentFlavor.MODERN ? '\r\r' : '\r';
    const dataStream = `${firstParagraph}\r${drawingToken}${Array.from({ length: paragraphCount }, (_, i) => `Paragraph ${i} has enough words to wrap across several lines.${separator}`).join('')}\n`;
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'bounded-caret-test',
        // A drawing on the edited page deliberately keeps the conservative
        // deferred path covered, independently of font-specific line wrapping.
        drawings: withDrawing
            ? {
                'inline-drawing': {
                    drawingId: 'inline-drawing',
                    unitId: 'bounded-caret-test',
                    subUnitId: 'bounded-caret-test',
                    drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 30, height: 20 },
                    },
                },
            }
            : {},
        body: {
            dataStream,
            customBlocks: withDrawing ? [{ blockId: 'inline-drawing', startIndex: firstParagraph.length + 1 }] : [],
            paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                startIndex: match.index!,
                paragraphId: `paragraph_${index}`,
                paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
            })),
            sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'section_test' }],
        },
        documentStyle: {
            ...(workerBeforeLayout ? { autoHyphenation: BooleanNumber.FALSE } : {}),
            documentFlavor,
            pageSize: { width: 300, height: 700 },
            textStyle: { ff: 'Arial', fs: 14 },
            marginLeft: 20,
            marginRight: 20,
            marginTop: 20,
            marginBottom: 20,
        },
    });
    const unitId = model.getUnitId();
    const instances = injector.get(IUniverInstanceService);
    instances.setCurrentUnitForType(unitId);
    instances.focusUnit(unitId);
    const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
    render.engine.resizeBySize(800, 600);
    render.deactivate();
    render.addRenderDependencies([
        [DocSkeletonManagerService],
        [DocSelectionRenderService],
        [DocViewScaleService],
        [DocPageLayoutService],
        [DocLayoutInteractionService],
        [DocRenderController],
        [DocBackScrollRenderController],
        [DocSelectionRenderController],
        [DocInputController],
        [DocIMEInputManagerService],
        [DocIMEInputController],
    ]);
    const selection = render.with(DocSelectionRenderService);
    const selectionManager = injector.get(DocSelectionManagerService);
    const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
    if (!workerBeforeLayout) {
        const firstLine = skeleton.getSkeletonData()!.pages[0].sections[0].columns[0].lines[0];
        expect(firstLine.ed).toBe(firstParagraph.length);
        expect(firstLine.lineHeight).toBeGreaterThan(0);
        expect(skeleton.getSkeletonData()!.pages[0].skeDrawings.size).toBe(withDrawing ? 1 : 0);
    }
    // Worker transport is unavailable in jsdom. Keep it uninitialized so the
    // real Main coordinator must publish the bounded interaction window.
    registration ??= registerWorker();
    if (!workerBeforeLayout) {
        selection.replaceDocRanges([{ startOffset: 5, endOffset: 5 }], true, { shouldFocus: false });
    }
    const input = root.querySelector<HTMLDivElement>('[data-u-comp="editor"]')!;
    return {
        commands,
        input,
        model,
        render,
        selection,
        selectionManager,
        skeleton,
        startWorkerLayout,
        unitId,
        dispose(): void {
            registration?.dispose();
            univer.dispose();
            root.remove();
        },
    };
}

describe('DocRenderController bounded input publication', () => {
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
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('keeps short Modern edits and spaces complete while Worker initialization is pending', async () => {
        const editor = createEditor(3, false, false, DocumentFlavor.MODERN);
        try {
            await vi.dynamicImportSettled();
            const beginExternalLayout = vi.spyOn(editor.skeleton, 'beginExternalLayout');
            const applyLayoutPublication = vi.spyOn(editor.skeleton, 'applyLayoutPublication');
            for (const [index, text] of ['A', ' ', '中', 'B'].entries()) {
                editor.input.textContent = text;
                editor.input.dispatchEvent(new InputEvent('input', { data: text, inputType: 'insertText' }));
                await Promise.resolve();
                await Promise.resolve();
                expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(6 + index);
                expect(editor.selection.getActiveTextRange()?.endOffset).toBe(6 + index);
                expect(editor.skeleton.getLayoutProgress()?.complete ?? true).toBe(true);
                expect(editor.skeleton.findNodeByCharIndex(editor.model.getBody()!.dataStream.length - 3)).toBeDefined();
            }
            expect(editor.model.getBody()?.dataStream.startsWith('HelloA 中B world')).toBe(true);
            expect(await editor.commands.executeCommand(BreakLineCommand.id)).toBe(true);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(10);
            editor.input.textContent = 'C';
            editor.input.dispatchEvent(new InputEvent('input', { data: 'C', inputType: 'insertText' }));
            await Promise.resolve();
            await Promise.resolve();
            expect(editor.model.getBody()?.dataStream.startsWith('HelloA 中B\rC world')).toBe(true);
            expect(editor.skeleton.getLayoutProgress()?.complete ?? true).toBe(true);
            await vi.advanceTimersByTimeAsync(1_000);
            expect(editor.startWorkerLayout).toHaveBeenCalledTimes(1);
            expect(beginExternalLayout).not.toHaveBeenCalled();
            expect(applyLayoutPublication).not.toHaveBeenCalled();
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(11);
        } finally {
            editor.dispose();
        }
    });

    it.each([1, 500])('opens %i paragraphs without waiting for full Main pagination', async (paragraphCount) => {
        vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) =>
            window.setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 10 }), 0));
        vi.stubGlobal('cancelIdleCallback', (id: number) => window.clearTimeout(id));
        const editor = createEditor(paragraphCount, false, true);
        try {
            await vi.advanceTimersByTimeAsync(1_000);
            expect(editor.startWorkerLayout).toHaveBeenCalledTimes(paragraphCount === 1 ? 0 : 1);
            expect(editor.skeleton.hasCompleteLayout()).toBe(paragraphCount === 1);
            const pages = editor.skeleton.getSkeletonData()!.pages;
            expect(pages.length).toBeGreaterThan(0);
            expect(pages.length).toBeLessThanOrEqual(5);
            expect(pages.every((page) => page.sections.length > 0)).toBe(true);
        } finally {
            editor.dispose();
        }
    });

    it('publishes the initial caret as soon as the first foreground page is ready', async () => {
        const editor = createEditor(500, false, true);
        try {
            expect(editor.selection.getActiveTextRange()).toBeUndefined();
            expect(document.activeElement).toBe(editor.input);

            await vi.advanceTimersByTimeAsync(1_000);

            expect(editor.skeleton.hasCompleteLayout()).toBe(false);
            expect(editor.skeleton.getSkeletonData()!.pages.length).toBeLessThanOrEqual(5);
            expect(editor.selection.getActiveTextRange()).toMatchObject({
                startOffset: 0,
                endOffset: 0,
            });
        } finally {
            editor.dispose();
        }
    });

    it.each(['A', '中'])('publishes the %s caret with its page without an intermediate wrong coordinate', async (text) => {
        const editor = createEditor();
        try {
            // Initial synchronous layout can initiate code-split dictionaries.
            // Resolve that fixture setup before measuring one input frame.
            await vi.dynamicImportSettled();
            const before = editor.selection.getActiveTextRange()!.getAnchor()!.left;
            const calculate = vi.spyOn(editor.skeleton, 'calculate');
            const steps = vi.spyOn(editor.skeleton, 'stepIncrementalLayout');
            await editor.commands.executeCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: text },
            });
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            expect(calculate).not.toHaveBeenCalled();
            expect(steps.mock.calls.length).toBeLessThanOrEqual(4);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(6);
            expect(editor.selection.getActiveTextRange()!.getAnchor()!.left).toBe(before);
            await vi.advanceTimersByTimeAsync(20);
            const expected = cursorConvertToTextRange(
                editor.render.scene,
                { startOffset: 6, endOffset: 6 },
                editor.skeleton,
                editor.render.mainComponent as Documents
            )!;
            expect(editor.selection.getActiveTextRange()!.getAnchor()!.left).toBe(expected.getAnchor()!.left);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(6);
            expected.dispose();
        } finally {
            editor.dispose();
        }
    });

    it('keeps consecutive native input ordered before the next layout frame', async () => {
        const editor = createEditor();
        try {
            for (const text of ['A', 'B', 'C']) {
                editor.input.textContent = text;
                editor.input.dispatchEvent(new InputEvent('input', { data: text, inputType: 'insertText' }));
                await Promise.resolve();
                await Promise.resolve();
                expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            }
            expect(editor.model.getBody()?.dataStream.startsWith('HelloABC world')).toBe(true);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(8);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(8);
        } finally {
            editor.dispose();
        }
    });

    it.each(['A', '中'])('publishes page-first %s text and caret before waiting for a frame', async (text) => {
        const editor = createEditor(30, false);
        try {
            const previousSkeleton = editor.skeleton.getSkeletonData();
            const steps = vi.spyOn(editor.skeleton, 'stepIncrementalLayout');
            await editor.commands.executeCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: text },
            });
            expect(editor.model.getBody()?.dataStream.startsWith(`Hello${text} world`)).toBe(true);
            expect(editor.skeleton.getSkeletonData()).not.toBe(previousSkeleton);
            expect(editor.skeleton.findNodeByCharIndex(5)?.content).toContain(text);
            expect(steps.mock.calls.length).toBeLessThanOrEqual(4);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(6);
            expect(editor.selection.hasPendingSelection).toBe(false);
            const expected = cursorConvertToTextRange(
                editor.render.scene,
                { startOffset: 6, endOffset: 6 },
                editor.skeleton,
                editor.render.mainComponent as Documents
            )!;
            expect(editor.selection.getActiveTextRange()!.getAnchor()).toMatchObject({
                left: expected.getAnchor()!.left,
                top: expected.getAnchor()!.top,
                height: expected.getAnchor()!.height,
            });
            expected.dispose();
        } finally {
            editor.dispose();
        }
    });

    it('does not restore a queued edit caret over a newer selection', async () => {
        const editor = createEditor();
        try {
            editor.commands.syncExecuteCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: 'A' },
            });
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            editor.selection.replaceDocRanges([{ startOffset: 2, endOffset: 2 }], true, { shouldFocus: false });
            await Promise.resolve();
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(2);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(2);
        } finally {
            editor.dispose();
        }
    });

    it('uses a newer selection for native input while the edited page is pending', async () => {
        const editor = createEditor();
        try {
            await editor.commands.executeCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: 'A' },
            });
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            editor.selection.replaceDocRanges([{ startOffset: 2, endOffset: 2 }], true, { shouldFocus: false });
            editor.input.textContent = 'Z';
            editor.input.dispatchEvent(new InputEvent('input', { data: 'Z', inputType: 'insertText' }));
            await Promise.resolve();
            expect(editor.model.getBody()?.dataStream.startsWith('HeZlloA world')).toBe(true);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(3);
        } finally {
            editor.dispose();
        }
    });

    it('starts IME from a pending logical caret and commits the composed text once', async () => {
        const editor = createEditor();
        try {
            editor.input.textContent = 'A';
            editor.input.dispatchEvent(new InputEvent('input', { data: 'A', inputType: 'insertText' }));
            await Promise.resolve();
            await Promise.resolve();
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            editor.input.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
            for (const text of ['n', 'ni', '你']) {
                editor.input.dispatchEvent(new CompositionEvent('compositionupdate', { data: text }));
                for (let index = 0; index < 8; index++) {
                    await Promise.resolve();
                }
            }
            editor.input.dispatchEvent(new CompositionEvent('compositionend', { data: '你' }));
            for (let index = 0; index < 8; index++) {
                await Promise.resolve();
            }
            expect(editor.model.getBody()?.dataStream.startsWith('HelloA你 world')).toBe(true);
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(7);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBe(7);
        } finally {
            editor.dispose();
        }
    });

    it('does not restore an old input position after a pointer targets an unpublished page', async () => {
        const editor = createEditor();
        try {
            const target = cursorConvertToTextRange(
                editor.render.scene,
                { startOffset: 2, endOffset: 2 },
                editor.skeleton,
                editor.render.mainComponent as Documents
            )!;
            const anchor = target.getAnchor()!;
            const event = { offsetX: anchor.left, offsetY: anchor.top + 3, button: 0 } as IPointerEvent;
            target.dispose();
            await editor.commands.executeCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: 'A' },
            });
            editor.selection.__onPointDown(event);
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            expect(editor.selection.isOnPointerEvent).toBe(false);
            expect(editor.selectionManager.getActiveTextRange()).toBeUndefined();
            editor.input.textContent = 'B';
            editor.input.dispatchEvent(new InputEvent('input', { data: 'B', inputType: 'insertText' }));
            await vi.advanceTimersByTimeAsync(20);
            expect(editor.selection.getActiveTextRange()?.endOffset).toBeUndefined();
            editor.render.scene.onPointerUp$.emitEvent(event);
            expect(editor.selectionManager.getActiveTextRange()).toBeUndefined();
            expect(editor.model.getBody()?.dataStream.startsWith('HelloA world')).toBe(true);
            expect(editor.model.getBody()?.dataStream.includes('B')).toBe(false);
        } finally {
            editor.dispose();
        }
    });

    it('keeps a manual scroll through delayed edit publication and resumes following new input', async () => {
        const editor = createEditor(100);
        try {
            const viewport = editor.render.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!;
            expect(viewport.isActive).toBe(true);
            await editor.commands.executeCommand(InsertTextCommand.id, {
                unitId: editor.unitId,
                range: { startOffset: 5, endOffset: 5, collapsed: true },
                body: { dataStream: 'A' },
            });
            expect(editor.skeleton.getLayoutProgress()?.anchorReady).toBe(false);
            viewport.scrollToViewportPos({ viewportScrollY: 1200 });
            const manualScroll = viewport.viewportScrollY;
            expect(manualScroll).toBeGreaterThan(1000);
            await vi.advanceTimersByTimeAsync(100);
            expect(viewport.viewportScrollY).toBe(manualScroll);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(6);
            editor.input.textContent = 'B';
            editor.input.dispatchEvent(new InputEvent('input', { data: 'B', inputType: 'insertText' }));
            await vi.advanceTimersByTimeAsync(100);
            expect(editor.model.getBody()?.dataStream.startsWith('HelloAB world')).toBe(true);
            expect(editor.selectionManager.getActiveTextRange()?.endOffset).toBe(7);
            expect(viewport.viewportScrollY).toBeLessThan(manualScroll);
        } finally {
            editor.dispose();
        }
    });
});
