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
    it('returns an empty scroll state when no search param is set', () => {
        const injector = new Injector();
        injector.add([SheetSkeletonManagerService, { useValue: { getCurrentSkeleton: () => null } as unknown as SheetSkeletonManagerService }]);
        const service = injector.createInstance(SheetScrollManagerService, createRenderContext('u-1'));

        expect(service.getCurrentScrollState()).toEqual({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        });
    });

    it('stores and retrieves scroll state by sheet', () => {
        const injector = new Injector();
        injector.add([SheetSkeletonManagerService, { useValue: { getCurrentSkeleton: () => null } as unknown as SheetSkeletonManagerService }]);
        const service = injector.createInstance(SheetScrollManagerService, createRenderContext('u-1'));

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
        const injector = new Injector();
        injector.add([
            SheetSkeletonManagerService,
            {
                useValue: {
                    getCurrentSkeleton: () => ({
                        rowHeightAccumulation: [10, 25, 45],
                        columnWidthAccumulation: [100, 210, 330],
                    }),
                } as unknown as SheetSkeletonManagerService,
            },
        ]);
        const service = injector.createInstance(SheetScrollManagerService, createRenderContext('u-1'));

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
});
