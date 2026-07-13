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

import { DrawingTypeEnum } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { mountPrintingFloatDom } from '../../views/PrintingFloatDom';
import { SheetDrawingPrintingController } from '../sheet-drawing-printing.controller';

vi.mock('../../views/PrintingFloatDom', () => ({
    mountPrintingFloatDom: vi.fn(() => vi.fn()),
}));

function createController(options?: { hasDrawingData?: boolean }) {
    const interceptors = new Map<string, any>();
    const points = {
        PRINTING_COMPONENT_COLLECT: 'PRINTING_COMPONENT_COLLECT',
        PRINTING_RANGE: 'PRINTING_RANGE',
        PRINTING_DOM_COLLECT: 'PRINTING_DOM_COLLECT',
    };
    const drawingData = {
        'unit-1': {
            'sheet-1': {
                order: ['image-1', 'chart-1', 'dom-1', 'block-1', 'grouped-image', 'hidden-image', 'hidden-chart'],
                data: {
                    'image-1': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'image-1',
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        transform: { left: 20, top: 30, width: 120, height: 60 },
                    },
                    'chart-1': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'chart-1',
                        drawingType: DrawingTypeEnum.DRAWING_CHART,
                        transform: { left: 40, top: 50, width: 120, height: 60 },
                    },
                    'dom-1': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'dom-1',
                        drawingType: DrawingTypeEnum.DRAWING_DOM,
                        componentKey: 'custom-dom',
                        transform: { left: 80, top: 90, width: 40, height: 20 },
                    },
                    'block-1': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'block-1',
                        drawingType: DrawingTypeEnum.DRAWING_BLOCK,
                        componentKey: 'custom-block',
                        transform: { left: 80, top: 80, width: 20, height: 20 },
                    },
                    'grouped-image': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'grouped-image',
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        groupId: 'group-1',
                        transform: { left: -100, top: -100, width: 20, height: 20 },
                    },
                    'hidden-image': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'hidden-image',
                        drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        hidden: true,
                        transform: { left: 1000, top: 1000, width: 500, height: 500 },
                    },
                    'hidden-chart': {
                        unitId: 'unit-1',
                        subUnitId: 'sheet-1',
                        drawingId: 'hidden-chart',
                        drawingType: DrawingTypeEnum.DRAWING_CHART,
                        hidden: true,
                        transform: { left: 1000, top: 1000, width: 500, height: 500 },
                    },
                },
            },
        },
    };
    const render = {
        scene: { scaleX: 1, scaleY: 1 },
        with: vi.fn(() => ({
            getSkeletonParam: vi.fn(() => ({
                skeleton: {
                    getCellIndexByOffset: vi.fn((x: number, y: number) => ({
                        row: Math.floor(y / 10),
                        column: Math.floor(x / 10),
                    })),
                },
            })),
        })),
    };
    const controller = new SheetDrawingPrintingController(
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
        { renderDrawing: vi.fn(() => Promise.resolve()) } as never,
        { getDrawingDataForUnit: vi.fn(() => options?.hasDrawingData === false ? undefined : drawingData['unit-1']) } as never,
        { getRenderById: vi.fn(() => render) } as never,
        {
            get: vi.fn((key: string) => `${key}-Component`),
        } as never,
        {} as never
    );

    return { controller, interceptors, points };
}

describe('SheetDrawingPrintingController', () => {
    it('renders printable images while excluding charts and floating DOM drawings', () => {
        const { controller, interceptors, points } = createController();
        const scene = {};
        const resourceCollector = { add: vi.fn() };
        const next = vi.fn(() => 'next-result');

        const result = interceptors.get(points.PRINTING_COMPONENT_COLLECT).handler(null, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            scene,
            resourceCollector,
        }, next);

        expect((controller as any)._drawingRenderService.renderDrawing).toHaveBeenCalledTimes(2);
        expect((controller as any)._drawingRenderService.renderDrawing).toHaveBeenCalledWith(expect.objectContaining({ drawingId: 'image-1' }), scene, { allowInactiveSheet: true });
        expect((controller as any)._drawingRenderService.renderDrawing).toHaveBeenCalledWith(expect.objectContaining({ drawingId: 'grouped-image' }), scene, { allowInactiveSheet: true });
        expect(resourceCollector.add).toHaveBeenCalledTimes(2);
        expect(result).toBe('next-result');

        controller.dispose();
    });

    it('expands the printed range to include ungrouped drawing bounds', () => {
        const { controller, interceptors, points } = createController();
        const next = vi.fn((range) => range);

        const range = interceptors.get(points.PRINTING_RANGE).handler(
            { startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 },
            { unitId: 'unit-1', subUnitId: 'sheet-1' },
            next
        );

        expect(range).toEqual({
            startRow: 3,
            endRow: 11,
            startColumn: 2,
            endColumn: 16,
        });

        controller.dispose();
    });

    it('defers React root cleanup when replacing printed float components', async () => {
        const { controller, interceptors, points } = createController();
        const unmount = vi.fn();
        vi.mocked(mountPrintingFloatDom).mockReturnValueOnce(unmount);
        const disposers: Array<() => void> = [];
        const add = vi.fn((dispose: () => void) => disposers.push(dispose));
        const disposableCollection = { add };
        const resourceCollector = { add: vi.fn() };
        const next = vi.fn((value) => value);
        const root = document.createElement('div');

        const result = interceptors.get(points.PRINTING_DOM_COLLECT).handler(disposableCollection, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            scene: 'scene',
            skeleton: 'skeleton',
            worksheet: 'worksheet',
            root,
            resourceCollector,
        }, next);

        expect(mountPrintingFloatDom).toHaveBeenCalledWith(
            {
                floatDomInfos: [
                    expect.objectContaining({ drawingId: 'dom-1', componentKey: 'custom-dom-print-Component' }),
                    expect.objectContaining({ drawingId: 'block-1', componentKey: 'custom-block-print-Component' }),
                ],
                scene: 'scene',
                skeleton: 'skeleton',
                worksheet: 'worksheet',
            },
            expect.any(HTMLElement),
            expect.any(Object)
        );
        const printingRoot = vi.mocked(mountPrintingFloatDom).mock.calls[0][1];
        expect(printingRoot).not.toBe(root);
        expect(printingRoot.parentElement).toBe(root);
        expect(add).toHaveBeenCalled();
        expect(resourceCollector.add).not.toHaveBeenCalled();
        expect(unmount).not.toHaveBeenCalled();
        expect(result).toBe(disposableCollection);

        disposers.forEach((dispose) => dispose());
        expect(unmount).not.toHaveBeenCalled();
        expect(printingRoot.parentElement).toBeNull();

        await Promise.resolve();
        expect(unmount).toHaveBeenCalledOnce();

        controller.dispose();
    });

    it('continues DOM collection when the sheet has no drawing data', () => {
        const { controller, interceptors, points } = createController({ hasDrawingData: false });
        const disposableCollection = { add: vi.fn() };
        const next = vi.fn(() => 'next-result');
        const mountCallCount = vi.mocked(mountPrintingFloatDom).mock.calls.length;

        const result = interceptors.get(points.PRINTING_DOM_COLLECT).handler(disposableCollection, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        }, next);

        expect(next).toHaveBeenCalledWith(disposableCollection);
        expect(result).toBe('next-result');
        expect(mountPrintingFloatDom).toHaveBeenCalledTimes(mountCallCount);

        controller.dispose();
    });
});
