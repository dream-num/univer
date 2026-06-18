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

import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    RANGE_TYPE,
    ThemeService,
} from '@univerjs/core';
import { ScrollTimerType, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { REF_SELECTIONS_ENABLED, SELECTIONS_ENABLED } from '@univerjs/sheets';
import { IPlatformService, IShortcutService, PlatformService, ShortcutService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
    createFakeEngine,
    createFakeScene,
    createFakeSkeleton,
    createFakeViewport,
} from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { BaseSelectionRenderService } from '../base-selection-render.service';
import { SelectionLayer } from '../selection-layer';

class TestSelectionRenderService extends BaseSelectionRenderService {
    cleanupForTest() {
        if (this._scene) {
            this._clearUpdatingListeners();
        }
    }

    emitMoving() {
        this._selectionMoving$.next([]);
    }

    emitMoveEnd() {
        this._selectionMoveEnd$.next([]);
    }

    changeRuntimeForTest(options?: { freeze?: { startRow: number; startColumn: number; xSplit: number; ySplit: number } }) {
        const skeleton = createSelectionSkeleton(options?.freeze);
        TestSheetSkeletonManagerService.skeleton = skeleton;
        const scene = createFakeScene(new Map([
            [SHEET_VIEWPORT_KEY.VIEW_MAIN, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)],
            [SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP)],
            [SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP)],
            [SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT)],
        ]));
        this._changeRuntime(skeleton as never, scene as never);
        return { skeleton, scene };
    }

    getViewportByCellForTest(row?: number, column?: number) {
        return this._getViewportByCell(row, column);
    }

    getSelectionByOffsetForTest(offsetX: number, offsetY: number, rangeType = RANGE_TYPE.NORMAL) {
        this._rangeType = rangeType;
        return this._getSelectionWithCoordByOffset(offsetX, offsetY, 1, 1, { x: 0, y: 0 });
    }

    moveSelectionForTest(offsetX: number, offsetY: number, rangeType = RANGE_TYPE.NORMAL) {
        const activeControl = this.getActiveSelectionControl();
        this._startRangeWhenPointerDown = activeControl!.model as never;
        this._startViewportPosX = 0;
        this._startViewportPosY = 0;
        this._movingHandler(offsetX, offsetY, activeControl, rangeType);
    }

    listenPointerMoveForTest(rangeType = RANGE_TYPE.NORMAL) {
        const activeControl = this.getActiveSelectionControl()!;
        this._startRangeWhenPointerDown = activeControl.model as never;
        this._startViewportPosX = 0;
        this._startViewportPosY = 0;
        this._setupPointerMoveListener(
            this._scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN),
            activeControl,
            rangeType,
            ScrollTimerType.ALL,
            0,
            0
        );
    }

    checkClearPreviousControlsForTest(evt: { ctrlKey?: boolean; shiftKey?: boolean }) {
        this._checkClearPreviousControls(evt as never);
    }

    setSingleModeForTest(enabled: boolean) {
        this.setSingleSelectionEnabled(enabled);
    }

    extendSelectionFromActiveToTest(row: number, column: number) {
        const activeControl = this.getActiveSelectionControl()!;
        const currentCell = (this._skeleton as never as {
            getCellWithCoordByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
        }).getCellWithCoordByOffset(column * 100, row * 20, 1, 1, { x: 0, y: 0 });
        this._makeSelectionByTwoCells(currentCell as never, activeControl.model as never, this._skeleton, RANGE_TYPE.NORMAL, activeControl);
    }

    addExternalEndingListenersForTest(activeScene: { onPointerDown$: unknown; onPointerUp$: unknown }) {
        (this._scene as never as { getEngine: () => { activeScene: unknown } }).getEngine = () => ({ activeScene });
        this._addEndingListeners();
    }
}

class TestSheetSkeletonManagerService {
    static skeleton = createSelectionSkeleton();

    getCurrentParam() {
        return {
            unitId: 'test',
            sheetId: 'sheet1',
            skeleton: TestSheetSkeletonManagerService.skeleton,
        };
    }
}

function createSelectionSkeleton(freeze = { startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 }) {
    const skeleton = createFakeSkeleton({
        getWorksheetConfig: () => ({ freeze }),
    });
    const withCellMeta = (row: number, column: number) => {
        const coord = skeleton.getNoMergeCellWithCoordByIndex(row, column);
        return {
            ...coord,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
            mergeInfo: {
                ...coord,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            },
        };
    };

    (skeleton as never as {
        getCellWithCoordByOffset: (
            x: number,
            y: number,
            scaleX: number,
            scaleY: number,
            scrollXY: { x: number; y: number }
        ) => unknown;
        getCellByOffset: (
            x: number,
            y: number,
            scaleX: number,
            scaleY: number,
            scrollXY: { x: number; y: number }
        ) => unknown;
        expandRangeByMerge: <T>(range: T) => T;
    }).getCellWithCoordByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return withCellMeta(row, column);
    };
    (skeleton as never as {
        getCellByOffset: (
            x: number,
            y: number,
            scaleX: number,
            scaleY: number,
            scrollXY: { x: number; y: number }
        ) => unknown;
    }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return withCellMeta(row, column);
    };
    (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;

    return skeleton;
}

