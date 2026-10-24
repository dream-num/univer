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

import { DrawingTypeEnum, ImageSourceType, LocaleService, LocaleType } from '@univerjs/core';
import { getDrawingShapeKeyByDrawingSearch, IDrawingManagerService } from '@univerjs/drawing';
import { DrawingImageClipService, DrawingRenderService } from '@univerjs/drawing-ui';
import { CanvasColorService, ICanvasColorService, Image, IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintingResourceCollector, SheetPrintInterceptorService } from '@univerjs/sheets-ui';
import { ComponentManager, DesktopGalleryService, IGalleryService, IUIPartsService, UIPartsService } from '@univerjs/ui';
import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import enUS from '../../locale/en-US';
import { SheetDrawingPrintingController } from '../sheet-drawing-printing.controller';

function installCanvasPlatformDouble(): void {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        return new Proxy({ canvas: this }, { get: (target, key) => key in target ? target[key as keyof typeof target] : () => undefined }) as never;
    });
}

describe('SheetDrawingPrintingController', () => {
    afterEach(() => vi.restoreAllMocks());
    it('rejects a Chart Sheet page when a visible image cannot be decoded', async () => {
        installCanvasPlatformDouble();
        const bed = createSheetsDrawingUiTestBed();
        onTestFinished(() => bed.univer.dispose());
        bed.injector.add([SheetPrintInterceptorService]);
        bed.injector.add([IUIPartsService, { useClass: UIPartsService }]);
        bed.injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
        bed.injector.add([DrawingImageClipService]);
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
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            source: 'data:image/png;base64,invalid',
            imageSourceType: ImageSourceType.BASE64,
            transform: { left: 0, top: 0, width: 100, height: 50 },
        };
        drawingManager.setDrawingData(bed.unitId, bed.subUnitId, { 'image-1': drawing } as never);
        drawingManager.setDrawingOrder(bed.unitId, bed.subUnitId, ['image-1']);
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
            sourceRect: { x: 0, y: 0, width: 100, height: 50 },
            contentRect: { x: 0, y: 0, width: 100, height: 50 },
            offset: { offsetX: 0, offsetY: 0 },
        });
        const shapeKey = getDrawingShapeKeyByDrawingSearch(drawing);
        await vi.waitFor(() => expect(renderer.scene.getObject(shapeKey)).toBeInstanceOf(Image));
        const native = (renderer.scene.getObject(shapeKey) as Image).getNative()!;
        native.onerror?.(new Event('error'));
        await expect(collector.wait()).rejects.toThrow();
        collector.close();
    });

    it('makes visible unsupported Chart Sheet objects a required print failure with an owner diagnostic', async () => {
        installCanvasPlatformDouble();
        const bed = createSheetsDrawingUiTestBed();
        onTestFinished(() => bed.univer.dispose());
        bed.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
        bed.injector.add([SheetPrintInterceptorService]);
        bed.injector.add([IUIPartsService, { useClass: UIPartsService }]);
        bed.injector.add([IGalleryService, { useClass: DesktopGalleryService }]);
        bed.injector.add([DrawingImageClipService]);
        bed.injector.add([DrawingRenderService]);
        bed.injector.add([ComponentManager]);
        bed.injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        bed.injector.add([SheetDrawingPrintingController]);
        bed.get(SheetDrawingPrintingController);
        const drawingManager = bed.get(IDrawingManagerService);
        drawingManager.setDrawingData(bed.unitId, bed.subUnitId, {
            'dom-1': {
                unitId: bed.unitId,
                subUnitId: bed.subUnitId,
                drawingId: 'dom-1',
                drawingType: DrawingTypeEnum.DRAWING_DOM,
                componentKey: 'custom-dom',
                transform: { left: 0, top: 0, width: 100, height: 50 },
            },
        } as never);
        drawingManager.setDrawingOrder(bed.unitId, bed.subUnitId, ['dom-1']);
        const collector = new SheetPrintingResourceCollector();
        const interceptor = bed.get(SheetPrintInterceptorService);
        const renderer = bed.get(IRenderManagerService).createRender(bed.unitId);
        interceptor.interceptor.fetchThroughInterceptors(interceptor.interceptor.getInterceptPoints().PRINTING_CHART_DOM_COLLECT)(undefined, {
            unitId: bed.unitId,
            subUnitId: bed.subUnitId,
            scene: renderer.scene,
            engine: renderer.engine,
            root: document.createElement('div'),
            worksheet: bed.workbook.getSheetBySheetId(bed.subUnitId)!,
            resourceCollector: collector,
            sourceRect: { x: 0, y: 0, width: 100, height: 50 },
            contentRect: { x: 0, y: 0, width: 100, height: 50 },
            offset: { offsetX: 0, offsetY: 0 },
        });
        await expect(collector.wait()).rejects.toThrow();
        expect(collector.failureMessage).toBe('The Chart Sheet contains objects that cannot be printed yet.');
    });
});
