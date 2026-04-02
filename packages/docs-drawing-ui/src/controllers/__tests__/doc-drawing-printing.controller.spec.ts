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

import { DOC_DRAWING_PRINTING_COMPONENT_KEY, DrawingTypeEnum, Injector } from '@univerjs/core';
import { render, unmount } from '@univerjs/design';
import { DocPrintInterceptorService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DrawingRenderService } from '@univerjs/drawing-ui';
import { ComponentManager } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDocUiTestBed } from '../../__tests__/create-doc-ui-test-bed';
import { DocDrawingPrintingController } from '../doc-drawing-printing.controller';

vi.mock('@univerjs/design', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/design')>();

    return {
        ...actual,
        render: vi.fn(),
        unmount: vi.fn(),
    };
});

describe('DocDrawingPrintingController', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders image drawings into the print scene and mounts float doms for chart/dom drawings', () => {
        const renderDrawing = vi.fn();
        const componentManager = {
            get: vi.fn((key: string) => `component:${key}`),
        };
        const drawingManagerService = {
            getDrawingDataForUnit: vi.fn(() => ({
                'test-doc': {
                    order: ['image-1', 'chart-1', 'dom-1'],
                    data: {
                        'image-1': {
                            unitId: 'test-doc',
                            subUnitId: 'test-doc',
                            drawingId: 'image-1',
                            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
                        },
                        'chart-1': {
                            unitId: 'test-doc',
                            subUnitId: 'test-doc',
                            drawingId: 'chart-1',
                            drawingType: DrawingTypeEnum.DRAWING_CHART,
                            componentKey: 'chart-component',
                            transform: { left: 10, top: 20, width: 30, height: 40 },
                        },
                        'dom-1': {
                            unitId: 'test-doc',
                            subUnitId: 'test-doc',
                            drawingId: 'dom-1',
                            drawingType: DrawingTypeEnum.DRAWING_DOM,
                            componentKey: 'dom-component',
                            data: { label: 'dom' },
                            transform: { left: 15, top: 25, width: 35, height: 45 },
                        },
                    },
                },
            })),
        };

        const testBed = createDocUiTestBed(undefined, [
            [DocPrintInterceptorService],
            [DrawingRenderService, { useValue: { renderDrawing } as never }],
            [IDrawingManagerService, { useValue: drawingManagerService as never }],
            [ComponentManager, { useValue: componentManager as never }],
        ]);

        const injector = testBed.get(Injector);
        const interceptorService = testBed.get(DocPrintInterceptorService);
        interceptorService.registerPrintComponent('dom-component', 'dom-component-print');

        const controller = injector.createInstance(DocDrawingPrintingController);
        const interceptPoints = interceptorService.interceptor.getInterceptPoints();

        const componentCollector = interceptorService.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_COMPONENT_COLLECT);
        const domCollector = interceptorService.interceptor.fetchThroughInterceptors(interceptPoints.PRINTING_DOM_COLLECT);

        const scene = {} as never;
        const root = { nodeName: 'DIV' } as HTMLElement;
        const disposableCollection = {
            add: vi.fn(),
        };

        expect(componentCollector(undefined, {
            unitId: 'test-doc',
            scene,
        } as never)).toBeUndefined();
        expect(renderDrawing).toHaveBeenCalledTimes(1);
        expect(renderDrawing).toHaveBeenCalledWith(expect.objectContaining({
            drawingId: 'image-1',
        }), scene);

        domCollector(disposableCollection as never, {
            unitId: 'test-doc',
            scene,
            root,
            skeleton: {} as never,
            offset: { x: 0, y: 0 },
            bound: { left: 0, top: 0, right: 100, bottom: 100 },
        } as never);

        expect(componentManager.get).toHaveBeenCalledWith(DOC_DRAWING_PRINTING_COMPONENT_KEY);
        expect(componentManager.get).toHaveBeenCalledWith('dom-component-print');
        expect(render).toHaveBeenCalledTimes(1);
        const printingElement = vi.mocked(render).mock.calls[0][0] as any;
        expect(printingElement.props.floatDomInfos).toEqual([
            expect.objectContaining({
                drawingId: 'chart-1',
                componentKey: `component:${DOC_DRAWING_PRINTING_COMPONENT_KEY}`,
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
        testBed.univer.dispose();
    });
});
