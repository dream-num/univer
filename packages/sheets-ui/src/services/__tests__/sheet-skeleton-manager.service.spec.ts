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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetColumnHeaderHeightCommand, SetRowHeaderWidthCommand } from '../../commands/commands/headersize-changed.command';
import { ISheetSelectionRenderService } from '../selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

function createService() {
    const sheetDisposed$ = new Subject<any>();
    const worksheets = new Map<string, any>();
    const workbook = {
        sheetDisposed$,
        getStyles: vi.fn(() => ({ styles: true })),
        getSheetBySheetId: vi.fn((id: string) => worksheets.get(id) ?? null),
    };

    const mainViewport = { left: 46, top: 20 };
    const viewportMap = new Map<any, any>();
    const getOrCreateViewport = (key: unknown) => {
        if (!viewportMap.has(key)) {
            viewportMap.set(key, {
                setViewportSize: vi.fn(),
                left: 12,
                width: 46,
            });
        }
        return viewportMap.get(key);
    };
    const scene = {
        getViewports: vi.fn(() => [mainViewport]),
        getViewport: vi.fn((key: unknown) => getOrCreateViewport(key)),
    };

    const injector = {
        createInstance: vi.fn((_cls: unknown, worksheet: unknown, styles: unknown) => ({
            worksheet,
            styles,
            columnHeaderHeight: 20,
            rowHeaderWidth: 46,
            makeDirty: vi.fn(),
            calculate: vi.fn(),
            dispose: vi.fn(),
            getNoMergeCellWithCoordByIndex: vi.fn((row: number, col: number) => ({
                startX: col * 10,
                startY: row * 10,
                endX: col * 10 + 10,
                endY: row * 10 + 10,
            })),
        })),
    };

    const sheetSkService = {
        setSkeleton: vi.fn(),
        deleteSkeleton: vi.fn(),
    };

    const context = {
        unitId: 'unit-1',
        unit: workbook,
        scene,
    };

    const service = new SheetSkeletonManagerService(
        context as any,
        injector as any,
        sheetSkService as any
    );

    return {
        service,
        workbook,
        worksheets,
        scene,
        viewportMap,
        sheetSkService,
        sheetDisposed$,
        mainViewport,
    };
}

