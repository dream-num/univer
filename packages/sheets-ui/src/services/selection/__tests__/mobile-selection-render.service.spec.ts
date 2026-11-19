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
import type { IPointerEvent } from '@univerjs/engine-render';
import {
    IContextService,
    Injector,
    IUniverInstanceService,
    RANGE_TYPE,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import {
    SelectionMoveType,
    SELECTIONS_ENABLED,
    SetSelectionsOperation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { IShortcutService, KeyCode } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { SetScrollRelativeCommand } from '../../../commands/commands/set-scroll.command';
import { SetScrollOperation } from '../../../commands/operations/scroll.operation';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { MOBILE_EXPANDING_SELECTION } from '../../../consts/mobile-context';
import { createChartRenderTestBed } from '../../../controllers/render-controllers/__tests__/chart-render-test-bed';
import {
    createFakeScene,
    createFakeSkeleton,
    createFakeViewport,
    createRenderTestBed,
    createTestEvent,
} from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { MobileSheetsScrollRenderController } from '../../../controllers/render-controllers/mobile/mobile-scroll.render-controller';
import { SheetScrollManagerService } from '../../scroll-manager.service';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { MobileSheetsSelectionRenderService } from '../mobile-selection-render.service';
import { MobileSelectionControl } from '../mobile-selection-shape';

class TestThemeService {
    getColorFromTheme(key: string) {
        return key === 'gray.0' ? '#ffffff' : '#3b82f6';
    }
}

class TestShortcutService {
    forceEscape() {
        return { dispose: () => { } };
    }
}

class TestSheetScrollManagerService {
    readonly validViewportScrollInfo$ = new BehaviorSubject<{ viewportScrollX: number; viewportScrollY: number } | null>(null);
}

function installPointerUpEvent(mainComponent: ReturnType<typeof createRenderTestBed>['context']['mainComponent']) {
    if (!mainComponent) throw new Error('Expected the sheet render component to be available.');
    Object.assign(mainComponent, { onPointerUp$: createTestEvent() });
}

function createMobileControl(rangeType: RANGE_TYPE) {
    const injector = new Injector();
    injector.add([ThemeService, { useClass: TestThemeService }]);
    const viewport = createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    const scene = createFakeScene(new Map([[SHEET_VIEWPORT_KEY.VIEW_MAIN, viewport]]));
    const skeleton = createFakeSkeleton();
    const control = injector.createInstance(
        MobileSelectionControl,
        scene as never,
        1,
        injector.get(ThemeService),
        {
            rowHeaderWidth: skeleton.rowHeaderWidth,
            columnHeaderHeight: skeleton.columnHeaderHeight,
            rangeType,
        }
    );

    control.updateRangeBySelectionWithCoord({
        rangeWithCoord: {
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
            startX: 100,
            startY: 20,
            endX: 300,
            endY: 80,
            rangeType,
        },
        primaryWithCoord: {
            actualRow: 1,
            actualColumn: 1,
            isMerged: false,
            isMergedMainCell: false,
            startX: 100,
            startY: 20,
            endX: 200,
            endY: 40,
            mergeInfo: {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                startX: 100,
                startY: 20,
                endX: 200,
                endY: 40,
            },
        },
        style: null,
    }, skeleton as never);

    return control;
}

function installCellLookupForMobileSelection(skeleton: ReturnType<typeof createFakeSkeleton>) {
    const cellWithMeta = (row: number, column: number) => {
        const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
        return {
            ...cell,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
            mergeInfo: {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            },
        };
    };
    (skeleton as never as {
        getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
        getCellWithCoordByIndex: (row: number, column: number) => unknown;
        getCellWithCoordByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
        getColumnCount: () => number;
        getRowCount: () => number;
        expandRangeByMerge: <T>(range: T) => T;
    }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return cellWithMeta(row, column);
    };
    (skeleton as never as { getCellWithCoordByIndex: (row: number, column: number) => unknown }).getCellWithCoordByIndex = cellWithMeta;
    (skeleton as never as {
        getCellWithCoordByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
    }).getCellWithCoordByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return cellWithMeta(row, column);
    };
    (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
    (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
    (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;
}

describe('MobileSheetsSelectionRenderService', () => {
    it('restores a keyboard-moved selection when cell editing ends', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, contextService } = testBed;
        installPointerUpEvent(context.mainComponent);
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context);
        expect(contextService.getContextValue(SELECTIONS_ENABLED)).toBe(true);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton,
        });
        injector.get(SheetsSelectionsService).setSelections(sheet.getUnitId(), 'sheet1', [{
            range: {
                startRow: 2,
                endRow: 2,
                startColumn: 1,
                endColumn: 1,
            },
            primary: {
                startRow: 2,
                endRow: 2,
                startColumn: 1,
                endColumn: 1,
                actualRow: 2,
                actualColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
        }], SelectionMoveType.MOVE_END);

        expect(service.getSelectionControls()).toHaveLength(1);
        injector.get(SheetsSelectionsService).setSelections(sheet.getUnitId(), 'sheet1', [], SelectionMoveType.MOVE_END);
        expect(service.getSelectionControls()).toHaveLength(0);
        injector.get(SheetsSelectionsService).setSelections(sheet.getUnitId(), 'sheet1', [{
            range: {
                startRow: 3,
                endRow: 3,
                startColumn: 1,
                endColumn: 1,
            },
            primary: {
                startRow: 3,
                endRow: 3,
                startColumn: 1,
                endColumn: 1,
                actualRow: 3,
                actualColumn: 1,
                isMerged: false,
                isMergedMainCell: false,
            },
        }], SelectionMoveType.MOVE_END);
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 1,
            endColumn: 1,
        });

        service.dispose();
        testBed.univer.dispose();
    });

    it('positions mobile expand handles on normal selections', () => {
        const control = createMobileControl(RANGE_TYPE.NORMAL);

        expect(control.fillControl.visible).toBe(false);
        expect(control.expandControlTopLeft?.visible).toBe(true);
        expect(control.expandControlBottomRight?.visible).toBe(true);
        expect(control.expandControlTopLeft?.left).toBeLessThan(0);
        expect(control.expandControlBottomRight?.left).toBeGreaterThan(0);
        expect(control.getViewportMainScrollInfo()).toMatchObject({
            viewportScrollX: 0,
            viewportScrollY: 0,
            width: 800,
            height: 600,
        });
    });

    it('keeps row and column expand handles inside the visible sheet body', () => {
        const rowControl = createMobileControl(RANGE_TYPE.ROW);
        rowControl.transformControlPoint(900, 0, 500, 500);
        expect(rowControl.rangeType).toBe(RANGE_TYPE.ROW);
        expect(rowControl.expandControlTopLeft?.left).toBeLessThanOrEqual(500);
        expect(rowControl.expandControlBottomRight?.top).toBeGreaterThan(rowControl.expandControlTopLeft?.top ?? 0);

        const columnControl = createMobileControl(RANGE_TYPE.COLUMN);
        columnControl.transformControlPoint(0, 900, 500, 300);
        expect(columnControl.rangeType).toBe(RANGE_TYPE.COLUMN);
        expect(columnControl.expandControlTopLeft?.top).toBeLessThanOrEqual(300);
        expect(columnControl.expandControlBottomRight?.left).toBeGreaterThan(columnControl.expandControlTopLeft?.left ?? 0);
    });

    it('keeps replacement mobile handles wired through disposal', () => {
        const control = createMobileControl(RANGE_TYPE.NORMAL);
        const topLeft = control.expandControlTopLeft!;
        const bottomRight = control.expandControlBottomRight!;

        control.expandControlTopLeft = topLeft;
        control.expandControlBottomRight = bottomRight;
        control.rangeType = RANGE_TYPE.ALL;

        expect(control.expandControlTopLeft).toBe(topLeft);
        expect(control.expandControlBottomRight).toBe(bottomRight);
        expect(control.rangeType).toBe(RANGE_TYPE.ALL);

        control.dispose();
    });

    it('creates mobile selections from pointer positions after the sheet skeleton is ready', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, scene } = testBed;
        installPointerUpEvent(context.mainComponent);
        let clearSelectedObjectsCount = 0;
        Object.assign(scene, {
            getTransformer: () => ({
                clearSelectedObjects: () => clearSelectedObjectsCount++,
            }),
        });
        (skeleton as never as {
            getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
            getColumnCount: () => number;
            getRowCount: () => number;
        }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
            const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            };
        };
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.NORMAL);
        expect(clearSelectedObjectsCount).toBe(1);
        expect(service.getSelectionControls()).toHaveLength(1);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.ROW);
        expect(clearSelectedObjectsCount).toBe(2);
        expect(service.getActiveRange()).toMatchObject({
            startRow: 2,
            endRow: 2,
            startColumn: 0,
            endColumn: 49,
        });

        const scrollManager = injector.get(SheetScrollManagerService) as never as TestSheetScrollManagerService;
        scrollManager.validViewportScrollInfo$.next({ viewportScrollX: 240, viewportScrollY: 180 });
        expect(service.getActiveSelectionControl<MobileSelectionControl>()?.expandControlTopLeft?.left).toBeGreaterThan(0);

        const leftTopPlaceholder = context.components.get(SHEET_VIEW_KEY.LEFT_TOP)!;
        let stopped = false;
        (leftTopPlaceholder.onPointerDown$ as unknown as { emit: (evt: unknown, state: { stopPropagation: () => void }) => void }).emit({ button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(clearSelectedObjectsCount).toBe(3);
        expect(service.getActiveRange()).toMatchObject({
            startRow: 0,
            startColumn: 0,
            endRow: 199,
            endColumn: 49,
        });

        service.dispose();
        testBed.univer.dispose();
    });

    it('expands a mobile selection by dragging the bottom-right handle', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, scene, contextService } = testBed;
        installPointerUpEvent(context.mainComponent);
        installCellLookupForMobileSelection(skeleton);
        Object.assign(scene, { getTransformer: () => ({ clearSelectedObjects: () => { } }) });
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.NORMAL);
        const movingSelections: unknown[] = [];
        service.selectionMoving$.subscribe((selection) => movingSelections.push(selection));
        const activeControl = service.getActiveSelectionControl<MobileSelectionControl>()!;

        activeControl.expandControlBottomRight!.onPointerDown$.emitEvent({ offsetX: 150, offsetY: 45 } as never);
        expect(contextService.getContextValue('MOBILE_EXPANDING_SELECTION')).toBe(true);

        (scene.onPointerMove$ as unknown as { emit: (evt: unknown, state?: unknown) => void }).emit({ offsetX: 360, offsetY: 90 });
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
        expect(service.getSelectionDataWithStyle()[0].primaryWithCoord).toMatchObject({
            actualRow: 2,
            actualColumn: 1,
        });
        expect(movingSelections.length).toBeGreaterThan(0);

        (scene.onPointerUp$ as unknown as { emit: (evt: unknown, state?: unknown) => void }).emit({ offsetX: 360, offsetY: 90 });
        expect(contextService.getContextValue('MOBILE_EXPANDING_SELECTION')).toBe(false);

        service.dispose();
        testBed.univer.dispose();
    });

    it('creates mobile selections from tap and header gestures while respecting pinch zoom state', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, contextService, scene } = testBed;
        installPointerUpEvent(context.mainComponent);
        let clearSelectedObjectsCount = 0;
        Object.assign(scene, {
            getTransformer: () => ({
                clearSelectedObjects: () => clearSelectedObjectsCount++,
            }),
        });
        (skeleton as never as {
            getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
            getColumnCount: () => number;
            getRowCount: () => number;
            expandRangeByMerge: <T>(range: T) => T;
        }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
            const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
                actualRow: row,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
                mergeInfo: {
                    ...cell,
                    startRow: row,
                    endRow: row,
                    startColumn: column,
                    endColumn: column,
                },
            };
        };
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton,
        });

        const spreadsheet = context.mainComponent as never as {
            onPointerDown$: { emit: (evt: unknown, state: unknown) => void };
            onPointerUp$: { emit: (evt: unknown, state: unknown) => void };
        };
        let stopped = false;
        spreadsheet.onPointerDown$.emit({ offsetX: 150, offsetY: 45, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        spreadsheet.onPointerUp$.emit({ offsetX: 154, offsetY: 49, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(clearSelectedObjectsCount).toBe(1);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        });

        injector.get(SheetsSelectionsService).setSelections(sheet.getUnitId(), 'sheet1', [{
            range: {
                startRow: 2,
                endRow: 4,
                startColumn: 1,
                endColumn: 3,
            },
            primary: null,
            style: null,
        }], SelectionMoveType.MOVE_END);
        spreadsheet.onPointerDown$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        spreadsheet.onPointerUp$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 2,
            endColumn: 2,
        });
        expect(clearSelectedObjectsCount).toBe(2);

        contextService.setContextValue('MOBILE_PINCH_ZOOMING', true);
        spreadsheet.onPointerDown$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                throw new Error('pinch zoom should not start a tap selection');
            },
        });
        spreadsheet.onPointerUp$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                throw new Error('pinch zoom should not finish a tap selection');
            },
        });
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 2,
            endColumn: 2,
        });
        expect(clearSelectedObjectsCount).toBe(2);
        contextService.setContextValue('MOBILE_PINCH_ZOOMING', false);

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW)!;
        (rowHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 10,
            offsetY: 65,
            button: 0,
        }, {});
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 49,
        });
        expect(clearSelectedObjectsCount).toBe(3);

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN)!;
        (columnHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 350,
            offsetY: 5,
            button: 0,
        }, {});
        expect(service.getActiveRange()).toEqual({
            startRow: 0,
            endRow: 199,
            startColumn: 3,
            endColumn: 3,
        });
        expect(clearSelectedObjectsCount).toBe(4);

        service.dispose();
        testBed.univer.dispose();
    });
});

