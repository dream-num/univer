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

import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY } from '@univerjs/core';
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SheetCellImageController } from '../sheet-cell-image.controller';

describe('SheetCellImageController', () => {
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