describe('SheetSkeletonManagerService', () => {
    it('creates/reuses skeleton and handles dirty/current lifecycle', () => {
        const { service, worksheets, sheetSkService, workbook } = createService();
        const worksheet = { getSheetId: () => 'sheet-1' };
        worksheets.set('sheet-1', worksheet);

        const beforeValues: any[] = [];
        const currentValues: any[] = [];
        service.currentSkeletonBefore$.subscribe((value) => beforeValues.push(value));
        service.currentSkeleton$.subscribe((value) => currentValues.push(value));

        expect(service.getCurrentSkeleton()).toBeUndefined();
        expect(service.getCurrent()).toBeUndefined();
        expect(service.getCurrentParam()).toBeUndefined();
        expect(service.getSkeleton('sheet-1')).toBeNull();
        expect(service.getWorksheetSkeleton('sheet-1')).toBeUndefined();

        service.setCurrent({ sheetId: 'sheet-1' });
        const param = service.getCurrentParam();
        expect(param?.sheetId).toBe('sheet-1');
        expect(service.getCurrentSkeleton()).toBe(param?.skeleton);
        expect(service.getUnitSkeleton('override-unit', 'sheet-1')?.unitId).toBe('override-unit');
        expect(beforeValues.at(-1)?.sheetId).toBe('sheet-1');
        expect(currentValues.at(-1)?.sheetId).toBe('sheet-1');
        expect(sheetSkService.setSkeleton).toHaveBeenCalled();

        const skeleton = param!.skeleton as any;
        service.makeDirty({ sheetId: 'sheet-1' });
        service.reCalculate(param);
        expect(skeleton.makeDirty).toHaveBeenCalledWith(true);
        expect(skeleton.calculate).toHaveBeenCalled();

        const ensured = service.ensureSkeleton('sheet-1');
        expect(ensured).toBe(skeleton);
        expect(service.getOrCreateSkeleton({ sheetId: 'sheet-1' })).toBe(skeleton);

        expect(service.ensureSkeleton('missing-sheet')).toBeUndefined();

        const rangeWithCoord = service.attachRangeWithCoord({
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
        } as any);
        expect(rangeWithCoord).toEqual({
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            startX: 20,
            startY: 10,
            endX: 30,
            endY: 20,
        });

        worksheets.clear();
        service.setCurrent({ sheetId: 'not-found' });
        expect(workbook.getSheetBySheetId).toHaveBeenCalledWith('not-found');
    });

    it('updates header dimensions and publishes command ids', () => {
        const { service, worksheets, scene, viewportMap, mainViewport } = createService();
        const worksheet = { getSheetId: () => 'sheet-1' };
        worksheets.set('sheet-1', worksheet);
        service.setCurrent({ sheetId: 'sheet-1' });

        const selectionService = { getCurrentSelections: vi.fn(() => [{ range: 1 }]) };
        const selectionRenderService = { resetSelectionsByModelData: vi.fn() };
        const render = {
            unitId: 'unit-1',
            scene,
            with: vi.fn((token: unknown) => {
                if (token === ISheetSelectionRenderService) {
                    return selectionRenderService;
                }
                return selectionService;
            }),
        };

        service.setColumnHeaderSize(render as any, 'sheet-1', 32);
        const skeleton = service.getSkeleton('sheet-1') as any;
        expect(skeleton.columnHeaderHeight).toBe(32);
        expect(mainViewport.top).toBe(32);
        const viewportCalls = Array.from(viewportMap.values()).flatMap((v) => v.setViewportSize.mock.calls);
        expect(viewportCalls.some((args) => args[0]?.height === 32)).toBe(true);
        expect(viewportCalls.some((args) => args[0]?.top === 32)).toBe(true);
        expect(selectionRenderService.resetSelectionsByModelData).toHaveBeenCalledWith([{ range: 1 }]);
        expect(service.getSkeletonParam('sheet-1')?.commandId).toBe(SetColumnHeaderHeightCommand.id);

        service.setRowHeaderSize(render as any, 'sheet-1', 60);
        expect(skeleton.rowHeaderWidth).toBe(60);
        expect(mainViewport.left).toBe(60);
        const viewportCallsAfter = Array.from(viewportMap.values()).flatMap((v) => v.setViewportSize.mock.calls);
        expect(viewportCallsAfter.some((args) => args[0]?.width === 60)).toBe(true);
        expect(viewportCallsAfter.some((args) => args[0]?.left === 26)).toBe(true);
        expect(service.getCurrentParam()?.commandId).toBe(SetRowHeaderWidthCommand.id);

        service.setColumnHeaderSize(null as any, 'sheet-1', 20);
        service.setRowHeaderSize(null as any, 'sheet-1', 20);
        service.disposeSkeleton('sheet-missing');
    });

    it('disposes skeleton on sheet disposal and service dispose', () => {
        const { service, worksheets, sheetDisposed$, sheetSkService } = createService();
        const worksheet = { getSheetId: () => 'sheet-1' };
        worksheets.set('sheet-1', worksheet);
        service.setCurrent({ sheetId: 'sheet-1' });

        const skeleton = service.getSkeleton('sheet-1') as any;
        expect(skeleton).toBeTruthy();

        sheetDisposed$.next({
            getSheetId: () => 'sheet-1',
        });
        expect(skeleton.dispose).toHaveBeenCalled();
        expect(sheetSkService.deleteSkeleton).toHaveBeenCalledWith(expect.any(String), 'sheet-1');
        expect(service.getSkeleton('sheet-1')).toBeNull();

        service.dispose();
    });
});
