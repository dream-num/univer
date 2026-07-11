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

import { FOCUSING_SHEET, ICommandService } from '@univerjs/core';
import { RENDER_CLASS_TYPE, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ScrollCommand, SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import { SheetScrollManagerService } from '../../../services/scroll-manager.service';
import { SheetsScrollRenderController } from '../scroll.render-controller';
import { createRenderTestBed } from './render-test-bed';

function createScrollManagerServiceMock() {
    const rawScrollInfo$ = new Subject<any>();

    const service: any = {
        rawScrollInfo$,
        currentSkeletonBefore$: { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) },
        setValidScrollStateToCurrSheet: vi.fn(),
        validViewportScrollInfo$: { next: vi.fn() },
        setSearchParam: vi.fn(),
        getScrollStateByParam: vi.fn(() => null),
        calcViewportScrollFromRowColOffset: vi.fn(() => ({ viewportScrollX: 0, viewportScrollY: 0 })),
        getCurrentScrollState: vi.fn(() => ({
            sheetViewStartRow: 0,
            sheetViewStartColumn: 0,
            offsetX: 0,
            offsetY: 0,
        })),
    };

    return service;
}

describe('SheetsScrollRenderController', () => {
    it('executes relative scroll command on mousewheel when focused', () => {
        const scrollManagerService = createScrollManagerServiceMock();

        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, scene, contextService } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        contextService.setContextValue(FOCUSING_SHEET, true);

        const _controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);

        const preventDefault = vi.fn();
        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 7, deltaY: 10, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(executeSpy).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 7, offsetY: 10 });

        // Avoid disposing here: faked render context does not implement all IDisposable contracts.
        void _controller;
    });

    it('uses shift-wheel horizontal scrolling and prevents default on scrollable viewport', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
            parentClassType: RENDER_CLASS_TYPE.SCENE_VIEWER,
        });
        const { context, scene, contextService, viewportMap } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        contextService.setContextValue(FOCUSING_SHEET, true);

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;
        viewMain.limitedScroll = vi.fn(() => ({ isLimitedX: false, isLimitedY: false }));

        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();

        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: true, deltaX: 3, deltaY: 7, preventDefault },
            { stopPropagation }
        );

        expect(executeSpy).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 21, offsetY: 0 });
        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();

        void controller;
    });

    it('prevents default when upward wheel scrolling remains inside viewport bounds', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, scene, contextService, viewportMap } = testBed;
        const commandService = testBed.get(ICommandService);
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        viewMain.viewportScrollY = 60;
        viewMain.scrollY = 6;
        viewMain._scrollBar = { ratioScrollX: 0.1, ratioScrollY: 0.1 };
        viewMain.limitedScroll = vi.fn((_x, y) => ({
            isLimitedX: false,
            isLimitedY: y < 0,
        }));

        vi.spyOn(commandService, 'executeCommand').mockImplementation((id, params) => {
            if (id === SetScrollRelativeCommand.id) {
                viewMain.scrollY += (params as any).offsetY;
                viewMain.viewportScrollY += (params as any).offsetY;
            }
            return true as any;
        });

        contextService.setContextValue(FOCUSING_SHEET, true);

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const preventDefault = vi.fn();

        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 0, deltaY: -40, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(viewMain.limitedScroll).toHaveBeenCalledWith(0, 2);
        expect(preventDefault).toHaveBeenCalled();
        expect(viewMain.scrollY).toBe(-34);
        expect(viewMain.viewportScrollY).toBe(20);

        void controller;
    });

    it('normalizes wheel scroll offsets by sheet zoom ratio', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, scene, contextService } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        contextService.setContextValue(FOCUSING_SHEET, true);
        scene.scale(2, 2);

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const preventDefault = vi.fn();

        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 12, deltaY: 20, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(executeSpy).toHaveBeenCalledWith(SetScrollRelativeCommand.id, { offsetX: 6, offsetY: 10 });
        void controller;
    });

    it('locks out minor cross-axis touchpad jitter while wheel scrolling', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, scene, contextService } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        contextService.setContextValue(FOCUSING_SHEET, true);

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const preventDefault = vi.fn();

        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 8, deltaY: 20, preventDefault },
            { stopPropagation: () => { } }
        );
        scene.onMouseWheel$.emit(
            { ctrlKey: false, shiftKey: false, deltaX: 20, deltaY: 8, preventDefault },
            { stopPropagation: () => { } }
        );

        expect(executeSpy).toHaveBeenNthCalledWith(1, SetScrollRelativeCommand.id, { offsetX: 0, offsetY: 20 });
        expect(executeSpy).toHaveBeenNthCalledWith(2, SetScrollRelativeCommand.id, { offsetX: 20, offsetY: 0 });

        void controller;
    });

    it('updates scroll state from viewport events and executes ScrollCommand when scrolling bar', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, viewportMap, sheet } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');
        const worksheet = sheet.getActiveSheet();

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        viewMain.onScrollAfter$.emit({ isTrigger: true, viewportScrollX: 250, viewportScrollY: 45, scrollX: 250, scrollY: 45 }, {});
        expect(scrollManagerService.setValidScrollStateToCurrSheet).toHaveBeenCalledWith({
            sheetViewStartRow: 2,
            sheetViewStartColumn: 2,
            offsetX: 50,
            offsetY: 5,
            viewportScrollX: 250,
            viewportScrollY: 45,
            scrollX: 250,
            scrollY: 45,
        });
        expect(scrollManagerService.validViewportScrollInfo$.next).toHaveBeenCalled();

        viewMain.onScrollByBar$.emit({ isTrigger: true, viewportScrollX: 250, viewportScrollY: 45 }, {});
        expect(executeSpy).toHaveBeenCalledWith(ScrollCommand.id, {
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
            sheetViewStartRow: 2,
            sheetViewStartColumn: 2,
            offsetX: 50,
            offsetY: 5,
        });

        void controller;
    });

    it('defers ScrollCommand for intermediate scrollbar drag events until drag end', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, viewportMap } = testBed;
        const commandService = testBed.get(ICommandService);
        const executeSpy = vi.spyOn(commandService, 'executeCommand');

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        viewMain.onScrollByBar$.emit({
            isTrigger: true,
            isBarDragging: true,
            viewportScrollX: 250,
            viewportScrollY: 45,
        }, {});

        expect(executeSpy).not.toHaveBeenCalledWith(ScrollCommand.id, expect.anything());

        viewMain.onScrollByBar$.emit({
            isTrigger: true,
            isBarDragEnd: true,
            viewportScrollX: 250,
            viewportScrollY: 45,
        }, {});

        expect(executeSpy).toHaveBeenCalledWith(ScrollCommand.id, {
            unitId: 'test',
            sheetId: 'sheet1',
            sheetViewStartRow: 2,
            sheetViewStartColumn: 2,
            offsetX: 50,
            offsetY: 5,
        });

        void controller;
    });

    it('handles skeleton switch sync and raw scroll updates', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        (scrollManagerService as any).getScrollStateByParam = vi.fn(() => ({
            sheetViewStartRow: 3,
            sheetViewStartColumn: 4,
            offsetX: 10,
            offsetY: 6,
        }));
        (scrollManagerService as any).calcViewportScrollFromRowColOffset = vi.fn(() => ({ viewportScrollX: 410, viewportScrollY: 66 }));

        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, viewportMap, sheet, sheetSkeletonManagerService } = testBed;
        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);
        const viewMain = viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) as any;

        scrollManagerService.rawScrollInfo$.next({
            sheetViewStartRow: 1,
            sheetViewStartColumn: 2,
            offsetX: 5,
            offsetY: 7,
        });
        expect(viewMain.viewportScrollX).toBe(205);
        expect(viewMain.viewportScrollY).toBe(27);

        sheetSkeletonManagerService.emitCurrentSkeletonBefore({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
        });
        expect(scrollManagerService.setSearchParam).toHaveBeenCalledWith({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
        });
        expect(viewMain.viewportScrollX).toBe(410);
        expect(viewMain.viewportScrollY).toBe(66);

        void controller;
    });

    it('scrolls to cell with freeze offset and supports range-based scroll', () => {
        const scrollManagerService = createScrollManagerServiceMock();
        const testBed = createRenderTestBed({
            dependencies: [[SheetScrollManagerService, { useValue: scrollManagerService }]],
        });
        const { context, sheet } = testBed;
        const commandService = testBed.get(ICommandService);
        const syncSpy = vi.spyOn(commandService, 'syncExecuteCommand').mockReturnValue(true as any);

        (testBed.skeleton as any).getHiddenColumnsInRange = vi.fn(() => []);
        (testBed.skeleton as any).getHiddenRowsInRange = vi.fn(() => []);

        const worksheet = sheet.getActiveSheet();
        worksheet.getConfig().freeze = { startRow: 2, startColumn: 1, ySplit: 2, xSplit: 1 };

        const controller = testBed.injector.createInstance(SheetsScrollRenderController, context as any);

        expect(controller.scrollToCell(5, 7, 300)).toBe(true);
        expect(syncSpy).toHaveBeenCalledWith(ScrollCommand.id, {
            unitId: sheet.getUnitId(),
            sheetId: worksheet.getSheetId(),
            sheetViewStartRow: 3,
            sheetViewStartColumn: 6,
            offsetX: 0,
            offsetY: 0,
            duration: 300,
        });

        const scrolled = controller.scrollToRange(
            { startRow: 30, endRow: 30, startColumn: 2, endColumn: 2 },
            true,
            false
        );
        expect(scrolled).toBe(true);

        void controller;
    });
});
