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
                        getSkeletonParam: () => ({ skeleton, sheetId: 'sheet1' }),
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

    it('emits cell hover/click/pointer events and supports header dbclick/pointer branches', () => {
        const workbook = {
            getUnitId: () => 'u-1',
            getActiveSheet: () => ({
                getSheetId: () => 'sheet1',
                getCell: () => null,
            }),
        };

        const unitDisposed$ = new Subject<any>();
        const currentSheet$ = new BehaviorSubject<any>(workbook);

        const univerInstanceService: Partial<IUniverInstanceService> = {
            getUnit: () => workbook as any,
            getCurrentTypeOfUnit$: () => currentSheet$.asObservable() as any,
            unitDisposed$: unitDisposed$.asObservable() as any,
        };

        const mainViewport = {
            viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
            viewportScrollX: 0,
            viewportScrollY: 0,
            isHit: () => true,
        };

        const skeleton = {
            worksheet: {
                getMergedCell: () => null,
            },
            overflowCache: {
                forValue: (_handler: (r: number, c: number, range: any) => void) => { },
            },
            getCellIndexByOffset: () => ({ row: 1, column: 1 }),
            getCellWithCoordByIndex: () => ({
                actualRow: 1,
                actualColumn: 1,
                mergeInfo: {
                    startRow: 1,
                    endRow: 1,
                    startColumn: 1,
                    endColumn: 1,
                    startX: 100,
                    endX: 200,
                    startY: 20,
                    endY: 40,
                },
            }),
            getOffsetByColumn: (column: number) => (column + 1) * 100,
            getOffsetByRow: (row: number) => (row + 1) * 20,
            getFont: () => null,
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
                getViewports: () => [rowViewport, colViewport, mainViewport],
                getActiveViewportByCoord: () => mainViewport,
            },
            with: (token: unknown) => {
                if (token === SheetSkeletonManagerService) {
                    return {
                        getSkeletonParam: () => ({ skeleton, sheetId: 'sheet1' }),
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

        let currentCellWithEvent: any = null;
        service.currentCellPosWithEvent$.subscribe((v) => {
            currentCellWithEvent = v;
        });

        const pointerDowns: any[] = [];
        service.currentPointerDownCell$.subscribe((v) => pointerDowns.push(v));
        const pointerUps: any[] = [];
        service.currentPointerUpCell$.subscribe((v) => pointerUps.push(v));
        const clicks: any[] = [];
        service.currentClickedCell$.subscribe((v) => clicks.push(v));
        const dbClicks: any[] = [];
        service.currentDbClickedCell$.subscribe((v) => dbClicks.push(v));

        const rowDbClicks: any[] = [];
        service.currentRowHeaderDbClick$.subscribe((v) => rowDbClicks.push(v));
        const colDbClicks: any[] = [];
        service.currentColHeaderDbClick$.subscribe((v) => colDbClicks.push(v));
        const rowPointerDowns: any[] = [];
        service.currentRowHeaderPointerDown$.subscribe((v) => rowPointerDowns.push(v));
        const colPointerDowns: any[] = [];
        service.currentColHeaderPointerDown$.subscribe((v) => colPointerDowns.push(v));
        const rowPointerUps: any[] = [];
        service.currentRowHeaderPointerUp$.subscribe((v) => rowPointerUps.push(v));
        const colPointerUps: any[] = [];
        service.currentColHeaderPointerUp$.subscribe((v) => colPointerUps.push(v));

        const event = { offsetX: 150, offsetY: 30 } as any;
        service.triggerMouseMove('u-1', event);
        service.triggerPointerDown('u-1', event);
        service.triggerPointerUp('u-1', event);
        service.triggerClick('u-1', 150, 30);
        service.triggerDbClick('u-1', 150, 30);

        expect(currentCellWithEvent).toEqual(
            expect.objectContaining({
                unitId: 'u-1',
                subUnitId: 'sheet1',
                row: 1,
                col: 1,
                event,
            })
        );
        expect(pointerDowns.at(-1)).toEqual(expect.objectContaining({ unitId: 'u-1', row: 1, col: 1 }));
        expect(pointerUps.at(-1)).toEqual(expect.objectContaining({ unitId: 'u-1', row: 1, col: 1 }));
        expect(clicks.at(-1)).toEqual(expect.objectContaining({ location: expect.objectContaining({ row: 1, col: 1 }) }));
        expect(dbClicks.at(-1)).toEqual(expect.objectContaining({ location: expect.objectContaining({ row: 1, col: 1 }) }));

        service.triggerRowHeaderDbClick('u-1', 10, 10);
        service.triggerColHeaderDbClick('u-1', 100, 10);
        service.triggerRowHeaderPoniterDown('u-1', 10, 10);
        service.triggerColHeaderPoniterDown('u-1', 100, 10);
        service.triggerRowHeaderPoniterUp('u-1', 10, 10);
        service.triggerColHeaderPoniterUp('u-1', 100, 10);

        expect(rowDbClicks.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 5 });
        expect(colDbClicks.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 3 });
        expect(rowPointerDowns.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 5 });
        expect(colPointerDowns.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 3 });
        expect(rowPointerUps.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 5 });
        expect(colPointerUps.at(-1)).toEqual({ unitId: 'u-1', subUnitId: 'sheet1', index: 3 });

        service.triggerScroll();
        let currentPos: any;
        service.currentPosition$.subscribe((v) => {
            currentPos = v;
        });
        expect(currentPos).toBeNull();

        service.dispose();
    });
});