function createSelectionRenderService() {
    vi.stubGlobal('window', new EventTarget());
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([IPlatformService, { useClass: PlatformService }]);
    injector.add([IShortcutService, { useClass: ShortcutService }]);
    injector.add([ThemeService]);
    injector.add([SheetSkeletonManagerService, { useClass: TestSheetSkeletonManagerService as never }]);

    const contextService = injector.get(IContextService);
    contextService.setContextValue(SELECTIONS_ENABLED, true);
    contextService.setContextValue(REF_SELECTIONS_ENABLED, false);

    const service = injector.createInstance(
        TestSelectionRenderService,
        injector,
        injector.get(ThemeService),
        injector.get(IShortcutService),
        injector.get(SheetSkeletonManagerService),
        contextService
    );
    createdServices.push(service);

    return { injector, contextService, service };
}

function createSelection(range: ISelectionWithStyle['range']): ISelectionWithStyle {
    return {
        range,
        primary: {
            actualRow: range.startRow,
            actualColumn: range.startColumn,
            startRow: range.startRow,
            endRow: range.startRow,
            startColumn: range.startColumn,
            endColumn: range.startColumn,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function viewportKey(viewport: unknown) {
    return (viewport as { viewportKey?: string } | null)?.viewportKey;
}

const createdServices: TestSelectionRenderService[] = [];

const selections: ISelectionWithStyle[] = [
    createSelection({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.NORMAL }),
    createSelection({ startRow: 2, endRow: 3, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL }),
];

describe('BaseSelectionRenderService', () => {
    afterEach(() => {
        createdServices.forEach((service) => service.cleanupForTest());
        createdServices.length = 0;
        vi.unstubAllGlobals();
    });

    it('tracks whether a sheet selection drag is moving', () => {
        const { service } = createSelectionRenderService();

        service.emitMoving();
        expect(service.selectionMoving).toBe(true);

        service.emitMoveEnd();
        expect(service.selectionMoving).toBe(false);
    });

    it('resets rendered selection controls from workbook selection data', () => {
        const { contextService, service } = createSelectionRenderService();
        service.changeRuntimeForTest();

        service.resetSelectionsByModelData(selections);
        expect(service.getSelectionControls()).toHaveLength(2);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 4,
        });

        service.setActiveSelectionIndex(0);
        expect(service.getActiveSelectionControl()?.getRange()).toMatchObject({
            startRow: 1,
            endRow: 1,
            startColumn: 1,
            endColumn: 1,
        });

        service.resetActiveSelectionIndex();
        service.resetSelectionsByModelData([selections[0]]);
        expect(service.getSelectionControls()).toHaveLength(1);
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord).toMatchObject({
            unitId: 'test',
            sheetId: 'sheet1',
            startRow: 1,
            startColumn: 1,
        });

        contextService.setContextValue(SELECTIONS_ENABLED, false);
        service.resetSelectionsByModelData(selections);
        expect(service.getSelectionControls()).toHaveLength(1);
        expect(service.isSelectionDisabled()).toBe(true);
        expect(service.inRefSelectionMode()).toBe(false);
    });

    it('chooses the visible viewport for frozen row and column selections', () => {
        const { service } = createSelectionRenderService();
        service.changeRuntimeForTest({
            freeze: { startRow: 2, startColumn: 2, xSplit: 0, ySplit: 0 },
        });

        expect(service.getViewportByCellForTest()).toBeNull();
        expect(viewportKey(service.getViewportByCellForTest(3, 3))).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(viewportKey(service.getViewportByCellForTest(1, 1))).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
        expect(viewportKey(service.getViewportByCellForTest(1, 3))).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
        expect(viewportKey(service.getViewportByCellForTest(3, 1))).toBe(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
    });

    it('converts pointer offsets into sheet cells and expands an active selection while dragging', () => {
        const { service } = createSelectionRenderService();
        service.changeRuntimeForTest();
        service.resetSelectionsByModelData([selections[0]]);

        expect(service.getCellWithCoordByOffset(250, 45)).toMatchObject({
            actualRow: 2,
            actualColumn: 2,
            startRow: 2,
            startColumn: 2,
        });
        expect(service.getSelectionByOffsetForTest(250, 45)).toMatchObject({
            rangeWithCoord: {
                startRow: 2,
                endRow: 2,
                startColumn: 2,
                endColumn: 2,
            },
        });
        expect(service.getSelectionByOffsetForTest(250, 45, RANGE_TYPE.ROW)).toMatchObject({
            rangeWithCoord: {
                startRow: 2,
                endRow: 2,
                startColumn: 2,
                endColumn: 2,
            },
        });

        const movingSelections: unknown[] = [];
        service.selectionMoving$.subscribe((selection) => movingSelections.push(selection));
        service.moveSelectionForTest(350, 65);

        expect(service.getActiveRange()).toEqual({
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        });
        expect(movingSelections).toHaveLength(1);
    });

    it('emits finalized selection data and clears active drag listeners when selection ends', () => {
        const { service } = createSelectionRenderService();
        service.changeRuntimeForTest();
        service.resetSelectionsByModelData([selections[0]]);

        const finalizedSelections: unknown[] = [];
        service.selectionMoveEnd$.subscribe((selection) => finalizedSelections.push(selection));
        service.moveSelectionForTest(250, 45);
        service.endSelection();

        expect(finalizedSelections[finalizedSelections.length - 1]).toMatchObject([{
            rangeWithCoord: {
                unitId: 'test',
                sheetId: 'sheet1',
                startRow: 1,
                startColumn: 1,
                endRow: 2,
                endColumn: 2,
            },
        }]);
        expect(service.selectionMoving).toBe(false);
    });

    it('preserves existing selections for additive selection gestures and clears them for single-selection gestures', () => {
        const { service } = createSelectionRenderService();
        service.changeRuntimeForTest();
        service.resetSelectionsByModelData(selections);

        service.checkClearPreviousControlsForTest({ ctrlKey: true });
        expect(service.getSelectionControls()).toHaveLength(2);

        service.checkClearPreviousControlsForTest({ shiftKey: true });
        expect(service.getSelectionControls()).toHaveLength(2);

        service.setSingleModeForTest(true);
        service.checkClearPreviousControlsForTest({ ctrlKey: true });
        expect(service.getSelectionControls()).toHaveLength(0);
    });

    it('expands the active selection between the anchor cell and the current pointer cell', () => {
        const { service } = createSelectionRenderService();
        service.changeRuntimeForTest();
        service.resetSelectionsByModelData([selections[0]]);

        service.extendSelectionFromActiveToTest(4, 5);

        expect(service.getActiveRange()).toEqual({
            startRow: 1,
            startColumn: 1,
            endRow: 4,
            endColumn: 5,
        });
    });

    it('updates the active selection through the pointer-move listener during drag', () => {
        const { service } = createSelectionRenderService();
        const { scene } = service.changeRuntimeForTest();
        service.resetSelectionsByModelData([selections[0]]);
        const movingSelections: unknown[] = [];
        service.selectionMoving$.subscribe((selection) => movingSelections.push(selection));

        service.listenPointerMoveForTest();
        (scene.onPointerMove$ as unknown as { emit: (evt: unknown, state?: unknown) => void }).emit({
            offsetX: 350,
            offsetY: 65,
        });

        expect(service.getActiveRange()).toEqual({
            startRow: 1,
            startColumn: 1,
            endRow: 3,
            endColumn: 3,
        });
        expect(movingSelections.length).toBeGreaterThan(0);
    });

    it('cancels an in-progress selection when another scene receives a pointer event', () => {
        const { service } = createSelectionRenderService();
        const { scene } = service.changeRuntimeForTest();
        const activeScene = {
            onPointerDown$: {
                subscribeEvent: (listener: () => void) => {
                    (activeScene as never as { pointerDown: () => void }).pointerDown = listener;
                    return { unsubscribe: () => { }, dispose: () => { } };
                },
            },
            onPointerUp$: {
                subscribeEvent: (listener: () => void) => {
                    (activeScene as never as { pointerUp: () => void }).pointerUp = listener;
                    return { unsubscribe: () => { }, dispose: () => { } };
                },
            },
        };
        let objectsEventEnabled = false;
        (scene as never as { enableObjectsEvent: () => void }).enableObjectsEvent = () => {
            objectsEventEnabled = true;
        };

        service.addExternalEndingListenersForTest(activeScene);
        (activeScene as never as { pointerDown: () => void }).pointerDown();

        expect(objectsEventEnabled).toBe(true);
    });

    it('reports selection layer render timing after a render pass', () => {
        const injector = new Injector();
        const engine = createFakeEngine();
        const scene = createFakeScene(new Map(), { engine });
        const metrics: Array<[string, number]> = [];
        engine.renderFrameTimeMetric$.subscribe((metric) => metrics.push(metric));
        const layer = injector.createInstance(SelectionLayer, scene as never, [], 7);
        const ctx = {
            save: () => { },
            restore: () => { },
        };

        expect(layer.render(ctx as never)).toBe(layer);

        expect(metrics[0][0]).toBe('selectionLayer');
        expect(metrics[0][1]).toBeGreaterThanOrEqual(0);
    });
});
