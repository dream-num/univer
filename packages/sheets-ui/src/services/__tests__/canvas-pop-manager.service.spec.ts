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

import type { ICommandInfo, IRange } from '@univerjs/core';
import type { IPopup } from '@univerjs/ui';
import { ICommandService, Injector, IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService, RENDER_CLASS_TYPE } from '@univerjs/engine-render';
import {
    IRefSelectionsService,
    RefRangeService,
    SetFrozenMutation,
    SetWorksheetRowAutoHeightMutation,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { SheetCanvasPopManagerService } from '../canvas-pop-manager.service';
import { ISheetSelectionRenderService } from '../selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

function createEventSubject<T>() {
    const listeners = new Set<(event: T) => void>();
    return {
        subscribeEvent(listener: (event: T) => void) {
            listeners.add(listener);
            return {
                dispose: () => listeners.delete(listener),
                unsubscribe: () => listeners.delete(listener),
            };
        },
        emit(event: T) {
            for (const listener of listeners) {
                listener(event);
            }
        },
    };
}

class TestCanvasPopupService {
    activePopupId = '';
    readonly popups = new Map<string, IPopup>();
    readonly removedIds: string[] = [];
    private _nextId = 1;

    addPopup(popup: IPopup) {
        const id = `popup-${this._nextId}`;
        this._nextId++;
        this.activePopupId = id;
        this.popups.set(id, popup);
        return id;
    }

    removePopup(id: string) {
        this.removedIds.push(id);
        this.popups.delete(id);
        if (this.activePopupId === id) {
            this.activePopupId = '';
        }
    }

    lastPopup() {
        const values = Array.from(this.popups.values());
        return values[values.length - 1];
    }
}

class TestCommandService {
    private readonly _listeners: Array<(info: ICommandInfo) => void> = [];

    onCommandExecuted(listener: (info: ICommandInfo) => void) {
        this._listeners.push(listener);
        return {
            dispose: () => {
                const index = this._listeners.indexOf(listener);
                if (index > -1) {
                    this._listeners.splice(index, 1);
                }
            },
        };
    }

    emit(id: string, params?: ICommandInfo['params']) {
        for (const listener of this._listeners) {
            listener({ id, params });
        }
    }
}

class TestUniverInstanceService {
    workbook: any;
    embeddedUnitIds = new Set<string>();

    getCurrentUnitOfType() {
        return this.workbook;
    }

    getUnit(unitId: string) {
        return this.workbook?.getUnitId() === unitId ? this.workbook : null;
    }

    getUnitCreateOptions(unitId: string) {
        return this.embeddedUnitIds.has(unitId) ? { embeddedRender: true } : undefined;
    }
}

class TestRenderManagerService {
    render: any;

    getRenderById() {
        return this.render;
    }
}

class TestRefRangeService {
    readonly watchedRanges: Array<{
        unitId: string;
        subUnitId: string;
        range: IRange;
        callback: (before: IRange, after: IRange | null) => void;
        disposed: boolean;
    }> = [];

    watchRange(unitId: string, subUnitId: string, range: IRange, callback: (before: IRange, after: IRange | null) => void) {
        const record = { unitId, subUnitId, range, callback, disposed: false };
        this.watchedRanges.push(record);
        return {
            dispose: () => {
                record.disposed = true;
            },
        };
    }
}

class TestSelectionMovingService {
    readonly selectionMoving$ = new Subject<void>();
    readonly selectionMoveEnd$ = new Subject<void>();
}

function createWorkbook(worksheet: any) {
    return {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
        getSheetBySheetId: (sheetId: string) => sheetId === worksheet.getSheetId() ? worksheet : null,
    };
}

function createSheetHarness() {
    const injector = new Injector();
    injector.add([ICanvasPopupService, { useClass: TestCanvasPopupService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([RefRangeService, { useClass: TestRefRangeService as never }]);
    injector.add([ICommandService, { useClass: TestCommandService as never }]);
    injector.add([IRefSelectionsService, { useClass: TestSelectionMovingService as never }]);
    injector.add([SheetsSelectionsService, { useClass: TestSelectionMovingService as never }]);
    injector.add([SheetCanvasPopManagerService]);

    const canvas = document.createElement('canvas');
    canvas.style.width = '100px';
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        top: 20,
        left: 10,
        width: 200,
        height: 120,
        right: 210,
        bottom: 140,
        x: 10,
        y: 20,
        toJSON: () => ({}),
    } as DOMRect);

    const transformChange$ = createEventSubject<unknown>();
    const clientRect$ = new BehaviorSubject({});
    const worksheet = {
        getSheetId: () => 'sheet-1',
        getFreeze: () => ({ startRow: 1, startColumn: 1, xSplit: 0, ySplit: 0 }),
    };
    const workbook = createWorkbook(worksheet);
    const skeleton = {
        rowHeightAccumulation: [20, 40, 60],
        columnWidthAccumulation: [30, 60, 90],
        rowHeaderWidth: 20,
        columnHeaderHeight: 20,
        getNoMergeCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * 30,
            endX: col * 30 + 30,
            startY: row * 20,
            endY: row * 20 + 20,
        }),
        getCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * 30,
            endX: col * 30 + 30,
            startY: row * 20,
            endY: row * 20 + 20,
            isMergedMainCell: false,
            mergeInfo: {
                startX: col * 30,
                endX: col * 30 + 30,
                startY: row * 20,
                endY: row * 20 + 20,
            },
        }),
    };
    const sheetSelectionRenderService = { selectionMoving: false };
    const render = {
        getInjector: vi.fn(() => injector),
        scene: {
            getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
            getViewport: () => ({
                left: 0,
                top: 0,
                viewportScrollX: 0,
                viewportScrollY: 0,
            }),
        },
        engine: {
            clientRect$,
            onTransformChange$: transformChange$,
            getCanvasElement: () => canvas,
        },
        with(token: unknown) {
            if (token === SheetSkeletonManagerService) {
                return {
                    ensureSkeleton: () => skeleton,
                    getOrCreateSkeleton: () => skeleton,
                    getSkeletonParam: () => ({ skeleton }),
                };
            }
            if (token === ISheetSelectionRenderService) {
                return sheetSelectionRenderService;
            }
            throw new Error(`Unexpected render dependency: ${String(token)}`);
        },
    };

    const univerInstanceService = injector.get(IUniverInstanceService) as unknown as TestUniverInstanceService;
    const renderManagerService = injector.get(IRenderManagerService) as unknown as TestRenderManagerService;
    univerInstanceService.workbook = workbook;
    renderManagerService.render = render;

    return {
        service: injector.get(SheetCanvasPopManagerService),
        popupService: injector.get(ICanvasPopupService) as unknown as TestCanvasPopupService,
        commandService: injector.get(ICommandService) as unknown as TestCommandService,
        refRangeService: injector.get(RefRangeService) as unknown as TestRefRangeService,
        refSelectionService: injector.get(IRefSelectionsService) as unknown as TestSelectionMovingService,
        sheetSelectionService: injector.get(SheetsSelectionsService) as unknown as TestSelectionMovingService,
        univerInstanceService,
        renderManagerService,
        workbook,
        worksheet,
        skeleton,
        render,
        canvas,
        clientRect$,
        transformChange$,
        sheetSelectionRenderService,
        viewport: { viewportScrollX: 0, viewportScrollY: 0 },
    };
}

