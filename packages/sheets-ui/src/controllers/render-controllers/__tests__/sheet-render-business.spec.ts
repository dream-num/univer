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

import { CommandType } from '@univerjs/core';
import { SetFormulaCalculationNotificationMutation } from '@univerjs/engine-formula';
import { SHEET_EXTENSION_PREFIX, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { MoveRangeMutation, SetRangeValuesMutation } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { SheetRenderController } from '../sheet.render-controller';

const renderClasses = vi.hoisted(() => {
    class FakeComponent {
        key: string;
        updateSkeleton = vi.fn();
        transformByState = vi.fn();
        makeDirty = vi.fn();
        setDirtyArea = vi.fn();

        constructor(key: string) {
            this.key = key;
        }
    }

    class FakeSpreadsheet extends FakeComponent {}
    class FakeSpreadsheetRowHeader extends FakeComponent {}
    class FakeSpreadsheetColumnHeader extends FakeComponent {}
    class FakeRect extends FakeComponent {
        options: unknown;

        constructor(key: string, options: unknown) {
            super(key);
            this.options = options;
        }
    }

    class FakeViewport {
        viewportKey: string;
        options: Record<string, unknown>;
        isActive = true;
        cacheBound = { top: 0, left: 0, bottom: 500, right: 500 };
        markDirty = vi.fn();

        constructor(viewportKey: string, scene: any, options: Record<string, unknown> = {}) {
            this.viewportKey = viewportKey;
            this.options = options;
            scene.__viewports.push(this);
        }
    }

    class FakeScrollBar {
        constructor(viewport: FakeViewport, options?: unknown) {
            (viewport as any).scrollBarOptions = options;
        }
    }

    return {
        FakeRect,
        FakeScrollBar,
        FakeSpreadsheet,
        FakeSpreadsheetColumnHeader,
        FakeSpreadsheetRowHeader,
        FakeViewport,
    };
});

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();

    return {
        ...actual,
        Rect: renderClasses.FakeRect,
        ScrollBar: renderClasses.FakeScrollBar,
        Spreadsheet: renderClasses.FakeSpreadsheet,
        SpreadsheetColumnHeader: renderClasses.FakeSpreadsheetColumnHeader,
        SpreadsheetRowHeader: renderClasses.FakeSpreadsheetRowHeader,
        Viewport: renderClasses.FakeViewport,
    };
});

function createCommandService() {
    const handlers = new Set<(command: any, options?: any) => void>();

    return {
        onCommandExecuted: vi.fn((handler: (command: any, options?: any) => void) => {
            handlers.add(handler);
            return { dispose: vi.fn(() => handlers.delete(handler)) };
        }),
        emit: (command: any, options?: any) => handlers.forEach((handler) => handler(command, options)),
    };
}

function createController() {
    const activated$ = new BehaviorSubject(true);
    const currentSkeleton$ = new Subject<any>();
    const commandService = createCommandService();
    const scene = {
        __viewports: [] as any[],
        render: vi.fn(),
        addObjects: vi.fn(),
        enableLayerCache: vi.fn(),
        attachControl: vi.fn(),
        makeDirty: vi.fn(),
        getViewports: vi.fn(function (this: any) {
            return this.__viewports;
        }),
    };
    const engine = {
        beginFrame$: new Subject<void>(),
        endFrame$: new Subject<any>(),
        renderFrameTimeMetric$: new Subject<[string, number]>(),
        renderFrameTags$: new Subject<[string, unknown]>(),
        runRenderLoop: vi.fn(),
        stopRenderLoop: vi.fn(),
    };
    const worksheet = {
        getSheetId: vi.fn(() => 'sheet-1'),
        getConfig: vi.fn(() => ({
            rowHeader: { width: 46 },
            columnHeader: { height: 20 },
        })),
    };
    const workbook = {
        getUnitId: vi.fn(() => 'unit-1'),
        getActiveSheet: vi.fn(() => worksheet),
        getSheetBySheetId: vi.fn(() => worksheet),
    };
    const skeleton = {
        rowHeaderWidth: 46,
        columnHeaderHeight: 20,
        rowHeaderWidthAndMarginLeft: 66,
        columnHeaderHeightAndMarginTop: 30,
        rowHeightAccumulation: [20, 40, 60, 80, 100],
        columnWidthAccumulation: [50, 100, 150, 200, 250],
    };
    const sheetSkeletonManagerService = {
        currentSkeleton$,
        setCurrent: vi.fn(),
        makeDirty: vi.fn(),
        reCalculate: vi.fn(),
        getCurrentParam: vi.fn(() => ({ skeleton })),
    };
    const telemetryService = { capture: vi.fn() };
    const context = {
        unitId: 'unit-1',
        unit: workbook,
        scene,
        engine,
        activated$,
        components: new Map(),
        mainComponent: null as any,
    };
    const controller = new SheetRenderController(
        context as any,
        { getConfig: vi.fn(() => ({ scrollConfig: { barSize: 8 } })) } as any,
        sheetSkeletonManagerService as any,
        { checkMutationShouldTriggerRerender: vi.fn((id: string) => id === 'sheet.custom-rerender') } as any,
        commandService as any,
        telemetryService as any
    );

    return {
        activated$,
        commandService,
        context,
        controller,
        engine,
        scene,
        sheetSkeletonManagerService,
        skeleton,
        telemetryService,
        workbook,
        worksheet,
    };
}

