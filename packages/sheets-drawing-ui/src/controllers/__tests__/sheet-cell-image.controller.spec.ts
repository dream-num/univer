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

import { DataStreamTreeTokenType, DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { resizeImageByCell, SheetCellImageController } from '../sheet-cell-image.controller';

const DRAWING_ID = 'drawing-1';

function createCellImage(dataStream: string) {
    return {
        p: {
            body: { dataStream },
            drawingsOrder: [DRAWING_ID],
            drawings: {
                [DRAWING_ID]: {
                    transform: { width: 20, height: 10, left: 1, top: 1 },
                    docTransform: {
                        size: { width: 20, height: 10 },
                        angle: 0,
                        positionH: { posOffset: 1 },
                        positionV: { posOffset: 1 },
                    },
                },
            },
            documentStyle: { pageSize: { width: 20, height: 10 } },
        },
    };
}

function createInjector() {
    const skeleton = {
        getCellWithCoordByIndex: vi.fn(() => ({
            mergeInfo: { startX: 0, endX: 100, startY: 0, endY: 50 },
        })),
    };
    const skeletonManagerService = {
        getSkeletonParam: vi.fn(() => ({ skeleton })),
    };
    const render = {
        with: vi.fn(() => skeletonManagerService),
    };
    const renderManagerService = {
        getRenderUnitById: vi.fn(() => render),
    };

    return { get: vi.fn(() => renderManagerService) } as never;
}

describe('SheetCellImageController', () => {
    it.each([
        DataStreamTreeTokenType.CUSTOM_BLOCK + DataStreamTreeTokenType.PARAGRAPH + DataStreamTreeTokenType.SECTION_BREAK,
        DataStreamTreeTokenType.PARAGRAPH + DataStreamTreeTokenType.CUSTOM_BLOCK + DataStreamTreeTokenType.PARAGRAPH + DataStreamTreeTokenType.SECTION_BREAK,
    ])('resizes cell images for supported document structures', (dataStream) => {
        const cell = createCellImage(dataStream);

        expect(resizeImageByCell(createInjector(), {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
        }, cell as never)).toBe(true);
        expect(cell.p.drawings[DRAWING_ID].transform).toEqual({ width: 96, height: 48, left: 0, top: 0 });
        expect(cell.p.drawings[DRAWING_ID].docTransform.size).toEqual({ width: 96, height: 48 });
    });

    it('reloads editor drawing data when the embedded editor opens and clears it when closed', () => {
        let interceptor: any;
        const visible$ = new Subject<{ visible: boolean }>();
        const drawingManagerService = {
            removeDrawingDataForUnit: vi.fn(),
            initializeNotification: vi.fn(),
        };
        const docDrawingController = { loadDrawingDataForUnit: vi.fn() };
        const controller = new SheetCellImageController(
            {
                intercept: vi.fn((point, config) => {
                    expect(point).toBe(INTERCEPTOR_POINT.CELL_CONTENT);
                    interceptor = config;
                    return { dispose: vi.fn() };
                }),
            } as never,
            {} as never,
            drawingManagerService as never,
            docDrawingController as never,
            { visible$ } as never
        );

        visible$.next({ visible: true });
        expect(drawingManagerService.removeDrawingDataForUnit).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(docDrawingController.loadDrawingDataForUnit).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);
        expect(drawingManagerService.initializeNotification).toHaveBeenCalledWith(DOCS_NORMAL_EDITOR_UNIT_ID_KEY);

        visible$.next({ visible: false });
        expect(drawingManagerService.removeDrawingDataForUnit).toHaveBeenCalledTimes(2);

        const rawCell = {
            p: {
                body: { dataStream: 'image\r\n' },
                drawingsOrder: ['drawing-1'],
            },
        };
        const result = interceptor.handler(rawCell, {
            rawData: rawCell,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 1,
            col: 2,
        }, (cell: unknown) => cell);

        expect(result).not.toBe(rawCell);
        expect(result.interceptorStyle.tr).toEqual({ a: 0 });

        controller.dispose();
    });
});
