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

import { drawingPositionToTransform } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { SheetsDrawingRenderController } from '../sheet-drawing.render-controller';

vi.mock('@univerjs/sheets-drawing', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/sheets-drawing')>();

    return {
        ...actual,
        drawingPositionToTransform: vi.fn(() => ({ left: 24, top: 36, width: 120, height: 80 })),
    };
});

describe('SheetsDrawingRenderController', () => {
    it('initializes sheet drawing data and materializes sheet transforms for render objects', () => {
        const drawingWithSheetTransform = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'drawing-1',
            sheetTransform: {
                from: { row: 1, column: 2 },
                to: { row: 3, column: 4 },
            },
        } as any;
        const drawingWithoutSkeleton = {
            unitId: 'unit-1',
            subUnitId: 'missing-sheet',
            drawingId: 'drawing-2',
            sheetTransform: {
                from: { row: 5, column: 6 },
                to: { row: 7, column: 8 },
            },
        };
        const drawingData = {
            'sheet-1': {
                data: {
                    'drawing-1': drawingWithSheetTransform,
                    'drawing-3': { unitId: 'unit-1', subUnitId: 'sheet-1', drawingId: 'drawing-3' },
                },
            },
            'missing-sheet': {
                data: {
                    'drawing-2': drawingWithoutSkeleton,
                },
            },
        };
        const sheetDrawingService = {
            initializeNotification: vi.fn(),
            getDrawingDataForUnit: vi.fn(() => drawingData),
        };
        const drawingManagerService = {
            registerDrawingData: vi.fn(),
            initializeNotification: vi.fn(),
        };
        const skeletonParam = { skeleton: { id: 'skeleton-1' } };
        const sheetSkeletonService = {
            getSkeletonParam: vi.fn((unitId: string, subUnitId: string) => {
                if (unitId === 'unit-1' && subUnitId === 'sheet-1') {
                    return skeletonParam;
                }

                return null;
            }),
        };

        const controller = new SheetsDrawingRenderController(
            { unitId: 'unit-1' } as never,
            sheetDrawingService as never,
            drawingManagerService as never,
            sheetSkeletonService as never
        );

        expect(sheetDrawingService.initializeNotification).toHaveBeenCalledWith('unit-1');
        expect(drawingPositionToTransform).toHaveBeenCalledWith(drawingWithSheetTransform.sheetTransform, skeletonParam);
        expect(drawingWithSheetTransform.transform).toEqual({ left: 24, top: 36, width: 120, height: 80 });
        expect(drawingWithoutSkeleton).not.toHaveProperty('transform');
        expect(drawingManagerService.registerDrawingData).toHaveBeenCalledWith('unit-1', drawingData);
        expect(drawingManagerService.initializeNotification).toHaveBeenCalledWith('unit-1');

        controller.dispose();
    });
});
