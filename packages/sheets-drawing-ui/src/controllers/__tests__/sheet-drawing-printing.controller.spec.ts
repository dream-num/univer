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

import {
    DisposableCollection,
    DrawingTypeEnum,
    IImageIoService,
    ImageSourceType,
    SheetTypes,
} from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { DrawingImageClipService, DrawingRenderService, OleUIService } from '@univerjs/drawing-ui';
import { CanvasColorService, ICanvasColorService, Image, IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintingResourceCollector, SheetPrintInterceptorService } from '@univerjs/sheets-ui';
import {
    ComponentManager,
    DesktopDialogService,
    DesktopGalleryService,
    DesktopMessageService,
    DesktopNotificationService,
    IDialogService,
    IGalleryService,
    IMessageService,
    INotificationService,
    IUIPartsService,
    UIPartsService,
} from '@univerjs/ui';
import { act, createElement } from 'react';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import { SheetDrawingPrintingController } from '../sheet-drawing-printing.controller';

function installCanvasPlatformDouble(): void {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return new Proxy({ canvas: this }, { get: (target, key) => key in target ? target[key as keyof typeof target] : () => undefined }) as never;
    });
}

describe('SheetDrawingPrintingController', () => {
    afterEach(() => vi.restoreAllMocks());
    it.each([DrawingTypeEnum.DRAWING_IMAGE, DrawingTypeEnum.DRAWING_OLE])('prints a Chart Sheet drawing at its original placement without editor interaction (type: %s)', async (drawingType) => {
        installCanvasPlatformDouble();
        const bed = createSheetsDrawingUiTestBed();
        onTestFinished(() => bed.univer.dispose());
        bed.injector.add([SheetPrintInterceptorService]);
        bed.injector.add([IUIPartsService, { useClass: UIPartsService }]);
        bed.injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
        bed.injector.add([DrawingImageClipService]);
        bed.injector.add([IMessageService, { useClass: DesktopMessageService }]);
        bed.injector.add([IDialogService, { useClass: DesktopDialogService }]);
        bed.injector.add([INotificationService, { useClass: DesktopNotificationService }]);
        bed.injector.add([OleUIService]);
        bed.injector.add([DrawingRenderService]);
        bed.injector.add([ComponentManager]);
        bed.injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        bed.injector.add([SheetDrawingPrintingController]);
        bed.get(SheetDrawingPrintingController);
        const drawingManager = bed.get(IDrawingManagerService);
        const drawing = {
            unitId: bed.unitId,
            subUnitId: bed.subUnitId,
            drawingId: 'image-1',
            drawingType,
            source: 'https://example.test/print-image.png',
            imageSourceType: ImageSourceType.URL,
            transform: { left: 20, top: 10, width: 100, height: 50 },
        };
        drawingManager.setDrawingData(bed.unitId, bed.subUnitId, { 'image-1': drawing } as never);
        drawingManager.setDrawingOrder(bed.unitId, bed.subUnitId, ['image-1']);
        const cachedImage = document.createElement('img');
        Object.defineProperties(cachedImage, {
            complete: { value: true },
            naturalWidth: { value: 100 },
            naturalHeight: { value: 50 },
        });
        bed.get(IImageIoService).addImageSourceCache(drawing.source, drawing.imageSourceType, cachedImage);
        bed.workbook.getSheetBySheetId(bed.subUnitId)!.getConfig().type = SheetTypes.CHART;
        const bindObject = vi.spyOn(bed.get(OleUIService), 'bindObject');
        const collector = new SheetPrintingResourceCollector();
        const renderer = bed.get(IRenderManagerService).createRender(bed.unitId);
        const interceptor = bed.get(SheetPrintInterceptorService);
        interceptor.interceptor.fetchThroughInterceptors(interceptor.interceptor.getInterceptPoints().PRINTING_CHART_COMPONENT_COLLECT)(undefined, {
            unitId: bed.unitId,
            subUnitId: bed.subUnitId,
            scene: renderer.scene,
            engine: renderer.engine,
            root: document.createElement('div'),
            worksheet: bed.workbook.getSheetBySheetId(bed.subUnitId)!,
            resourceCollector: collector,
            offset: { offsetX: 0, offsetY: 0 },
        });
        const shapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
        await vi.waitFor(() => expect(renderer.scene.getObject(shapeKey)).toBeInstanceOf(Image));
        await collector.wait();
        const image = renderer.scene.getObject(shapeKey) as Image;
        if (drawingType === DrawingTypeEnum.DRAWING_IMAGE) {
            expect(image.getNative()).toBe(cachedImage);
        }
        expect(bindObject).toHaveBeenCalledWith(image, expect.objectContaining({ drawingId: drawing.drawingId }), false);
        expect(image).toMatchObject(drawing.transform);
    });

    it.each([DrawingTypeEnum.DRAWING_DOM, DrawingTypeEnum.DRAWING_BLOCK])('prints a registered component for Chart Sheet drawing type %s and releases its DOM', async (drawingType) => {
        installCanvasPlatformDouble();
        const bed = createSheetsDrawingUiTestBed();
        bed.injector.add([SheetPrintInterceptorService]);
        bed.injector.add([IUIPartsService, { useClass: UIPartsService }]);
        bed.injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
        bed.injector.add([DrawingImageClipService]);
        bed.injector.add([IMessageService, { useClass: DesktopMessageService }]);
        bed.injector.add([IDialogService, { useClass: DesktopDialogService }]);
        bed.injector.add([INotificationService, { useClass: DesktopNotificationService }]);
        bed.injector.add([OleUIService]);
        bed.injector.add([DrawingRenderService]);
        bed.injector.add([ComponentManager]);
        bed.injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        bed.injector.add([SheetDrawingPrintingController]);
        const components = bed.get(ComponentManager);
        components.register('custom-dom', () => createElement('span', null, 'Editor content'));
        components.register('custom-dom-print', (props: { data?: { label: string } }) => createElement('span', null, props.data?.label));
        const interceptor = bed.get(SheetPrintInterceptorService);
        interceptor.registerPrintComponent('custom-dom', 'custom-dom-print');
        bed.get(SheetDrawingPrintingController);
        const worksheet = bed.workbook.getSheetBySheetId(bed.subUnitId)!;
        worksheet.getConfig().type = SheetTypes.CHART;
        const drawingManager = bed.get(IDrawingManagerService);
        drawingManager.setDrawingData(bed.unitId, bed.subUnitId, {
            'dom-1': {
                unitId: bed.unitId,
                subUnitId: bed.subUnitId,
                drawingId: 'dom-1',
                drawingType,
                componentKey: 'custom-dom',
                data: { label: 'Printable component content' },
                transform: { left: 20, top: 10, width: 100, height: 50 },
            },
        } as never);
        drawingManager.setDrawingOrder(bed.unitId, bed.subUnitId, ['dom-1']);
        const collector = new SheetPrintingResourceCollector();
        const effects = new DisposableCollection();
        const renderer = bed.get(IRenderManagerService).createRender(bed.unitId);
        const root = document.createElement('div');
        document.body.appendChild(root);
        onTestFinished(async () => {
            await act(async () => {
                effects.dispose();
                await Promise.resolve();
            });
            root.remove();
            bed.univer.dispose();
        });
        await act(async () => {
            interceptor.interceptor.fetchThroughInterceptors(interceptor.interceptor.getInterceptPoints().PRINTING_CHART_DOM_COLLECT)(effects, {
                unitId: bed.unitId,
                subUnitId: bed.subUnitId,
                scene: renderer.scene,
                engine: renderer.engine,
                root,
                worksheet,
                resourceCollector: collector,
                offset: { offsetX: 0, offsetY: 0 },
            });
            await Promise.resolve();
        });
        expect(root.textContent).toContain('Printable component content');
        expect(root.textContent).not.toContain('Editor content');
        await act(async () => {
            effects.dispose();
            await Promise.resolve();
        });
        expect(root.childElementCount).toBe(0);
    });
});
