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

import type { IDocumentBody, IDocumentData } from '@univerjs/core';
import { DocumentDataModel, DocumentFlavor, LocaleService, SpacingRule, Univer } from '@univerjs/core';
import { Canvas, Documents, DocumentSkeleton, DocumentViewModel, DrawingGroupObject, Engine, Image, invalidateDocumentFontMetrics, MAIN_VIEW_PORT_KEY, Rect, Scene, setDocsTableRenderViewportProvider, Vector2, Viewport } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { genEmptyTable, genTableSource } from '../../commands/commands/table/table';
import { DocPageRenderComponent } from '../doc-page-render-component';

describe('document page picking', () => {
    let univer: Univer;
    let localeService: LocaleService;
    let viewport: Viewport;
    let measuringContext: CanvasRenderingContext2D;
    const originalResizeObserver = globalThis.ResizeObserver;
    let container: HTMLDivElement;
    let engine: Engine;
    let scene: Scene;
    let canvas: Canvas;

    beforeEach(() => {
        univer = new Univer();
        localeService = univer.__getInjector().get(LocaleService);
        vi.stubGlobal('ResizeObserver', class {
            observe() {}
            unobserve() {}
            disconnect() {}
        });
        container = document.createElement('div');
        container.style.width = '820px';
        container.style.height = '520px';
        document.body.appendChild(container);

        engine = new Engine('document-engine', { elementWidth: 800, elementHeight: 500, dpr: 1 });
        engine.mount(container, false);

        scene = new Scene('document-scene', engine);
        scene.transformByState({
            width: 1200,
            height: 900,
            scaleX: 1,
            scaleY: 1,
        });
        viewport = new Viewport(MAIN_VIEW_PORT_KEY, scene, {
            left: 0,
            top: 0,
            width: 600,
            height: 400,
            active: true,
            allowCache: true,
            bufferEdgeX: 10,
            bufferEdgeY: 8,
        });

        canvas = new Canvas({ width: 800, height: 500, pixelRatio: 1 });
        measuringContext ??= document.createElement('canvas').getContext('2d')!;
        vi.spyOn(measuringContext, 'measureText').mockImplementation((text) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 8,
            actualBoundingBoxDescent: 2,
        } as TextMetrics));
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(measuringContext);
        invalidateDocumentFontMetrics(() => true);
    });

    afterEach(() => {
        canvas.dispose();
        viewport.dispose();
        scene.dispose();
        engine.dispose();
        univer.dispose();
        vi.stubGlobal('ResizeObserver', originalResizeObserver);
        container.remove();
        document.body.innerHTML = '';
        vi.restoreAllMocks();
        invalidateDocumentFontMetrics(() => true);
        setDocsTableRenderViewportProvider(null);
    });

    function createParagraphLayoutTestBed(content: string, overrides: Partial<Omit<IDocumentData, 'body'>> & { body?: Partial<IDocumentBody> } = {}) {
        const dataStream = `${content}\r\n`;
        const dataModel = new DocumentDataModel({
            id: 'page-picking',
            ...overrides,
            body: {
                dataStream,
                paragraphs: [{ startIndex: content.length, paragraphId: 'paragraph' }],
                sectionBreaks: [{ startIndex: content.length + 1, sectionId: 'section' }],
                ...overrides.body,
            },
            documentStyle: {
                pageSize: { width: 400, height: 600 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
                ...overrides.documentStyle,
            },
        });
        return { dataModel, viewModel: new DocumentViewModel(dataModel) };
    }

    it.each(['image', 'shape', 'group'] as const)('selects a rear %s through page whitespace while preserving text hits', (kind) => {
        const bed = createParagraphLayoutTestBed('Editable text', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, localeService);
        skeleton.calculate();
        const documents = new DocPageRenderComponent('rear-drawing-doc', skeleton, { pageMarginLeft: 0, pageMarginTop: 0 });
        documents.transformByState({ left: 40, top: 30, width: 400, height: 600 });
        const drawing = kind === 'shape' ? new Rect('rear-shape') : new Image('rear-image', {});
        drawing.transformByState({ width: 250, height: 250 });
        const rear = kind === 'group' ? new DrawingGroupObject('rear-group', drawing) : drawing;
        if (rear instanceof DrawingGroupObject) {
            rear.setBaseBound({ left: 0, top: 0, width: 250, height: 250 });
        }
        rear.transformByState({ left: 40, top: 30, width: 250, height: 250 });
        scene.addObject(documents, 2);
        scene.addObject(rear, 1);
        try {
            const page = skeleton.getSkeletonData()!.pages[0];
            const line = page.sections[0].columns[0].lines[0];
            const glyph = line.divides[0].glyphGroup[0];
            const text = Vector2.create(40 + page.marginLeft + glyph.width / 2, 30 + page.marginTop + line.top + line.lineHeight / 2);
            const blank = Vector2.create(200, 200);
            expect(scene.pick(text)).toBe(documents);
            expect(scene.pick(blank)).toBe(rear);
            // Blank space with no underlying object still places the document caret.
            expect(scene.pick(Vector2.create(350, 300))).toBe(documents);
            rear.hide();
            expect(scene.pick(blank)).toBe(documents);
            rear.show();
            rear.evented = false;
            expect(scene.pick(blank)).toBe(documents);
            rear.evented = true;
            const foreground = new Rect('front', { left: 190, top: 190, width: 30, height: 30 });
            scene.addObject(foreground, 3);
            expect(scene.pick(blank)).toBe(foreground);
            foreground.dispose();
            // Coordinate conversion must remain correct under scene zoom.
            scene.transformByState({ scaleX: 1.5, scaleY: 1.5 });
            expect(scene.pick(Vector2.create(300, 300))).toBe(rear);
        } finally {
            documents.dispose();
            rear.dispose();
            skeleton.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([0, 48])('keeps painted text above rear drawings with %s pt paragraph spacing', (spaceAbove) => {
        const content = 'Intro\rEditable text';
        const bed = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                paragraphs: [5, content.length].map((startIndex) => ({
                    startIndex,
                    paragraphId: `paragraph-${startIndex}`,
                    paragraphStyle: { spaceAbove: { v: spaceAbove }, lineSpacing: 60, spacingRule: SpacingRule.EXACT },
                })),
            },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, localeService);
        skeleton.calculate();
        const documents = new DocPageRenderComponent('spaced-text-doc', skeleton, { pageMarginLeft: 0, pageMarginTop: 0 });
        documents.transformByState({ left: 40, top: 30, width: 400, height: 600 });
        const rear = new Rect('spaced-text-rear', { left: 40, top: 30, width: 300, height: 350 });
        scene.addObject(documents, 2);
        scene.addObject(rear, 1);
        try {
            const line = skeleton.getSkeletonData()!.pages[0].sections[0].columns[0].lines[1];
            const glyph = line.divides[0].glyphGroup[0];
            expect(line.contentHeight).toBeGreaterThan(0);
            const font = documents.extensions.get('DefaultDocsFontAndBaseLineExtension')!;
            const draw = font.draw.bind(font);
            let paintedStart: Vector2 | undefined;
            vi.spyOn(font, 'draw').mockImplementation((...args) => {
                if (args[2] === glyph) {
                    paintedStart = font.extensionOffset.spanStartPoint!.clone();
                }
                draw(...args);
            });
            documents.draw(canvas.getContext());
            expect(paintedStart).toBeDefined();
            const text = documents.transform.applyPoint(Vector2.create(paintedStart!.x + glyph.width / 2, paintedStart!.y + line.contentHeight / 2));
            expect(scene.pick(text)).toBe(documents);
            const padding = documents.transform.applyPoint(Vector2.create(paintedStart!.x + glyph.width / 2, paintedStart!.y - 4));
            expect(scene.pick(padding)).toBe(rear);
            scene.getTransformerByCreate().setSelectedControl(rear);
            expect(scene.pick(text)).toBe(documents);
            scene.transformByState({ scaleX: 1.5, scaleY: 1.5 });
            expect(scene.pick(Vector2.create(text.x * 1.5, text.y * 1.5))).toBe(documents);
        } finally {
            documents.dispose();
            rear.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('keeps table cell whitespace ahead of a rear drawing', () => {
        const tableBody = genEmptyTable(1, 1);
        const dataStream = `${tableBody.dataStream}\r\n`;
        const bed = createParagraphLayoutTestBed('', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                ...tableBody,
                dataStream,
                paragraphs: [...tableBody.paragraphs, { startIndex: dataStream.length - 2, paragraphId: 'tail' }],
                sectionBreaks: [...tableBody.sectionBreaks, { startIndex: dataStream.length - 1, sectionId: 'tail-section' }],
                tables: [{ startIndex: 0, endIndex: tableBody.dataStream.length, tableId: 'table-1' }],
            },
            tableSource: { 'table-1': { ...genTableSource(1, 1, 120), tableId: 'table-1' } },
        });
        const skeleton = DocumentSkeleton.create(bed.viewModel, localeService);
        skeleton.calculate();
        const documents = new DocPageRenderComponent('rear-table-doc', skeleton, { pageMarginLeft: 0, pageMarginTop: 0 });
        documents.transformByState({ width: 400, height: 600 });
        const rear = new Image('rear-table-image', { left: 0, top: 0, width: 300, height: 250 });
        scene.addObject(documents, 2);
        scene.addObject(rear, 1);
        try {
            const page = skeleton.getSkeletonData()!.pages[0];
            const table = page.skeTables.get('table-1')!;
            expect(table).toBeDefined();
            expect(scene.pick(Vector2.create(page.marginLeft + table.left + table.width / 2, page.marginTop + table.top + table.height / 2))).toBe(documents);
            expect(scene.pick(Vector2.create(250, 200))).toBe(rear);
        } finally {
            documents.dispose();
            rear.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('leaves the shared text renderer opaque over rear objects', () => {
        const bed = createParagraphLayoutTestBed('Text');
        const skeleton = DocumentSkeleton.create(bed.viewModel, localeService);
        skeleton.calculate();
        const documents = new Documents('shared-text', skeleton);
        documents.transformByState({ width: 400, height: 600 });
        const rear = new Rect('rear', { width: 300, height: 250 });
        scene.addObject(documents, 2);
        scene.addObject(rear, 1);
        try {
            expect(scene.pick(Vector2.create(200, 200))).toBe(documents);
        } finally {
            documents.dispose();
            rear.dispose();
            skeleton.dispose();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });
});
