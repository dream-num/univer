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

import type { IUniverInstanceService } from '@univerjs/core';
import type { IRenderManagerService } from '@univerjs/engine-render';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { HoverManagerService } from '../hover-manager.service';
import { SheetScrollManagerService } from '../scroll-manager.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

describe('HoverManagerService', () => {
    it('emits row/col header hover and click positions based on active viewport', () => {
        const workbook = {
            getUnitId: () => 'u-1',
            getActiveSheet: () => ({
                getSheetId: () => 'sheet1',
            }),
        };

        const unitDisposed$ = new Subject<any>();
        const currentSheet$ = new BehaviorSubject<any>(workbook);

        const univerInstanceService: Partial<IUniverInstanceService> = {
            getUnit: () => workbook as any,
            getCurrentTypeOfUnit$: () => currentSheet$.asObservable() as any,
            unitDisposed$: unitDisposed$.asObservable() as any,
        };

        const skeleton = {
            getRowIndexByOffsetY: () => 5,
            getColumnIndexByOffsetX: () => 3,
        };

        const rowViewport = {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_ROW_TOP,
            viewportScrollX: 0,
            viewportScrollY: 0,
            isHit: (vec: { x: number }) => vec.x < 50,
        };

        const colViewport = {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT,
            viewportScrollX: 0,
            viewportScrollY: 0,
            isHit: (vec: { x: number }) => vec.x >= 50,
        };

        const render = {
            scene: {
                getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
                getViewports: () => [rowViewport, colViewport],
            },
            with: (token: unknown) => {
                if (token === SheetSkeletonManagerService) {
                    return {
                        getSkeletonParam: () => ({ skeleton }),
                    };
                }
                if (token === SheetScrollManagerService) {
                    return {
                        getCurrentScrollState: () => ({ sheetViewStartRow: 0, sheetViewStartColumn: 0, offsetX: 0, offsetY: 0 }),
                    };
                }
                return null;
            },
        };

        const renderManagerService: Partial<IRenderManagerService> = {
            getRenderById: () => render as any,
        };

        const service = new HoverManagerService(univerInstanceService as IUniverInstanceService, renderManagerService as IRenderManagerService);

        let hoveredRow: any = null;
        service.currentHoveredRowHeader$.subscribe((v) => {
            hoveredRow = v;
        });

        let hoveredCol: any = null;
        service.currentHoveredColHeader$.subscribe((v) => {
            hoveredCol = v;
        });

        const rowClicks: any[] = [];
        service.currentRowHeaderClick$.subscribe((v) => rowClicks.push(v));

        const colClicks: any[] = [];
        service.currentColHeaderClick$.subscribe((v) => colClicks.push(v));

        service.triggerRowHeaderMouseMove('u-1', 10, 10);
        expect(hoveredRow).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 5 });

        service.triggerColHeaderMouseMove('u-1', 100, 10);
        expect(hoveredCol).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 3 });

        service.triggerRowHeaderClick('u-1', 10, 10);
        expect(rowClicks[0]).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 5 });

        service.triggerColHeaderClick('u-1', 100, 10);
        expect(colClicks[0]).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 3 });

        service.dispose();
    });
});