describe('SheetCanvasPopManagerService', () => {
    it('resolves registered feature menus for the drawing that opened the menu', () => {
        const { service } = createSheetHarness();
        const callback = vi.fn((unitId: string, subUnitId: string, drawingId: string, drawingType: unknown) => [{
            label: `${unitId}/${subUnitId}/${drawingId}/${drawingType}`,
            index: 0,
            commandId: 'open',
            commandParams: { drawingId },
            disable: false,
        }]);

        service.registerFeatureMenu('image' as never, callback);

        expect(service.getFeatureMenu('unit-1', 'sheet-1', 'drawing-1', 'image' as never)).toEqual([
            { label: 'unit-1/sheet-1/drawing-1/image', index: 0, commandId: 'open', commandParams: { drawingId: 'drawing-1' }, disable: false },
        ]);
        expect(service.getFeatureMenu('unit-1', 'sheet-1', 'drawing-1', 'chart' as never)).toBeUndefined();

        service.dispose();
        expect(service.getFeatureMenu('unit-1', 'sheet-1', 'drawing-1', 'image' as never)).toBeUndefined();
    });

    it('anchors a drawing popup with the registered menu offset and removes it when closed', () => {
        const { service, popupService, canvas } = createSheetHarness();
        const targetObject = {
            left: 20,
            top: 10,
            width: 40,
            height: 30,
            classType: RENDER_CLASS_TYPE.SHAPE,
            getPropByKey: () => 'image',
        };

        service.registerFeatureMenuOffset('image' as never, 12, 8);
        const disposable = service.attachPopupToObject(targetObject as never, { componentKey: 'drawing-toolbar' } as never);

        expect(popupService.lastPopup()).toMatchObject({
            componentKey: 'drawing-toolbar',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            canvasElement: canvas,
            anchorRect: { left: 50, right: 154, top: 56, bottom: 100 },
        });
        expect(disposable.canDispose()).toBe(false);

        disposable.dispose();
        expect(popupService.removedIds).toEqual(['popup-1']);
        expect(popupService.popups.size).toBe(0);
    });

    it('keeps absolute-position popups hidden while a selection is being dragged unless the popup opts in', () => {
        const { service, popupService, refSelectionService, sheetSelectionService } = createSheetHarness();
        const bound = { top: 10, left: 20, right: 30, bottom: 40 };

        refSelectionService.selectionMoving$.next();
        expect(service.attachPopupToAbsolutePosition(bound, { componentKey: 'tooltip' } as never, 'unit-1', 'sheet-1')).toBeUndefined();
        refSelectionService.selectionMoveEnd$.next();

        sheetSelectionService.selectionMoving$.next();
        expect(service.attachPopupToAbsolutePosition(bound, { componentKey: 'sheet-tooltip' } as never, 'unit-1', 'sheet-1')).toBeUndefined();
        sheetSelectionService.selectionMoveEnd$.next();

        const disposable = service.attachPopupToAbsolutePosition(
            bound,
            { componentKey: 'drag-tooltip', showOnSelectionMoving: true } as never,
            'unit-1',
            'sheet-1'
        );

        expect(popupService.lastPopup()).toMatchObject({
            componentKey: 'drag-tooltip',
            anchorRect: bound,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        });
        expect(disposable?.canDispose()).toBe(false);

        disposable?.dispose();
        expect(popupService.removedIds).toEqual(['popup-1']);
    });

    it('keeps dynamic absolute-position popups subscribed to caller-provided anchors', () => {
        const { service, popupService } = createSheetHarness();
        const bound = { top: 10, left: 20, right: 30, bottom: 40 };
        const anchorRect$ = new BehaviorSubject(bound);

        const disposable = service.attachPopupToDynamicAbsolutePosition(
            bound,
            anchorRect$,
            { componentKey: 'dynamic-tooltip' } as never,
            'unit-1',
            'sheet-1'
        );
        const popup = popupService.lastPopup()!;
        const positions: unknown[] = [];
        popup.anchorRect$.subscribe((position) => positions.push(position));

        anchorRect$.next({ top: 12, left: 24, right: 34, bottom: 46 });

        expect(popup).toMatchObject({
            componentKey: 'dynamic-tooltip',
            anchorRect: bound,
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
        });
        expect(positions).toContainEqual({ top: 12, left: 24, right: 34, bottom: 46 });

        disposable?.dispose();
        expect(popupService.removedIds).toEqual(['popup-1']);
    });

    it('uses a scoped popup injector only for embedded sheet render units', () => {
        const { service, popupService, render, univerInstanceService } = createSheetHarness();
        const bound = { top: 10, left: 20, right: 30, bottom: 40 };

        service.attachPopupToAbsolutePosition(bound, { componentKey: 'normal-popup' } as never, 'unit-1', 'sheet-1');
        expect(popupService.lastPopup()?.connectorInjector).toBeUndefined();
        expect(render.getInjector).not.toHaveBeenCalled();

        univerInstanceService.embeddedUnitIds.add('unit-1');
        service.attachPopupToAbsolutePosition(bound, { componentKey: 'embed-popup' } as never, 'unit-1', 'sheet-1');
        expect(popupService.lastPopup()?.connectorInjector).toBeDefined();
        expect(render.getInjector).toHaveBeenCalledTimes(1);
    });

    it('anchors a popup to a sheet position and refreshes its hidden freeze area on viewport changes', () => {
        const { service, popupService, commandService, transformChange$ } = createSheetHarness();

        const disposable = service.attachPopupByPosition(
            { left: 20, top: 10, right: 30, bottom: 40 },
            { componentKey: 'position-menu' } as never,
            { unitId: 'unit-1', subUnitId: 'sheet-1', row: 1, col: 1 }
        );
        const popup = popupService.lastPopup()!;
        const hiddenRects: unknown[] = [];
        popup.hiddenRects$!.subscribe((rects) => hiddenRects.push(rects));

        expect(popup).toMatchObject({
            componentKey: 'position-menu',
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            anchorRect: { left: 50, right: 70, top: 40, bottom: 100 },
        });

        commandService.emit(SetFrozenMutation.id);
        transformChange$.emit({});
        expect(hiddenRects[hiddenRects.length - 1]).toEqual([
            { left: -Infinity, top: -Infinity, right: 50, bottom: 20 },
            { left: 50, top: -Infinity, right: Infinity, bottom: 20 },
            { left: -Infinity, top: 20, right: 50, bottom: Infinity },
        ]);

        disposable?.dispose();
        expect(popupService.removedIds).toEqual(['popup-1']);
    });

    it('moves a cell popup when its watched range is remapped and removes it when the cell disappears', () => {
        const { service, popupService, refRangeService, viewport } = createSheetHarness();

        const disposable = service.attachPopupToCell(1, 1, { componentKey: 'cell-action' } as never, 'unit-1', 'sheet-1', viewport as never);
        const popup = popupService.lastPopup()!;
        const positions: unknown[] = [];
        popup.anchorRect$!.subscribe((position) => positions.push(position));

        expect(popup.anchorRect).toEqual({ left: 70, right: 130, top: 60, bottom: 100 });
        expect(refRangeService.watchedRanges[0]).toMatchObject({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
        });

        refRangeService.watchedRanges[0].callback(
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 }
        );
        expect(positions[positions.length - 1]).toEqual({ left: 130, right: 190, top: 100, bottom: 140 });

        refRangeService.watchedRanges[0].callback(
            { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 },
            null
        );
        expect(popupService.removedIds).toEqual(['popup-1']);
        expect(refRangeService.watchedRanges[0].disposed).toBe(true);
        expect(disposable?.canDispose()).toBe(true);
    });

    it('disposes tracked cell popups when the manager is disposed', () => {
        const { service, popupService, refRangeService, viewport } = createSheetHarness();

        service.attachPopupToCell(1, 1, { componentKey: 'cell-action' } as never, 'unit-1', 'sheet-1', viewport as never);

        expect(popupService.popups.size).toBe(1);
        service.dispose();

        expect(popupService.removedIds).toEqual(['popup-1']);
        expect(popupService.popups.size).toBe(0);
        expect(refRangeService.watchedRanges[0].disposed).toBe(true);
    });

    it('updates cell and range anchors when sheet geometry changes', () => {
        const { service, popupService, commandService, clientRect$, transformChange$, refRangeService, viewport } = createSheetHarness();

        service.attachPopupToCell(1, 1, { componentKey: 'cell-action' } as never, 'unit-1', 'sheet-1', viewport as never);
        const cellPopup = popupService.lastPopup()!;
        const cellPositions: unknown[] = [];
        cellPopup.anchorRect$!.subscribe((position) => cellPositions.push(position));

        clientRect$.next({ width: 300 });
        commandService.emit(SetWorksheetRowAutoHeightMutation.id, { rowsAutoHeightInfo: [{ row: 1 }] });
        transformChange$.emit({});
        expect(cellPositions).toContainEqual({ left: 70, right: 130, top: 60, bottom: 100 });

        service.attachRangePopup(
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            { componentKey: 'range-toolbar' } as never,
            'unit-1',
            'sheet-1',
            viewport as never
        );
        const rangePopup = popupService.lastPopup()!;
        const rangePositions: unknown[] = [];
        rangePopup.anchorRect$!.subscribe((position) => rangePositions.push(position));

        commandService.emit(SetScrollOperation.id);
        commandService.emit(SetFrozenMutation.id);
        expect(rangePositions[rangePositions.length - 1]).toEqual({ left: 10, right: 130, top: 20, bottom: 100 });

        const rangeWatch = refRangeService.watchedRanges[1];
        rangeWatch.callback(
            { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 }
        );
        expect(rangePositions[rangePositions.length - 1]).toEqual({ left: 70, right: 190, top: 60, bottom: 140 });

        rangeWatch.callback(
            { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
            null
        );
        expect(popupService.removedIds).toContain('popup-2');
    });

    it('does not open popups for a different sheet location or unavailable workbook data', () => {
        const { service, popupService, univerInstanceService, renderManagerService } = createSheetHarness();
        const bound = { top: 10, left: 20, right: 30, bottom: 40 };

        expect(service.attachPopupByPosition(bound, { componentKey: 'mismatch' } as never, {
            unitId: 'unit-2',
            subUnitId: 'sheet-1',
            row: 0,
            col: 0,
        })).toBeNull();

        expect(service.attachPopupToAbsolutePosition(bound, { componentKey: 'mismatch' } as never, 'unit-2', 'sheet-1')).toBeNull();

        univerInstanceService.workbook = null;
        expect(service.attachPopupToCell(0, 0, { componentKey: 'missing-workbook' } as never, 'unit-1', 'sheet-1')).toBeNull();

        univerInstanceService.workbook = createWorkbook({ getSheetId: () => 'sheet-2', getFreeze: () => ({ startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 }) });
        expect(service.attachPopupToCell(0, 0, { componentKey: 'missing-sheet' } as never, 'unit-1', 'sheet-1')).toBeNull();

        univerInstanceService.workbook = createWorkbook({ getSheetId: () => 'sheet-1', getFreeze: () => ({ startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 }) });
        renderManagerService.render = null;
        expect(service.attachPopupToCell(0, 0, { componentKey: 'missing-render' } as never, 'unit-1', 'sheet-1')).toBeNull();

        expect(popupService.popups.size).toBe(0);
    });
});