describe('Mobile Chart selection lifecycle with real providers', () => {
    it('starts without a cell runtime and restores Grid header selection', () => {
        const { render, activate, manager } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [MobileSheetsSelectionRenderService],
        ], true);
        const service = render.with(MobileSheetsSelectionRenderService);
        const event = { offsetX: 20, offsetY: 100, button: 0, buttons: 1 } as IPointerEvent;
        render.components.get(SHEET_VIEW_KEY.ROW)!.onPointerDown$.emitEvent(event);
        expect(service.getSelectionControls()).toHaveLength(0);
        activate('grid');
        expect(manager.getCurrentSkeleton()).toBeDefined();
        render.components.get(SHEET_VIEW_KEY.ROW)!.onPointerDown$.emitEvent(event);
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord.rangeType).toBe(RANGE_TYPE.ROW);
        activate('chart');
        expect(service.getSelectionControls()).toHaveLength(0);
        render.components.get(SHEET_VIEW_KEY.ROW)!.onPointerDown$.emitEvent(event);
        expect(service.getSelectionControls()).toHaveLength(0);
    });
});

describe('Mobile expansion shortcut lifecycle with real providers', () => {
    it.each(['pointer-up', 'chart', 'null', 'dispose', 'unrelated-dispose'])('restores shortcut dispatch and context after expansion ends through %s', async (ending) => {
        const { render, activate, injector, manager, workbook, commands } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [MobileSheetsSelectionRenderService],
            [MobileSheetsScrollRenderController],
        ]);
        commands.registerCommand(SetScrollRelativeCommand);
        commands.registerCommand(SetScrollOperation);
        const renderManager = injector.get(IRenderManagerService);
        const instances = injector.get(IUniverInstanceService);
        const createNextRender = () => {
            const nextWorkbook = instances.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
                id: 'next-mobile',
                sheetOrder: ['next-grid'],
                sheets: { 'next-grid': { id: 'next-grid', rowCount: 100, columnCount: 20 } },
            }, { skipAutoRender: true });
            const nextRender = renderManager.createRender(nextWorkbook.getUnitId());
            nextRender.engine.resizeBySize(800, 600);
            return nextRender;
        };
        const unrelatedRender = ending === 'unrelated-dispose' ? createNextRender() : null;
        instances.setCurrentUnitForType(workbook.getUnitId());
        const shortcuts = injector.get(IShortcutService);
        const registration = shortcuts.registerShortcut({ id: SetSelectionsOperation.id, binding: KeyCode.F9 });
        onTestFinished(() => registration.dispose());
        const keyboard = new KeyboardEvent('keydown', { key: 'F9', code: 'F9', keyCode: KeyCode.F9 });
        expect(shortcuts.dispatch(keyboard)?.id).toBe(SetSelectionsOperation.id);
        const service = render.with(MobileSheetsSelectionRenderService);
        const control = service.getActiveSelectionControl<MobileSelectionControl>()!;
        const event = { offsetX: 100, offsetY: 100, button: 0, buttons: 1 } as IPointerEvent;
        control.expandControlBottomRight!.onPointerDown$.emitEvent(event);
        expect(shortcuts.dispatch(keyboard)).toBeUndefined();
        if (unrelatedRender) {
            renderManager.removeRender(unrelatedRender.unitId);
            expect(injector.get(IContextService).getContextValue(MOBILE_EXPANDING_SELECTION)).toBe(true);
            expect(shortcuts.dispatch(keyboard)).toBeUndefined();
        }
        if (ending === 'chart') {
            activate('chart');
        } else if (ending === 'null') {
            manager.setCurrent({ sheetId: 'chart' });
        } else if (ending === 'dispose') {
            injector.get(IRenderManagerService).removeRender(workbook.getUnitId());
        } else {
            render.scene.onPointerUp$.emitEvent(event);
        }
        expect(injector.get(IContextService).getContextValue(MOBILE_EXPANDING_SELECTION)).toBe(false);
        expect(shortcuts.dispatch(keyboard)?.id).toBe(SetSelectionsOperation.id);
        const scrollingRender = ending === 'dispose' ? createNextRender() : render;
        if (ending === 'chart') {
            activate('grid');
        } else if (ending === 'null') {
            manager.setCurrent({ sheetId: 'grid' });
        }
        const viewport = scrollingRender.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;
        const before = viewport.viewportScrollY;
        const canvas = scrollingRender.engine.getCanvasElement();
        const start = new Event('touchstart', { cancelable: true });
        Object.defineProperty(start, 'touches', { value: [{ clientX: 400, clientY: 400 }] });
        canvas.dispatchEvent(start);
        expect(start.defaultPrevented).toBe(true);
        await vi.advanceTimersByTimeAsync(16);
        const move = new Event('touchmove', { cancelable: true });
        Object.defineProperty(move, 'touches', { value: [{ clientX: 400, clientY: 300 }] });
        canvas.dispatchEvent(move);
        await Promise.resolve();
        expect(viewport.viewportScrollY).toBeGreaterThan(before);
        expect(scrollingRender.with(SheetSkeletonManagerService).getCurrentSkeleton()).toBeDefined();
        const cancel = new Event('touchcancel');
        Object.defineProperty(cancel, 'touches', { value: [] });
        canvas.dispatchEvent(cancel);
    });
});

