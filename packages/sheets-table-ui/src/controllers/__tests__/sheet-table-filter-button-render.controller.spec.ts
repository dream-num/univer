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

import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FILTER_ICON_PADDING, FILTER_ICON_SIZE } from '../../views/widgets/table-filter-button.shape';
import { SheetsTableFilterButtonRenderController } from '../sheet-table-filter-button-render.controller';

vi.hoisted(() => {
    class FakePath2D {
        constructor(_path?: string) {}
    }
    (globalThis as unknown as { Path2D: typeof FakePath2D }).Path2D = FakePath2D;
});

describe('SheetsTableFilterButtonRenderController', () => {
    it('should dispose rendered button shapes and interceptor resource', () => {
        const controller = new SheetsTableFilterButtonRenderController(
            {
                unit: {
                    getUnitId: () => 'u1',
                    getActiveSheet: () => null,
                },
                unitId: 'u1',
                scene: {
                    addObjects: vi.fn(),
                    makeDirty: vi.fn(),
                },
            } as any,
            { createInstance: vi.fn() } as any,
            {
                currentSkeleton$: new Subject(),
                getCurrentSkeleton: () => null,
            } as any,
            {
                intercept: vi.fn(() => ({ dispose: vi.fn() })),
            } as any,
            {
                tableAdd$: new Subject(),
                tableNameChanged$: new Subject(),
                tableRangeChanged$: new Subject(),
                tableThemeChanged$: new Subject(),
                tableDelete$: new Subject(),
                tableFilterChanged$: new Subject(),
                getSheetFilterRangeWithState: vi.fn(() => []),
            } as any,
            {
                getRangeThemeStyle: vi.fn(),
            } as any,
            {
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            } as any
        );

        const shapeDispose = vi.fn();
        const interceptorDispose = vi.fn();

        (controller as any)._tableFilterButtonShapes = [{ dispose: shapeDispose }];
        (controller as any)._buttonRenderDisposable = { dispose: interceptorDispose };

        controller.dispose();

        expect(shapeDispose).toHaveBeenCalledTimes(1);
        expect(interceptorDispose).toHaveBeenCalledTimes(1);
        expect((controller as any)._tableFilterButtonShapes).toEqual([]);
        expect((controller as any)._buttonRenderDisposable).toBeNull();
    });

    it('adds right padding only to table header cells covered by filter buttons', () => {
        let interceptor: any;
        const controller = new SheetsTableFilterButtonRenderController(
            {
                unit: {
                    getUnitId: () => 'u1',
                    getActiveSheet: () => null,
                },
                unitId: 'u1',
                scene: {
                    addObjects: vi.fn(),
                    makeDirty: vi.fn(),
                },
            } as any,
            { createInstance: vi.fn() } as any,
            {
                currentSkeleton$: new Subject(),
                getCurrentSkeleton: () => null,
            } as any,
            {
                intercept: vi.fn((point, config) => {
                    expect(point).toBe(INTERCEPTOR_POINT.CELL_CONTENT);
                    interceptor = config;
                    return { dispose: vi.fn() };
                }),
            } as any,
            {
                tableAdd$: new Subject(),
                tableNameChanged$: new Subject(),
                tableRangeChanged$: new Subject(),
                tableThemeChanged$: new Subject(),
                tableDelete$: new Subject(),
                tableFilterChanged$: new Subject(),
                getSheetFilterRangeWithState: vi.fn(() => []),
            } as any,
            {
                getRangeThemeStyle: vi.fn(),
            } as any,
            {
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            } as any
        );

        (controller as any)._interceptCellContent('u1', 's1', {
            startRow: 4,
            endRow: 8,
            startColumn: 2,
            endColumn: 4,
        });

        const rawCell = { v: 'Header', fontRenderExtension: { leftOffset: 3 } };
        const headerResult = interceptor.handler(rawCell, {
            unitId: 'u1',
            subUnitId: 's1',
            row: 4,
            col: 3,
            rawData: rawCell,
        }, (cell: unknown) => cell);

        expect(headerResult).not.toBe(rawCell);
        expect(headerResult.fontRenderExtension).toEqual({
            leftOffset: 3,
            rightOffset: FILTER_ICON_SIZE + FILTER_ICON_PADDING + 2,
        });

        const bodyCell = { v: 'Body' };
        expect(interceptor.handler(bodyCell, {
            unitId: 'u1',
            subUnitId: 's1',
            row: 5,
            col: 3,
            rawData: bodyCell,
        }, (cell: unknown) => cell)).toBe(bodyCell);
        expect(interceptor.handler(bodyCell, {
            unitId: 'u1',
            subUnitId: 'other',
            row: 4,
            col: 3,
            rawData: bodyCell,
        }, (cell: unknown) => cell)).toBe(bodyCell);

        controller.dispose();
    });
});
