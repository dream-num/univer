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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { INTERCEPTOR_POINT, SheetInterceptorService, SheetRangeThemeModel } from '@univerjs/sheets';
import { SheetsTableButtonStateEnum, TableColumnFilterTypeEnum, TableManager } from '@univerjs/sheets-table';
import { SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FILTER_ICON_PADDING, FILTER_ICON_SIZE, SheetsTableFilterButtonShape } from '../../views/widgets/table-filter-button.shape';
import { SheetsTableFilterButtonRenderController } from '../sheet-table-filter-button-render.controller';

vi.hoisted(() => {
    class FakePath2D {
        constructor(_path?: string) {}
    }
    (globalThis as unknown as { Path2D: typeof FakePath2D }).Path2D = FakePath2D;
});

describe('SheetsTableFilterButtonRenderController', () => {
    it('shows isolated table criteria, skips unchanged display state, and restores public indicators', () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([TableManager]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetRangeThemeModel]);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'u1',
            appVersion: '1',
            name: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['s1'],
            sheets: { s1: { id: 's1', rowCount: 20, columnCount: 10, cellData: {} } },
        });
        const tables = injector.get(TableManager);
        for (const [id, startRow] of [['a', 0], ['b', 5]] as const) {
            tables.addTable('u1', 's1', id, { startRow, endRow: startRow + 3, startColumn: 1, endColumn: 2 }, ['A', 'B'], id);
            tables.getTable('u1', id)!.setTableFilterColumn(0, { filterType: TableColumnFilterTypeEnum.manual, values: ['A'] });
        }
        const skeleton = { getCellWithCoordByIndex: () => ({ startX: 0, startY: 0, endX: 80, endY: 25 }) };
        injector.add([SheetSkeletonManagerService, { useValue: {
            currentSkeleton$: new Subject(),
            getCurrentSkeleton: () => skeleton,
        } as unknown as SheetSkeletonManagerService }]);
        const scene = { addObjects: vi.fn(), makeDirty: vi.fn() };
        const context = { unit: workbook, unitId: 'u1', scene } as unknown as IRenderContext<Workbook>;
        injector.add([SheetsTableFilterButtonRenderController, {
            useFactory: () => injector.createInstance(SheetsTableFilterButtonRenderController, context),
        }]);
        const controller = injector.get(SheetsTableFilterButtonRenderController);
        const creation = vi.spyOn(injector, 'createInstance');
        const states = () => creation.mock.calls
            .filter((call) => call[0] === SheetsTableFilterButtonShape)
            .map((call) => (call[2] as { filterParams: { buttonState: SheetsTableButtonStateEnum } }).filterParams.buttonState);
        try {
            controller.setDisplayFilterState(undefined);
            expect(scene.addObjects).not.toHaveBeenCalled();
            controller.setDisplayFilterState({ tableId: 'a', columns: new Set([1]) });
            expect(states()).toEqual([
                SheetsTableButtonStateEnum.FilterNoneSortNone,
                SheetsTableButtonStateEnum.FilteredSortNone,
                SheetsTableButtonStateEnum.FilteredSortNone,
                SheetsTableButtonStateEnum.FilterNoneSortNone,
            ]);
            controller.setDisplayFilterState({ tableId: 'a', columns: new Set([1]) });
            expect(scene.addObjects).toHaveBeenCalledTimes(1);
            creation.mockClear();
            controller.setDisplayFilterState(undefined);
            expect(states()).toEqual([
                SheetsTableButtonStateEnum.FilteredSortNone,
                SheetsTableButtonStateEnum.FilterNoneSortNone,
                SheetsTableButtonStateEnum.FilteredSortNone,
                SheetsTableButtonStateEnum.FilterNoneSortNone,
            ]);
            const shapeDisposals = scene.addObjects.mock.lastCall![0].map((shape: SheetsTableFilterButtonShape) => vi.spyOn(shape, 'dispose'));
            controller.dispose();
            for (const dispose of shapeDisposals) {
                expect(dispose).toHaveBeenCalledOnce();
            }
        } finally {
            univer.dispose();
        }
    });

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
        }, new Set([2, 4]));

        const rawCell = { v: 'Header', fontRenderExtension: { leftOffset: 3 } };
        const headerResult = interceptor.handler(rawCell, {
            unitId: 'u1',
            subUnitId: 's1',
            row: 4,
            col: 2,
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
            row: 4,
            col: 3,
            rawData: bodyCell,
        }, (cell: unknown) => cell)).toBe(bodyCell);
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
