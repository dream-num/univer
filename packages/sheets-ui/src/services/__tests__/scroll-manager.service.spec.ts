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

import type { Workbook } from '@univerjs/core';
import type { Engine, IRenderContext, Scene } from '@univerjs/engine-render';
import { Injector, UniverInstanceType } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { SheetScrollManagerService } from '../scroll-manager.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

class TestSheetSkeletonManagerService {
    static currentSkeleton: any = null;
    static skeletons = new Map<string, any>();

    getCurrentSkeleton() {
        return TestSheetSkeletonManagerService.currentSkeleton;
    }

    getSkeleton(sheetId: string) {
        return TestSheetSkeletonManagerService.skeletons.get(sheetId) ?? null;
    }
}

function createRenderContext(unitId: string): IRenderContext<Workbook> {
    const activated$ = new BehaviorSubject(true);
    const unit = {
        getUnitId: () => unitId,
        type: UniverInstanceType.UNIVER_SHEET,
    } as unknown as Workbook;

    return {
        unit,
        unitId,
        type: UniverInstanceType.UNIVER_SHEET,
        engine: {} as unknown as Engine,
        scene: {} as unknown as Scene,
        mainComponent: null,
        components: new Map(),
        isMainScene: true,
        activated$,
        activate: () => activated$.next(true),
        deactivate: () => activated$.next(false),
    };
}

