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

import { DOC_DRAWING_PRINTING_COMPONENT_KEY, DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { mountDocPrintingFloatDom } from '../../views/DocPrintingFloatDom';
import { DocDrawingPrintingController } from '../doc-drawing-printing.controller';

vi.mock('../../views/DocPrintingFloatDom', () => ({
    mountDocPrintingFloatDom: vi.fn(() => vi.fn()),
}));

function createController() {
    const interceptors = new Map<string, any>();
    const points = {
        PRINTING_COMPONENT_COLLECT: 'PRINTING_COMPONENT_COLLECT',
        PRINTING_DOM_COLLECT: 'PRINTING_DOM_COLLECT',
    };
    const drawings = {
        'unit-1': {
            order: ['image-1', 'chart-1', 'dom-1'],
            data: {
                'image-1': { drawingId: 'image-1', drawingType: DrawingTypeEnum.DRAWING_IMAGE },
                'chart-1': { drawingId: 'chart-1', drawingType: DrawingTypeEnum.DRAWING_CHART },
                'dom-1': { drawingId: 'dom-1', drawingType: DrawingTypeEnum.DRAWING_DOM, componentKey: 'custom-dom' },
            },
        },
    };
    const controller = new DocDrawingPrintingController(
        {
            getPrintComponent: vi.fn((key: string) => `${key}-print`),
            interceptor: {
                getInterceptPoints: vi.fn(() => points),
                intercept: vi.fn((point, config) => {
                    interceptors.set(point, config);
                    return { dispose: vi.fn() };
                }),
            },
        } as never,
        { renderDrawing: vi.fn() } as never,
        { getDrawingDataForUnit: vi.fn(() => drawings) } as never,
        {
            get: vi.fn((key) => {
                if (key === DOC_DRAWING_PRINTING_COMPONENT_KEY) return 'ChartPrintingComponent';
                return `${key}-Component`;
            }),
        } as never,
        {} as never
    );

    return { controller, interceptors, points };
}

describe('DocDrawingPrintingController', () => {
    it('renders printable image drawings into the print scene and skips chart/dom canvas rendering', () => {
        const { controller, interceptors, points } = createController();
        const next = vi.fn();
        const scene = {};

        interceptors.get(points.PRINTING_COMPONENT_COLLECT).handler(null, { unitId: 'unit-1', scene }, next);

        expect((controller as any)._drawingRenderService.renderDrawing).toHaveBeenCalledTimes(1);
        expect((controller as any)._drawingRenderService.renderDrawing).toHaveBeenCalledWith(
            expect.objectContaining({ drawingId: 'image-1' }),
            scene
        );
        expect(next).toHaveBeenCalled();

        controller.dispose();
    });

    it('mounts chart and dom float components for printing and registers cleanup', () => {
        const { controller, interceptors, points } = createController();
        const unmount = vi.fn();
        vi.mocked(mountDocPrintingFloatDom).mockReturnValueOnce(unmount);
        const add = vi.fn((dispose: () => void) => dispose());
        const next = vi.fn((value) => value);
        const disposableCollection = { add };

        const result = interceptors.get(points.PRINTING_DOM_COLLECT).handler(disposableCollection, {
            unitId: 'unit-1',
            scene: 'scene',
            skeleton: 'skeleton',
            offset: 'offset',
            bound: 'bound',
            root: 'root',
        }, next);

        expect(mountDocPrintingFloatDom).toHaveBeenCalledWith(
            expect.objectContaining({
                unitId: 'unit-1',
                floatDomInfos: [
                    expect.objectContaining({ drawingId: 'chart-1', componentKey: 'ChartPrintingComponent' }),
                    expect.objectContaining({ drawingId: 'dom-1', componentKey: 'custom-dom-print-Component' }),
                ],
            }),
            'root',
            expect.any(Object)
        );
        expect(add).toHaveBeenCalled();
        expect(unmount).toHaveBeenCalled();
        expect(result).toBe(disposableCollection);

        controller.dispose();
    });
});