describe('SheetRenderController business flows', () => {
    it('creates sheet render components, viewports, and toggles the render loop with context activation', () => {
        const { activated$, context, controller, engine, scene, sheetSkeletonManagerService } = createController();

        expect(context.components.get(SHEET_VIEW_KEY.MAIN)).toBe(context.mainComponent);
        expect(context.components.get(SHEET_VIEW_KEY.ROW)).toBeTruthy();
        expect(context.components.get(SHEET_VIEW_KEY.COLUMN)).toBeTruthy();
        expect(context.components.get(SHEET_VIEW_KEY.LEFT_TOP)).toBeTruthy();
        expect(scene.addObjects).toHaveBeenCalledTimes(2);
        expect(scene.enableLayerCache).toHaveBeenCalled();
        expect(scene.attachControl).toHaveBeenCalled();
        expect(scene.__viewports.map((viewport) => viewport.viewportKey)).toContain(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(sheetSkeletonManagerService.setCurrent).toHaveBeenCalledWith({ sheetId: 'sheet-1' });
        expect(engine.runRenderLoop).toHaveBeenCalledTimes(1);

        const frameFn = engine.runRenderLoop.mock.calls[0][0];
        frameFn();
        expect(scene.render).toHaveBeenCalled();

        activated$.next(false);
        expect(engine.stopRenderLoop).toHaveBeenCalledWith(frameFn);
        activated$.next(true);
        expect(engine.runRenderLoop).toHaveBeenCalledWith(frameFn);

        controller.dispose();
    });

    it('updates rendered sheet parts when a fresh skeleton is emitted', () => {
        const { context, controller, sheetSkeletonManagerService, skeleton } = createController();
        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as any;
        const placeholder = context.components.get(SHEET_VIEW_KEY.LEFT_TOP) as any;

        sheetSkeletonManagerService.currentSkeleton$.next({ sheetId: 'sheet-1', skeleton });

        expect(context.mainComponent.updateSkeleton).toHaveBeenCalledWith(skeleton);
        expect(rowHeader.updateSkeleton).toHaveBeenCalledWith(skeleton);
        expect(columnHeader.updateSkeleton).toHaveBeenCalledWith(skeleton);
        expect(placeholder.transformByState).toHaveBeenCalledWith({ width: 66, height: 30 });

        controller.dispose();
    });

    it('marks skeleton and dirty render areas for worksheet and value mutations', () => {
        const { commandService, context, controller, scene, sheetSkeletonManagerService } = createController();
        const mainViewport = scene.__viewports.find((viewport) => viewport.viewportKey === SHEET_VIEWPORT_KEY.VIEW_MAIN);

        commandService.emit({
            id: 'sheet.custom-rerender',
            type: CommandType.MUTATION,
            params: { unitId: 'unit-1', subUnitId: 'sheet-1' },
        });
        expect(sheetSkeletonManagerService.makeDirty).toHaveBeenCalledWith({
            sheetId: 'sheet-1',
            commandId: 'sheet.custom-rerender',
        }, true);
        expect(sheetSkeletonManagerService.setCurrent).toHaveBeenLastCalledWith({
            sheetId: 'sheet-1',
            commandId: 'sheet.custom-rerender',
        });

        commandService.emit({
            id: SetRangeValuesMutation.id,
            type: CommandType.MUTATION,
            params: {
                cellValue: {
                    1: { 2: { v: 'A' } },
                    2: { 3: { v: 'B' } },
                },
            },
        });
        expect(context.mainComponent.makeDirty).toHaveBeenCalled();
        expect(scene.makeDirty).toHaveBeenCalled();
        expect(mainViewport.markDirty).toHaveBeenCalledWith(true);
        expect(context.mainComponent.setDirtyArea).toHaveBeenCalledWith([{
            top: 0,
            left: 0,
            bottom: 80,
            right: 246,
            width: 246,
            height: 80,
        }]);

        commandService.emit({
            id: MoveRangeMutation.id,
            type: CommandType.MUTATION,
            params: {
                fromRange: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                toRange: { startRow: 3, endRow: 3, startColumn: 4, endColumn: 4 },
                from: { value: { 0: { 0: {} } } },
                to: { value: { 3: { 4: {} } } },
            },
        });
        expect(context.mainComponent.setDirtyArea).toHaveBeenCalledTimes(2);

        const dirtyCountBeforeCalculationNotification = scene.makeDirty.mock.calls.length;
        commandService.emit({
            id: SetFormulaCalculationNotificationMutation.id,
            type: CommandType.MUTATION,
            params: { stageInfo: { stage: 'calculating' } },
        });
        expect(scene.makeDirty).toHaveBeenCalledTimes(dirtyCountBeforeCalculationNotification);

        controller.dispose();
    });

    it('summarizes sheet render frame metrics and captures telemetry after enough frames', () => {
        const { controller, engine, telemetryService } = createController();
        const metrics: any[] = [];
        const subscription = controller.renderMetric$.subscribe((metric) => metrics.push(metric));

        for (let i = 0; i < 62; i++) {
            engine.beginFrame$.next();
            engine.renderFrameTimeMetric$.next([`${SHEET_EXTENSION_PREFIX}_cell`, 1.111]);
            engine.renderFrameTimeMetric$.next(['layout', 2.225]);
            engine.renderFrameTags$.next(['scrolling', true]);
            engine.endFrame$.next({ FPS: 60 - (i % 2), elapsedTime: i + 1, frameTime: 3.456 });
        }

        expect(metrics).toHaveLength(1);
        expect(metrics[0]).toMatchObject({
            unitId: 'unit-1',
            sheetId: 'sheet-1',
            elapsedTimeToStart: 61,
            FPS: { max: 60, min: 59, avg: 59.51 },
            frameTime: { max: 3.46, min: 3.46, avg: 3.46 },
            extensionTotal: { max: 1.11, min: 1.11, avg: 1.11 },
        });
        expect(telemetryService.capture).toHaveBeenCalledWith('sheet_render_cost', metrics[0]);

        subscription.unsubscribe();
        controller.dispose();
    });
});
