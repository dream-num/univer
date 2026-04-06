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

import { DrawingTypeEnum, Injector, PRINT_CHART_COMPONENT_KEY } from '@univerjs/core';
import { render, unmount } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetPrintInterceptorService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { ComponentManager } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetCanvasFloatDomManagerService } from '../../services/canvas-float-dom-manager.service';
import { SheetDrawingPrintingController } from '../sheet-drawing-printing.controller';

vi.mock('@univerjs/design', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/design')>();

    return {
        ...actual,
        render: vi.fn(),
        unmount: vi.fn(),
    };
});

describe('SheetDrawingPrintingController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders image drawings, expands print ranges, and mounts printing float doms for chart/dom drawings', () => {
        const renderDrawing = vi.fn();
        const interceptorService = new SheetPrintInterceptorService();
        interceptorService.registerPrintComponent('dom-component', 'dom-component-print');

        const drawingManagerService = {
            getDrawingDataForUnit: vi.fn(() => ({
                sheet1: {
                    order: ['image-1', 'chart-1', 'dom-1'],
                    data: {
                        'image-1': {
                            drawingId: 'image-1',
                            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                            transform: { left: 10, top: 15, width: 20, height: 25 },
                        },
                        'chart-1': {
                            drawingId: 'chart-1',
                            drawingType: DrawingTypeEnum.DRAWING_CHART,
                            componentKey: 'chart-component',
                            transform: { left: 15, top: 20, width: 30, height: 40 },
                        },
                        'dom-1': {
                            drawingId: 'dom-1',
                            drawingType: DrawingTypeEnum.DRAWING_DOM,
                            componentKey: 'dom-component',
                            data: { label: 'dom' },
                            transform: { left: 50, top: 60, width: 70, height: 80 },
                        },
                    },
                },
            })),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => ({
                scene: {
                    scaleX: 1,
                    scaleY: 1,
                },
                with: (token: unknown) => {
                    if (token === SheetSkeletonManagerService) {
                        return {
                            getSkeletonParam: () => ({
                                skeleton: {
                                    getCellIndexByOffset: (x: number, y: number) => ({
                                        column: Math.floor(x / 10),
                                        row: Math.floor(y / 10),
                                    }),
                                },
                            }),
                        };
                    }

                    return null;
                },
            })),
        };
        const componentManager = {
            get: vi.fn((key: string) => `component:${key}`),
        };
        const injector = new Injector();
        injector.add([SheetPrintInterceptorService, { useValue: interceptorService as never }]);
        injector.add([DrawingRenderService, { useValue: { renderDrawing } as never }]);
        injector.add([IDrawingManagerService, { useValue: drawingManagerService as never }]);
        injector.add([IRenderManagerService, { useValue: renderManagerService as never }]);
        injector.add([SheetCanvasFloatDomManagerService, { useValue: {} as never }]);
        injector.add([ComponentManager, { useValue: componentManager as never }]);

        const controller = injector.createInstance(SheetDrawingPrintingController);
        const interceptPoints = interceptorService.interceptor.getInterceptPoints();

        const componentCollector = interceptorService.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_COMPONENT_COLLECT);
        const rangeCollector = interceptorService.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_RANGE);
        const domCollector = interceptorService.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_DOM_COLLECT);

        componentCollector(undefined, {
            unitId: 'book-1',
            subUnitId: 'sheet1',
            scene: {} as never,
        } as never);

        expect(renderDrawing).toHaveBeenCalledTimes(1);
        expect(renderDrawing).toHaveBeenCalledWith(expect.objectContaining({ drawingId: 'image-1' }), expect.anything());

        const expandedRange = rangeCollector(
            { startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 },
            {
                unitId: 'book-1',
                subUnitId: 'sheet1',
            } as never
        );
        expect(expandedRange).toEqual({
            startRow: 1,
            endRow: 14,
            startColumn: 1,
            endColumn: 12,
        });

        const disposableCollection = {
            add: vi.fn(),
        };
        const root = { nodeName: 'DIV' } as HTMLElement;
        domCollector(disposableCollection as never, {
            unitId: 'book-1',
            subUnitId: 'sheet1',
            scene: {} as never,
            root,
            worksheet: {} as never,
            skeleton: {} as never,
        } as never);

        expect(componentManager.get).toHaveBeenCalledWith(PRINT_CHART_COMPONENT_KEY);
        expect(componentManager.get).toHaveBeenCalledWith('dom-component-print');
        expect(render).toHaveBeenCalledTimes(1);
        const printingElement = vi.mocked(render).mock.calls[0][0] as any;
        expect(printingElement.props.floatDomInfos).toEqual([
            expect.objectContaining({
                drawingId: 'chart-1',
                componentKey: `component:${PRINT_CHART_COMPONENT_KEY}`,
            }),
            expect.objectContaining({
                drawingId: 'dom-1',
                componentKey: 'component:dom-component-print',
            }),
        ]);

        const cleanup = vi.mocked(disposableCollection.add).mock.calls[0][0] as () => void;
        cleanup();
        expect(unmount).toHaveBeenCalledWith(root);

        controller.dispose();
    });
});
