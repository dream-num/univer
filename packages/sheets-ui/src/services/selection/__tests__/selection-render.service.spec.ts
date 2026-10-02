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

import type { IRange, IWorkbookData, Workbook } from '@univerjs/core';
import type { IPointerEvent, IRenderContext, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    ICommandService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    Rectangle,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    SHEET_VIEWPORT_KEY,
    Spreadsheet,
    Vector2,
    Viewport,
} from '@univerjs/engine-render';
import {
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SHEET_COMPONENT_MAIN_LAYER_INDEX, SHEET_VIEW_KEY } from '../../../common/keys';
import { createRenderTestBed } from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { SheetSkeletonManagerService } from '../../sheet-skeleton-manager.service';
import { SheetSelectionRenderService } from '../selection-render.service';

class TestShortcutService {
    forceEscape() {
        return { dispose: () => { } };
    }
}

describe('SheetSelectionRenderService', () => {
    function preparePointerSelectionTestBed() {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
            ],
        });
        const { commandService, skeleton, context, scene, engine } = testBed;
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
        (scene as never as { getTransformer: () => { clearSelectedObjects: () => void } }).getTransformer = () => ({ clearSelectedObjects: () => { } });
        (engine as never as { setCapture: () => void }).setCapture = () => { };
        commandService.registerCommand(SetSelectionsOperation);

        const service = testBed.injector.createInstance(SheetSelectionRenderService, context as unknown as IRenderContext<Workbook>);
        testBed.sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: testBed.sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as unknown as SpreadsheetSkeleton,
        });

        return { ...testBed, service };
    }

    it('renders selections from model changes and respects SELECTIONS_ENABLED', async () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
            ],
        });

        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context } = testBed;
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        commandService.registerCommand(SetSelectionsOperation);

        const renderService = injector.createInstance(SheetSelectionRenderService, context as unknown as IRenderContext<Workbook>);

        // Simulate initial skeleton ready (as if the sheet got rendered).
        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as unknown as SpreadsheetSkeleton,
        });
        await Promise.resolve();

        // The skeleton change listener ensures there is at least one selection.
        expect(renderService.getSelectionControls().length).toBeGreaterThan(0);

        const unitId = sheet.getUnitId();
        const workbookSelections = injector.get(SheetsSelectionsService).getWorkbookSelections(unitId);
        expect(workbookSelections.getCurrentSelections().length).toBeGreaterThan(0);

        const range: IRange = {
            startRow: 1,
            endRow: 1,
            startColumn: 2,
            endColumn: 2,
            rangeType: RANGE_TYPE.NORMAL,
        };

        const selection: ISelectionWithStyle = {
            range,
            primary: {
                startRow: range.startRow,
                endRow: range.endRow + 1,
                startColumn: range.startColumn,
                endColumn: range.endColumn + 1,
                actualRow: range.startRow,
                actualColumn: range.startColumn,
                isMerged: false,
                isMergedMainCell: false,
            },
            style: null,
        };

        // Update selections like a real command (keyboard / API / mouse drag end).
        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection],
        })).toBeTruthy();

        expect(renderService.getSelectionControls().length).toBe(1);

        renderService.disableSelection();
        // When disabled, selection rendering should be cleared and should not create new selection controls.
        expect(renderService.getSelectionControls().length).toBe(0);

        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection, selection],
        })).toBeTruthy();
        expect(renderService.getSelectionControls().length).toBe(0);

        renderService.enableSelection();
        expect(commandService.syncExecuteCommand(SetSelectionsOperation.id, {
            unitId,
            subUnitId: 'sheet1',
            selections: [selection],
        })).toBeTruthy();
        expect(renderService.getSelectionControls().length).toBe(1);

        renderService.transparentSelection();
        expect(renderService.getSelectionControls()[0].currentStyle.stroke).toBe('transparent');

        renderService.showSelection();
        expect(renderService.getSelectionControls()[0].getRange()).toMatchObject(range);

        const leftTopPlaceholder = context.components.get(SHEET_VIEW_KEY.LEFT_TOP)!;
        let stopped = false;
        (leftTopPlaceholder.onPointerDown$ as unknown as { emit: (evt: unknown, state: { stopPropagation: () => void }) => void }).emit({ button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(renderService.getActiveRange()).toMatchObject({
            startRow: 0,
            startColumn: 0,
            endRow: 199,
            endColumn: 49,
        });

        renderService.dispose();
        testBed.univer.dispose();
    });

    it('creates normal row and column selections from pointer gestures', () => {
        const { context, scene, service, univer } = preparePointerSelectionTestBed();
        const stopCalls: string[] = [];
        const state = { stopPropagation: () => stopCalls.push('stop') };

        const spreadsheet = context.mainComponent!;
        (spreadsheet.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 250,
            offsetY: 45,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 2,
            endColumn: 2,
        });

        (scene.onPointerUp$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({}, {});

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW)!;
        (rowHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 10,
            offsetY: 65,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 49,
        });

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN)!;
        (columnHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 350,
            offsetY: 5,
            button: 0,
        }, state);
        expect(service.getActiveRange()).toEqual({
            startRow: 0,
            endRow: 199,
            startColumn: 3,
            endColumn: 3,
        });
        expect(stopCalls.length).toBeGreaterThanOrEqual(3);

        service.dispose();
        univer.dispose();
    });
});

