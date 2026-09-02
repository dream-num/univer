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
import type { IGalleryProps } from '@univerjs/design';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import {
    BooleanNumber,
    DataStreamTreeTokenType,
    DisposableCollection,
    DOC_DRAWING_PRINTING_COMPONENT_KEY,
    DocumentFlavor,
    DrawingTypeEnum,
    IImageIoService,
    ImageSourceType,
    IURLImageService,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    TableTextWrapType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocPrintInterceptorService } from '@univerjs/docs-ui';
import { DrawingManagerService, getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { DrawingImageClipService, DrawingRenderService } from '@univerjs/drawing-ui';
import { Documents, DocumentSkeleton, DocumentViewModel, Engine, Scene } from '@univerjs/engine-render';
import { ComponentManager, IGalleryService } from '@univerjs/ui';
import { EMPTY, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountDocPrintingFloatDom } from '../../views/DocPrintingFloatDom';
import { DocDrawingPrintingController } from '../doc-drawing-printing.controller';

vi.mock('../../views/DocPrintingFloatDom', () => ({
    mountDocPrintingFloatDom: vi.fn(() => vi.fn()),
}));

describe('DocDrawingPrintingController with real layout and drawing services', () => {
    let univer: Univer;
    let engine: Engine;
    let scene: Scene;
    let skeleton: DocumentSkeleton;
    let documents: Documents;
    let printService: DocPrintInterceptorService;
    const unitId = 'print-images';
    const imageIds = ['body-first', 'cell-image', 'body-second', 'header-image', 'footer-image'];

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
        const cachedImage = document.createElement('img');
        Object.defineProperties(cachedImage, {
            complete: { value: true },
            naturalWidth: { value: 16 },
            naturalHeight: { value: 16 },
        });
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IImageIoService, { useValue: {
            change$: EMPTY,
            setWaitCount: () => {},
            getImage: async () => '',
            saveImage: async () => null,
            getImageSourceCache: () => cachedImage,
            addImageSourceCache: () => {},
        } }]);
        injector.add([IURLImageService, { useValue: {
            getImage: async (url: string) => url,
            downloadImage: async () => new Blob(),
            registerURLImageDownloader: () => ({ dispose: () => {} }),
        } }]);
        injector.add([IGalleryService, { useValue: {
            gallery$: new Subject<IGalleryProps>(),
            open: () => ({ dispose: () => {} }),
            close: () => {},
        } }]);
        injector.add([DrawingImageClipService]);
        injector.add([DrawingRenderService]);
        injector.add([ComponentManager]);
        injector.add([DocPrintInterceptorService]);
        injector.add([DocDrawingPrintingController]);

        const T = DataStreamTreeTokenType;
        const table = `${T.TABLE_START}${T.TABLE_ROW_START}${T.TABLE_CELL_START}${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}${T.TABLE_CELL_END}${T.TABLE_ROW_END}${T.TABLE_END}`;
        const dataStream = `${T.CUSTOM_BLOCK}${T.PARAGRAPH}${table}${T.PARAGRAPH}${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}`;
        const drawings: Record<string, IDocDrawing> = Object.fromEntries(imageIds.map((drawingId) => [drawingId, {
            unitId,
            subUnitId: unitId,
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: drawingId,
            transform: { left: 10, top: 10, width: 16, height: 16, angle: 0 },
            docTransform: {
                size: { width: 16, height: 16 },
                positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                angle: 0,
            },
            layoutType: PositionedObjectLayoutType.INLINE,
        }]));
        const segmentBody = (blockId: string) => ({
            dataStream: `${T.CUSTOM_BLOCK}${T.PARAGRAPH}${T.SECTION_BREAK}`,
            paragraphs: [{ startIndex: 1, paragraphId: `${blockId}-p` }],
            sectionBreaks: [{ startIndex: 2, sectionId: `${blockId}-s` }],
            customBlocks: [{ startIndex: 0, blockId }],
        });
        const snapshot: IDocumentData = {
            id: unitId,
            body: {
                dataStream,
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match, index) => ({
                    startIndex: match.index!,
                    paragraphId: `p-${index}`,
                    paragraphStyle: { pageBreakBefore: index === 3 ? BooleanNumber.TRUE : BooleanNumber.FALSE },
                })),
                sectionBreaks: [...dataStream.matchAll(/\n/g)].map((match, index) => ({ startIndex: match.index!, sectionId: `s-${index}` })),
                customBlocks: [
                    { startIndex: 0, blockId: 'body-first' },
                    { startIndex: 5, blockId: 'cell-image' },
                    { startIndex: dataStream.length - 3, blockId: 'body-second' },
                ],
                tables: [{ startIndex: 2, endIndex: 2 + table.length, tableId: 'table' }],
            },
            headers: { header: { headerId: 'header', body: segmentBody('header-image') } },
            footers: { footer: { footerId: 'footer', body: segmentBody('footer-image') } },
            drawings,
            drawingsOrder: imageIds,
            tableSource: {
                table: {
                    tableId: 'table',
                    align: TableAlignmentType.START,
                    indent: { v: 0 },
                    textWrap: TableTextWrapType.NONE,
                    position: {
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE },
                    },
                    dist: { distT: 0, distB: 0, distL: 0, distR: 0 },
                    size: { type: TableSizeType.SPECIFIED, width: { v: 160 } },
                    tableRows: [{
                        tableCells: [{}],
                        trHeight: { val: { v: 25 }, hRule: TableRowHeightRule.AT_LEAST },
                    }],
                    tableColumns: [{ size: { type: TableSizeType.SPECIFIED, width: { v: 160 } } }],
                },
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                autoHyphenation: BooleanNumber.FALSE,
                pageSize: { width: 240, height: 400 },
                marginTop: 50,
                marginBottom: 50,
                marginLeft: 20,
                marginRight: 20,
                marginHeader: 10,
                marginFooter: 10,
                defaultHeaderId: 'header',
                defaultFooterId: 'footer',
            },
        };
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, snapshot);
        skeleton = DocumentSkeleton.create(new DocumentViewModel(model), injector.get(LocaleService));
        skeleton.calculate();
        expect(skeleton.getSkeletonData()!.pages).toHaveLength(2);
        engine = new Engine('print-engine', { elementWidth: 240, elementHeight: 400 });
        scene = new Scene('print-scene', engine);
        documents = new Documents('print-document', skeleton);
        const drawingManager = injector.get(IDrawingManagerService);
        drawingManager.registerDrawingData(unitId, { [unitId]: { data: drawings, order: imageIds } });
        drawingManager.setDrawingEditable(false);
        printService = injector.get(DocPrintInterceptorService);
        injector.get(DocDrawingPrintingController);
    });

    afterEach(() => {
        scene?.dispose();
        engine?.dispose();
        skeleton?.dispose();
        univer?.dispose();
        vi.restoreAllMocks();
        vi.clearAllMocks();
    });

    function collect(pageIndex?: number): void {
        printService.interceptor.fetchThroughInterceptors(
            printService.interceptor.getInterceptPoints().PRINTING_COMPONENT_COLLECT
        )(undefined, { unitId, scene, engine, skeleton, documents, pageIndex, root: document.createElement('div') });
    }

    function renderedImageIds(): string[] {
        return imageIds.filter((drawingId) => scene.getObject(getDrawingShapeKeyByDrawingSearch({ unitId, subUnitId: unitId, drawingId })) != null);
    }

    it('prints table-cell images with their host page and omits the other body page', () => {
        const page = skeleton.getSkeletonData()!.pages[0];
        expect(page.skeTables.get('table')!.rows[0].cells[0].skeDrawings.has('cell-image')).toBe(true);
        collect(0);
        expect(renderedImageIds()).toEqual(['body-first', 'cell-image', 'header-image', 'footer-image']);
    });

    it('prints repeated header and footer images on the second page', () => {
        const data = skeleton.getSkeletonData()!;
        expect(data.skeHeaders.get(data.pages[1].headerId)!.get(data.pages[1].pageWidth)!.skeDrawings.has('header-image')).toBe(true);
        expect(data.skeFooters.get(data.pages[1].footerId)!.get(data.pages[1].pageWidth)!.skeDrawings.has('footer-image')).toBe(true);
        collect(1);
        expect(renderedImageIds()).toEqual(['body-second', 'header-image', 'footer-image']);
    });

    it('keeps unfiltered drawing collection when there is no traditional page index', () => {
        collect();
        expect(renderedImageIds()).toEqual(imageIds);
    });

    it('does not render another page when the requested print page is missing', () => {
        collect(2);
        expect(renderedImageIds()).toEqual([]);
    });

    it.each([
        [0, ['body-first', 'cell-image', 'header-image', 'footer-image']],
        [1, ['body-second', 'header-image', 'footer-image']],
    ] as const)('collects DOM drawings only from page %i including its tables and repeated segments', (pageIndex, expectedIds) => {
        const injector = univer.__getInjector();
        const manager = injector.get(IDrawingManagerService);
        const drawings = Object.fromEntries(imageIds.map((drawingId) => [drawingId, {
            unitId,
            subUnitId: unitId,
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_DOM,
            componentKey: 'custom-dom',
        }]));
        manager.setDrawingData(unitId, unitId, drawings);
        injector.get(ComponentManager).register('custom-dom', () => null);
        const disposables = new DisposableCollection();
        printService.interceptor.fetchThroughInterceptors(
            printService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT
        )(disposables, {
            unitId,
            scene,
            engine,
            skeleton,
            pageIndex,
            root: document.createElement('div'),
            offset: { x: 0, y: 0 },
            bound: { top: 0, left: 0, right: 240, bottom: 400 },
        });
        const props = vi.mocked(mountDocPrintingFloatDom).mock.calls[0][0];
        expect(props.floatDomInfos.map((drawing) => drawing.drawingId)).toEqual(expectedIds);
        disposables.dispose();
    });

    it('mounts chart and DOM print components and disposes their DOM mount', () => {
        const injector = univer.__getInjector();
        const manager = injector.get(IDrawingManagerService);
        const domDrawing = { unitId, subUnitId: unitId, drawingId: 'dom', drawingType: DrawingTypeEnum.DRAWING_DOM, componentKey: 'custom-dom' };
        manager.setDrawingData(unitId, unitId, {
            chart: { unitId, subUnitId: unitId, drawingId: 'chart', drawingType: DrawingTypeEnum.DRAWING_CHART },
            dom: domDrawing,
        });
        manager.setDrawingOrder(unitId, unitId, ['chart', 'dom']);
        const chartComponent = () => null;
        const domComponent = () => null;
        injector.get(ComponentManager).register(DOC_DRAWING_PRINTING_COMPONENT_KEY, chartComponent);
        injector.get(ComponentManager).register('custom-dom-print', domComponent);
        printService.registerPrintComponent('custom-dom', 'custom-dom-print');
        const unmount = vi.fn();
        vi.mocked(mountDocPrintingFloatDom).mockReturnValueOnce(unmount);
        const disposables = new DisposableCollection();
        const root = document.createElement('div');
        const result = printService.interceptor.fetchThroughInterceptors(
            printService.interceptor.getInterceptPoints().PRINTING_DOM_COLLECT
        )(disposables, { unitId, scene, engine, root, skeleton, offset: { x: 0, y: 0 }, bound: { top: 0, left: 0, right: 240, bottom: 400 } });
        expect(mountDocPrintingFloatDom).toHaveBeenCalledWith(
            expect.objectContaining({
                floatDomInfos: [
                    expect.objectContaining({ drawingId: 'chart', componentKey: chartComponent }),
                    expect.objectContaining({ drawingId: 'dom', componentKey: domComponent }),
                ],
            }),
            root,
            injector
        );
        expect(result).toBe(disposables);
        disposables.dispose();
        expect(unmount).toHaveBeenCalledOnce();
    });
});