describe('Mobile expansion ownership across current Workbooks', () => {
    it('keeps B expansion and touch scrolling exclusive after an expanded A is removed', async () => {
        const { render, injector, workbook, commands } = createChartRenderTestBed([
            [SheetScrollManagerService],
            [MobileSheetsSelectionRenderService],
            [MobileSheetsScrollRenderController],
        ]);
        commands.registerCommand(SetScrollRelativeCommand);
        commands.registerCommand(SetScrollOperation);
        const instances = injector.get(IUniverInstanceService);
        const renders = injector.get(IRenderManagerService);
        const context = injector.get(IContextService);
        const shortcuts = injector.get(IShortcutService);
        const registration = shortcuts.registerShortcut({ id: SetSelectionsOperation.id, binding: KeyCode.F9 });
        onTestFinished(() => registration.dispose());
        const keyboard = new KeyboardEvent('keydown', { key: 'F9', code: 'F9', keyCode: KeyCode.F9 });
        const pointer = { offsetX: 100, offsetY: 100, button: 0, buttons: 1 } as IPointerEvent;
        const selectionA = render.with(MobileSheetsSelectionRenderService);
        instances.focusUnit(workbook.getUnitId());
        const controlA = selectionA.getActiveSelectionControl<MobileSelectionControl>()!;
        controlA.expandControlBottomRight!.onPointerDown$.emitEvent(pointer);
        const workbookB = instances.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'mobile-b',
            sheetOrder: ['grid-b'],
            sheets: { 'grid-b': { id: 'grid-b', rowCount: 100, columnCount: 20 } },
        }, { skipAutoRender: true });
        const renderB = renders.createRender(workbookB.getUnitId());
        renderB.engine.resizeBySize(800, 600);
        instances.focusUnit(workbookB.getUnitId());

        // Returning to A does not emit a new skeleton; its real Grid runtime must survive deactivation.
        instances.focusUnit(workbook.getUnitId());
        render.components.get(SHEET_VIEW_KEY.ROW)!.onPointerDown$.emitEvent(pointer);
        expect(selectionA.getSelectionDataWithStyle()[0].rangeWithCoord.rangeType).toBe(RANGE_TYPE.ROW);
        expect(render.with(SheetSkeletonManagerService).getCurrentSkeleton()).toBeDefined();
        const reactivatedControlA = selectionA.getActiveSelectionControl<MobileSelectionControl>()!;
        reactivatedControlA.expandControlBottomRight!.onPointerDown$.emitEvent(pointer);
        instances.focusUnit(workbookB.getUnitId());
        const selectionB = renderB.with(MobileSheetsSelectionRenderService);
        const controlB = selectionB.getActiveSelectionControl<MobileSelectionControl>()!;
        controlB.expandControlBottomRight!.onPointerDown$.emitEvent(pointer);
        renders.removeRender(workbook.getUnitId());
        expect(context.getContextValue(MOBILE_EXPANDING_SELECTION)).toBe(true);
        expect(shortcuts.dispatch(keyboard)).toBeUndefined();

        const viewport = renderB.scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;
        const canvas = renderB.engine.getCanvasElement();
        const gesture = async () => {
            const start = new Event('touchstart', { cancelable: true });
            Object.defineProperty(start, 'touches', { value: [{ clientX: 400, clientY: 400 }] });
            canvas.dispatchEvent(start);
            await vi.advanceTimersByTimeAsync(16);
            const move = new Event('touchmove', { cancelable: true });
            Object.defineProperty(move, 'touches', { value: [{ clientX: 400, clientY: 300 }] });
            canvas.dispatchEvent(move);
            await Promise.resolve();
            const cancel = new Event('touchcancel');
            Object.defineProperty(cancel, 'touches', { value: [] });
            canvas.dispatchEvent(cancel);
        };
        const before = viewport.viewportScrollY;
        await gesture();
        expect(viewport.viewportScrollY).toBe(before);
        renderB.scene.onPointerUp$.emitEvent(pointer);
        expect(context.getContextValue(MOBILE_EXPANDING_SELECTION)).toBe(false);
        expect(shortcuts.dispatch(keyboard)?.id).toBe(SetSelectionsOperation.id);
        await gesture();
        expect(viewport.viewportScrollY).toBeGreaterThan(before);
    });
});