describe('SheetSelectionRenderService pointer gestures with real render providers', () => {
    let univer: Univer;

    beforeEach(() => {
        vi.useFakeTimers();
        // Happy DOM lacks a canvas backend; selection, render, and shortcut services remain real.
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.get(LocaleService).setLocale(LocaleType.EN_US);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([SheetSkeletonService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
        injector.add([IShortcutService, { useClass: ShortcutService }]);
        injector.get(SheetSkeletonService);
        injector.get(SheetInterceptorService);
        injector.get(ICommandService).registerCommand(SetSelectionsOperation);
        injector.get(IRenderManagerService).registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
    });

    afterEach(() => {
        vi.clearAllTimers();
        univer.dispose();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function createSelectionTestBed(mergeData: IRange[] = [], rowCount = 20) {
        const injector = univer.__getInjector();
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'pointer-modifiers',
            name: 'Pointer modifiers',
            sheetOrder: ['sheet1'],
            sheets: { sheet1: { id: 'sheet1', name: 'Sheet 1', rowCount, columnCount: 10, cellData: {}, mergeData } },
        });
        const renderManager = injector.get(IRenderManagerService);
        const render = renderManager.createRender(workbook.getUnitId());
        render.engine.resizeBySize(800, 600);
        injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, right: 0, bottom: 0 });
        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN);
        render.mainComponent = spreadsheet;
        render.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        render.scene.addObject(spreadsheet);
        const skeletonManager = render.with(SheetSkeletonManagerService);
        skeletonManager.setCurrent({ sheetId: 'sheet1' });
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSelectionRenderService]);
        const service = render.with(SheetSelectionRenderService);
        const skeleton = skeletonManager.getCurrentSkeleton()!;
        const selectionsService = injector.get(SheetsSelectionsService);
        const getSelections = () => selectionsService.getWorkbookSelections(workbook.getUnitId()).getCurrentSelections();
        const eventAt = (row: number, column: number, modifiers: Partial<IPointerEvent> = {}) => {
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                offsetX: (cell.startX + cell.endX) / 2,
                offsetY: (cell.startY + cell.endY) / 2,
                button: 0,
                buttons: 1,
                ...modifiers,
            } as IPointerEvent;
        };
        const click = (row: number, column: number, modifiers: Partial<IPointerEvent> = {}) => {
            const event = eventAt(row, column, modifiers);
            spreadsheet.onPointerDown$.emitEvent(event);
            render.scene.onPointerUp$.emitEvent(event);
        };
        return { injector, workbook, render, spreadsheet, service, skeleton, getSelections, eventAt, click };
    }

    it.each([20, 1_000_000])('animates clicks without delaying selection or invalidating sheet content with %i rows', (rowCount) => {
        const { click, service, skeleton, render, getSelections } = createSelectionTestBed([], rowCount);
        click(1, 1);
        vi.advanceTimersByTime(160);
        const control = service.getActiveSelectionControl()!;
        const from = control.getRange();

        click(5, 4);
        const target = control.getRange();
        expect(service.getActiveSelectionControl()).toBe(control);
        expect(getSelections()[0].range).toMatchObject({ startRow: 5, endRow: 5, startColumn: 4, endColumn: 4 });

        const mainLayer = render.scene.getLayer(SHEET_COMPONENT_MAIN_LAYER_INDEX);
        mainLayer.makeDirty(false);
        const calculate = vi.spyOn(skeleton, 'calculate');
        const getCell = vi.spyOn(skeleton, 'getCellWithMergeInfoByIndex');
        vi.advanceTimersByTime(48);
        expect(control.selectionShape.left).toBeGreaterThan(from.startX);
        expect(control.selectionShape.left).toBeLessThan(target.startX);
        expect(control.selectionShape.top).toBeGreaterThan(from.startY);
        expect(control.selectionShape.top).toBeLessThan(target.startY);
        const borderPosition = () => new Vector2(control.selectionShape.left + control.leftControl.left, control.selectionShape.top + 10);
        expect(render.scene.pick(borderPosition())).not.toBe(control.leftControl);
        expect(control.getRange()).toEqual(target);
        vi.advanceTimersByTime(160);
        expect(control.selectionShape.left).toBe(target.startX);
        expect(control.selectionShape.top).toBe(target.startY);
        expect(render.scene.pick(borderPosition())).toBe(control.leftControl);
        expect(mainLayer.isDirty()).toBe(false);
        expect(calculate).not.toHaveBeenCalled();
        expect(getCell).not.toHaveBeenCalled();

        const translate = vi.spyOn(control.selectionShape, 'translate');
        vi.advanceTimersByTime(300);
        expect(translate).not.toHaveBeenCalled();
    });

    it('retargets from the visible position and cancels motion when dragging or disposing', () => {
        const { click, service, eventAt, spreadsheet, render } = createSelectionTestBed();
        click(1, 1);
        vi.advanceTimersByTime(160);
        click(5, 4);
        vi.advanceTimersByTime(32);
        const control = service.getActiveSelectionControl()!;
        const visibleLeft = control.selectionShape.left;
        click(8, 6);
        expect(control.selectionShape.left).toBe(visibleLeft);
        vi.advanceTimersByTime(160);
        expect(control.selectionShape.left).toBe(control.getRange().startX);

        spreadsheet.onPointerDown$.emitEvent(eventAt(2, 2));
        render.scene.onPointerMove$.emitEvent(eventAt(4, 3));
        render.scene.onPointerUp$.emitEvent(eventAt(4, 3));
        const dragged = control.getRange();
        vi.advanceTimersByTime(160);
        expect(control.selectionShape.left).toBe(dragged.startX);
        expect(control.selectionShape.top).toBe(dragged.startY);
        expect(dragged).toMatchObject({ startRow: 2, endRow: 4, startColumn: 2, endColumn: 3 });

        click(1, 1);
        click(5, 4);
        const disposedControl = service.getActiveSelectionControl()!;
        const translate = vi.spyOn(disposedControl.selectionShape, 'translate');
        service.disableSelection();
        vi.advanceTimersByTime(160);
        expect(translate).not.toHaveBeenCalled();
        expect(service.getSelectionControls()).toHaveLength(0);
    });

    it('resizes merged cell outlines at constant stroke width and respects reduced motion', () => {
        const { click, service } = createSelectionTestBed([{ startRow: 3, endRow: 4, startColumn: 3, endColumn: 5 }]);
        click(1, 1);
        vi.advanceTimersByTime(160);
        const control = service.getActiveSelectionControl()!;
        const width = control.topControl.width;
        const stroke = control.leftControl.width;
        click(3, 3);
        vi.advanceTimersByTime(48);
        const target = control.getRange();
        expect(control.topControl.width).toBeGreaterThan(width);
        expect(control.topControl.width).toBeLessThan(target.endX - target.startX + stroke);
        expect(control.leftControl.width).toBe(stroke);
        vi.advanceTimersByTime(160);
        expect(control.topControl.width).toBe(target.endX - target.startX + stroke);

        vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
        click(7, 2);
        expect(control.selectionShape.left).toBe(control.getRange().startX);
        expect(control.selectionShape.top).toBe(control.getRange().startY);
        const translate = vi.spyOn(control.selectionShape, 'translate');
        vi.advanceTimersByTime(160);
        expect(translate).not.toHaveBeenCalled();
    });

    it('settles immediately across frozen panes, on zoom, and when switching worksheets', () => {
        const { click, service, workbook, render } = createSelectionTestBed();
        workbook.getActiveSheet().getSnapshot().freeze = { startRow: 2, startColumn: 0, xSplit: 0, ySplit: 2 };
        click(1, 1);
        vi.advanceTimersByTime(160);
        click(4, 4);
        const control = service.getActiveSelectionControl()!;
        expect(control.selectionShape.left).toBe(control.getRange().startX);
        expect(control.selectionShape.top).toBe(control.getRange().startY);

        click(6, 5);
        render.scene.scale(1.5, 1.5);
        vi.advanceTimersByTime(160);
        expect(control.selectionShape.left).toBe(control.getRange().startX);
        expect(control.selectionShape.top).toBe(control.getRange().startY);

        render.scene.scale(1, 1);
        click(4, 2);
        const translate = vi.spyOn(control.selectionShape, 'translate');
        workbook.addWorksheet('sheet2', 1, { id: 'sheet2', name: 'Sheet 2', rowCount: 20, columnCount: 10 });
        workbook.setActiveSheet(workbook.getSheetBySheetId('sheet2')!);
        render.with(SheetSkeletonManagerService).setCurrent({ sheetId: 'sheet2' });
        vi.advanceTimersByTime(160);
        const nextControl = service.getActiveSelectionControl()!;
        expect(translate).not.toHaveBeenCalled();
        expect(nextControl).not.toBe(control);
        expect(nextControl.selectionShape.left).toBe(nextControl.getRange().startX);
        expect(nextControl.selectionShape.top).toBe(nextControl.getRange().startY);
    });

    for (const single of [false, true]) {
        for (const modifier of ['none', 'ctrlKey', 'metaKey', 'shiftKey'] as const) {
            it(`preserves the intended pointer range with ${modifier} and single selection ${single}`, () => {
                const { injector, workbook, render, spreadsheet, service, skeleton } = createSelectionTestBed();
                service.setSingleSelectionEnabled(single);

                for (const index of [0, 2]) {
                    const cell = skeleton.getNoMergeCellWithCoordByIndex(index, index);
                    const event = {
                        offsetX: (cell.startX + cell.endX) / 2,
                        offsetY: (cell.startY + cell.endY) / 2,
                        button: 0,
                        ...(index === 2 && modifier !== 'none' ? { [modifier]: true } : {}),
                    } as IPointerEvent;
                    spreadsheet.onPointerDown$.emitEvent(event);
                    render.scene.onPointerUp$.emitEvent(event);
                }

                const selections = injector.get(SheetsSelectionsService)
                    .getWorkbookSelections(workbook.getUnitId())
                    .getCurrentSelections();
                const ranges = selections.map(({ range }) => ({
                    startRow: range.startRow,
                    startColumn: range.startColumn,
                    endRow: range.endRow,
                    endColumn: range.endColumn,
                }));
                if (modifier === 'shiftKey') {
                    expect(ranges).toEqual([{ startRow: 0, startColumn: 0, endRow: 2, endColumn: 2 }]);
                } else if (!single && modifier !== 'none') {
                    expect(ranges).toEqual([
                        { startRow: 0, startColumn: 0, endRow: 0, endColumn: 0 },
                        { startRow: 2, startColumn: 2, endRow: 2, endColumn: 2 },
                    ]);
                } else {
                    expect(ranges).toEqual([{ startRow: 2, startColumn: 2, endRow: 2, endColumn: 2 }]);
                }
                expect(service.getSelectionControls()).toHaveLength(ranges.length);
            });
        }
    }

    it.each(['ctrlKey', 'metaKey'] as const)('toggles a cell inside a range with %s without accumulating selections', (modifier) => {
        const { click, getSelections, service } = createSelectionTestBed();
        click(0, 0);
        click(2, 2, { shiftKey: true });
        const clickedCell = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };

        for (const selected of [false, true, false, true, false]) {
            click(1, 1, { [modifier]: true });
            const ranges = getSelections().map(({ range }) => range);
            expect(ranges.filter((range) => Rectangle.contains(range, clickedCell))).toHaveLength(selected ? 1 : 0);
            const selectedCellCount = ranges.reduce((count, range) =>
                count + (range.endRow - range.startRow + 1) * (range.endColumn - range.startColumn + 1), 0);
            expect(selectedCellCount).toBe(selected ? 9 : 8);
            expect(service.getSelectionControls()).toHaveLength(ranges.length);
            const lastSelection = getSelections().at(-1)!;
            expect(Rectangle.contains(lastSelection.range, lastSelection.primary!)).toBe(true);
        }
    });

    it('removes a clicked cell from every overlapping selection but preserves additive dragging', () => {
        const { click, getSelections, eventAt, spreadsheet, render } = createSelectionTestBed();
        click(0, 0);
        click(2, 2, { shiftKey: true });
        spreadsheet.onPointerDown$.emitEvent(eventAt(3, 3, { metaKey: true }));
        render.scene.onPointerMove$.emitEvent(eventAt(1, 1, { metaKey: true }));
        render.scene.onPointerUp$.emitEvent(eventAt(1, 1, { metaKey: true }));
        const clickedCell = { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 };
        expect(getSelections().filter(({ range }) => Rectangle.contains(range, clickedCell))).toHaveLength(2);

        click(1, 1, { metaKey: true });
        expect(getSelections().some(({ range }) => Rectangle.contains(range, clickedCell))).toBe(false);
        expect(getSelections().some(({ range }) => Rectangle.contains(range, {
            startRow: 3,
            endRow: 3,
            startColumn: 3,
            endColumn: 3,
        }))).toBe(true);
    });

    it('deselects an entire merged cell and retains the final active cell', () => {
        const merged = { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 };
        const { click, getSelections } = createSelectionTestBed([merged]);
        click(0, 0);
        click(3, 3, { shiftKey: true });
        click(2, 2, { metaKey: true });
        expect(getSelections().some(({ range }) => Rectangle.intersects(range, merged))).toBe(false);

        click(2, 2);
        for (let index = 0; index < 3; index++) {
            click(2, 2, { metaKey: true });
            expect(getSelections()).toHaveLength(1);
            expect(getSelections()[0].range).toMatchObject(merged);
            expect(getSelections()[0].primary).toMatchObject(merged);
        }
    });

    it('preserves right click, shift extension, and single-selection mode inside a selected range', () => {
        const { click, getSelections, service } = createSelectionTestBed();
        click(0, 0);
        click(2, 2, { shiftKey: true });
        click(1, 1, { metaKey: true, button: 2 });
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 });

        click(1, 1, { metaKey: true, shiftKey: true });
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 });

        service.setSingleSelectionEnabled(true);
        click(1, 1, { metaKey: true });
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 });
    });

    it('keeps dragging additive even when it starts inside a selection', () => {
        const { click, getSelections, eventAt, spreadsheet, render } = createSelectionTestBed();
        click(0, 0);
        click(2, 2, { shiftKey: true });
        spreadsheet.onPointerDown$.emitEvent(eventAt(1, 1, { ctrlKey: true }));
        render.scene.onPointerMove$.emitEvent(eventAt(3, 3, { ctrlKey: true }));
        render.scene.onPointerUp$.emitEvent(eventAt(3, 3, { ctrlKey: true }));
        expect(getSelections().map(({ range }) => range)).toMatchObject([
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 },
            { startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 },
        ]);
    });

    it('finishes deselection when a released pointer returns without a pointer-up event', () => {
        const { click, getSelections, eventAt, spreadsheet, render } = createSelectionTestBed();
        click(0, 0);
        click(2, 2, { shiftKey: true });
        spreadsheet.onPointerDown$.emitEvent(eventAt(0, 0, { ctrlKey: true }));
        render.scene.onPointerMove$.emitEvent(eventAt(0, 0, { buttons: 0 }));
        expect(getSelections().some(({ range }) => Rectangle.contains(range, {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        }))).toBe(false);
    });
});