describe('SheetScrollManagerService', () => {
    function createService(skeleton: any = null, skeletons: Record<string, any> = {}) {
        TestSheetSkeletonManagerService.currentSkeleton = skeleton;
        TestSheetSkeletonManagerService.skeletons = new Map(Object.entries(skeletons));

        const injector = new Injector();
        injector.add([SheetSkeletonManagerService, { useClass: TestSheetSkeletonManagerService as never }]);
        injector.add([SheetScrollManagerService, { useFactory: () => injector.createInstance(SheetScrollManagerService, createRenderContext('u-1')) }]);
        return injector.get(SheetScrollManagerService);
    }

    it('returns an empty scroll state when no search param is set', () => {
        const service = createService();

        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });
    });

    it('stores and retrieves scroll state by sheet', () => {
        const service = createService();

        service.setSearchParam({ unitId: 'u-1', sheetId: 's-1' });
        service.setValidScrollState({
            unitId: 'u-1',
            sheetId: 's-1',
            sheetViewStartRow: 5,
            sheetViewStartColumn: 2,
            offsetX: 10,
            offsetY: 20,
        });

        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 5,
            sheetViewStartColumn: 2,
            offsetX: 10,
            offsetY: 20,
        });

        expect(service.getScrollStateByParam({ unitId: 'u-1', sheetId: 's-1' })).toEqual({
            sheetViewStartRow: 5,
            sheetViewStartColumn: 2,
            offsetX: 10,
            offsetY: 20,
        });

        expect(service.getScrollStateByParam({ unitId: 'u-1', sheetId: 's-2' })).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });
    });

    it('calculates viewport scroll based on skeleton accumulations', () => {
        const service = createService({
            rowHeightAccumulation: [10, 25, 45],
            columnWidthAccumulation: [100, 210, 330],
        });

        expect(service.calcViewportScrollFromRowColOffset(null)).toEqual({
            viewportScrollX: 0,
            viewportScrollY: 0,
        });

        expect(service.calcViewportScrollFromRowColOffset({
            sheetViewStartRow: 2,
            sheetViewStartColumn: 3,
            offsetX: 7,
            offsetY: 4,
            scrollX: 0,
            scrollY: 0,
            viewportScrollX: 0,
            viewportScrollY: 0,
        })).toEqual({
            // startRow-1 => rowHeightAccumulation[1] = 25
            viewportScrollY: 29,
            // startColumn-1 => columnWidthAccumulation[2] = 330
            viewportScrollX: 337,
        });
    });

    it('calculates viewport scroll from the actual cell start when gaps shift the origin', () => {
        const service = createService({
            rowHeightAccumulation: [28, 57, 81],
            columnWidthAccumulation: [72, 192, 271],
            getCellWithCoordByIndex: (row: number, column: number, header?: boolean) => {
                expect(header).toBe(false);
                expect(row).toBe(1);
                expect(column).toBe(2);

                return {
                    startY: 33,
                    startX: 199,
                };
            },
        });

        expect(service.calcViewportScrollFromRowColOffset({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 2,
            offsetX: -4,
            offsetY: -3,
            scrollX: 0,
            scrollY: 0,
            viewportScrollX: 0,
            viewportScrollY: 0,
        })).toEqual({
            viewportScrollX: 195,
            viewportScrollY: 30,
        });
    });

    it('keeps the initial viewport at origin when gap 0 exists but no scroll has been applied', () => {
        const gapSkeleton = {
            getCellWithCoordByIndex: (row: number, column: number, header?: boolean) => {
                expect(header).toBe(false);
                expect(row).toBe(0);
                expect(column).toBe(0);

                return {
                    startY: 10,
                    startX: 7,
                };
            },
            getRowGapSize: (row: number) => (row === 0 ? 10 : 0),
            getColGapSize: (column: number) => (column === 0 ? 7 : 0),
        };
        const service = createService(gapSkeleton, { 's-1': gapSkeleton });

        service.setSearchParam({ unitId: 'u-1', sheetId: 's-1' });

        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: -7,
            offsetY: -10,
        });
        expect(service.calcViewportScrollFromRowColOffset({
            ...service.getCurrentScrollState(),
            scrollX: 0,
            scrollY: 0,
            viewportScrollX: 0,
            viewportScrollY: 0,
        })).toEqual({
            viewportScrollX: 0,
            viewportScrollY: 0,
        });
    });

    it('falls back to current skeleton when a mock does not provide getSkeleton', () => {
        const service = createService({
            getRowGapSize: (row: number) => (row === 0 ? 9 : 0),
            getColGapSize: (column: number) => (column === 0 ? 6 : 0),
        });

        expect(service.getScrollStateByParam({ unitId: 'u-1', sheetId: 's-2' })).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: -6,
            offsetY: -9,
        });
    });

    it('publishes raw scroll info, persists current-sheet scroll and clears to the sheet default', () => {
        const appliedScrolls: Array<[number, number]> = [];
        const sheetSkeleton = {
            getRowGapSize: (row: number) => (row === 0 ? 8 : 0),
            getColGapSize: (column: number) => (column === 0 ? 5 : 0),
            setScroll: (x: number, y: number) => appliedScrolls.push([x, y]),
        };
        const service = createService(sheetSkeleton, { 's-1': sheetSkeleton });
        const rawStates: unknown[] = [];
        service.rawScrollInfo$.subscribe((state) => rawStates.push(state));

        service.emitRawScrollParam({
            unitId: 'u-1',
            sheetId: 's-1',
            sheetViewStartRow: 3,
            sheetViewStartColumn: 2,
            offsetX: 11,
            offsetY: 12,
        });
        expect(rawStates.at(-1)).toEqual({
            unitId: 'u-1',
            sheetId: 's-1',
            sheetViewStartRow: 3,
            sheetViewStartColumn: 2,
            offsetX: 11,
            offsetY: 12,
        });

        service.setValidScrollStateToCurrSheet({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 1,
            offsetX: 1,
            offsetY: 2,
            scrollX: 30,
            scrollY: 40,
            viewportScrollX: 300,
            viewportScrollY: 400,
        });
        expect(appliedScrolls).toEqual([]);

        service.setSearchParam({ unitId: 'u-1', sheetId: 's-1' });
        service.setValidScrollStateToCurrSheet({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 1,
            offsetX: 1,
            offsetY: 2,
            scrollX: 30,
            scrollY: 40,
            viewportScrollX: 300,
            viewportScrollY: 400,
        });
        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 1,
            offsetX: 1,
            offsetY: 2,
        });
        expect(appliedScrolls).toEqual([[300, 400]]);

        service.clear();
        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: -5,
            offsetY: -8,
        });
        expect(rawStates.at(-1)).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: -5,
            offsetY: -8,
        });

        service.dispose();
    });
});
