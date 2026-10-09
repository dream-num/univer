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
    ICommandService,
    IContextService,
    LocaleService,
    LocaleType,
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
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Viewport,
} from '@univerjs/engine-render';
import {
    REF_SELECTIONS_ENABLED,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import {
    ContextMenuPosition,
    ContextMenuService,
    IContextMenuService,
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import {
    SheetContextMenuRenderController,
    shouldHideSheetHostContextMenuForEmbedSession,
    shouldSuppressSheetContextMenuForEmbedOverride,
} from '../contextmenu.render-controller';

describe('SheetContextMenuRenderController pointer gestures', () => {
    let univer: Univer;

    beforeEach(() => {
        vi.useFakeTimers();
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
        injector.add([IContextMenuService, { useClass: ContextMenuService }]);
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

    function createContextMenuTestBed(isMac: boolean) {
        const injector = univer.__getInjector();
        vi.spyOn(injector.get(IPlatformService), 'isMac', 'get').mockReturnValue(isMac);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'context-menu-gestures',
            name: 'Context menu gestures',
            sheetOrder: ['sheet1'],
            sheets: { sheet1: { id: 'sheet1', name: 'Sheet 1', rowCount: 20, columnCount: 10, cellData: {} } },
        });
        const renderManager = injector.get(IRenderManagerService);
        const render = renderManager.createRender(workbook.getUnitId());
        render.engine.resizeBySize(800, 600);
        injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, { left: 0, top: 0, right: 0, bottom: 0 });
        const skeletonManager = render.with(SheetSkeletonManagerService);
        skeletonManager.setCurrent({ sheetId: 'sheet1' });
        const skeleton = skeletonManager.getCurrentSkeleton()!;
        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN, skeleton);
        const rowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW, skeleton);
        const columnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN, skeleton);
        render.mainComponent = spreadsheet;
        render.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        render.components.set(SHEET_VIEW_KEY.ROW, rowHeader);
        render.components.set(SHEET_VIEW_KEY.COLUMN, columnHeader);
        render.scene.addObjects([spreadsheet, rowHeader, columnHeader]);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetContextMenuRenderController]);
        const triggerMenu = vi.spyOn(injector.get(IContextMenuService), 'triggerContextMenu');
        const getSelections = () => injector.get(SheetsSelectionsService).getWorkbookSelections(workbook.getUnitId()).getCurrentSelections();
        const eventAt = (row: number, column: number, modifiers: Partial<IPointerEvent> = {}) => {
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                offsetX: (cell.startX + cell.endX) / 2,
                offsetY: (cell.startY + cell.endY) / 2,
                button: 0,
                stopPropagation: () => {},
                ...modifiers,
            } as IPointerEvent;
        };
        const click = (component: Spreadsheet | SpreadsheetRowHeader | SpreadsheetColumnHeader, event: IPointerEvent) => {
            component.onPointerDown$.emitEvent(event);
            render.scene.onPointerUp$.emitEvent(event);
        };
        return { injector, render, spreadsheet, rowHeader, columnHeader, triggerMenu, getSelections, eventAt, click };
    }

    it.each([false, true])('opens cell and header menus with real right clicks on Mac %s', (isMac) => {
        const { spreadsheet, rowHeader, columnHeader, triggerMenu, eventAt, click } = createContextMenuTestBed(isMac);
        click(spreadsheet, eventAt(1, 1));
        expect(triggerMenu).not.toHaveBeenCalled();
        click(spreadsheet, eventAt(1, 1, { button: 2 }));
        click(spreadsheet, eventAt(4, 4, { button: 2 }));
        click(rowHeader, eventAt(3, 0, { button: 2 }));
        click(spreadsheet, eventAt(3, 2, { button: 2 }));
        click(columnHeader, eventAt(0, 3, { button: 2 }));
        click(spreadsheet, eventAt(2, 3, { button: 2 }));
        expect(triggerMenu.mock.calls.map(([, position]) => position)).toEqual([
            ContextMenuPosition.MAIN_AREA,
            ContextMenuPosition.MAIN_AREA,
            ContextMenuPosition.ROW_HEADER,
            ContextMenuPosition.ROW_HEADER,
            ContextMenuPosition.COL_HEADER,
            ContextMenuPosition.COL_HEADER,
        ]);
    });

    it('opens Mac Control-click menus without toggling selections or selecting a dragged range', () => {
        const { render, spreadsheet, rowHeader, columnHeader, triggerMenu, getSelections, eventAt, click } = createContextMenuTestBed(true);
        click(spreadsheet, eventAt(0, 0));
        click(spreadsheet, eventAt(2, 2, { shiftKey: true }));
        const selections = getSelections();
        click(spreadsheet, eventAt(1, 1, { ctrlKey: true }));
        expect(getSelections()).toEqual(selections);
        const outside = eventAt(4, 4, { ctrlKey: true });
        spreadsheet.onPointerDown$.emitEvent(outside);
        render.scene.onPointerMove$.emitEvent(eventAt(6, 6, { ctrlKey: true, buttons: 1 }));
        render.scene.onPointerUp$.emitEvent(outside);
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 4, endRow: 4, startColumn: 4, endColumn: 4 });
        click(rowHeader, eventAt(3, 0, { ctrlKey: true }));
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 3, endRow: 3, startColumn: 0, endColumn: 9 });
        click(columnHeader, eventAt(0, 3, { ctrlKey: true }));
        expect(getSelections()).toHaveLength(1);
        expect(getSelections()[0].range).toMatchObject({ startRow: 0, endRow: 19, startColumn: 3, endColumn: 3 });
        expect(triggerMenu.mock.calls.map(([, position]) => position)).toEqual([
            ContextMenuPosition.MAIN_AREA,
            ContextMenuPosition.MAIN_AREA,
            ContextMenuPosition.ROW_HEADER,
            ContextMenuPosition.COL_HEADER,
        ]);
    });

    it.each([false, true])('keeps additive clicks separate from menus on Mac %s', (isMac) => {
        const { spreadsheet, triggerMenu, getSelections, eventAt, click } = createContextMenuTestBed(isMac);
        click(spreadsheet, eventAt(0, 0));
        click(spreadsheet, eventAt(2, 2, isMac ? { metaKey: true } : { ctrlKey: true }));
        expect(getSelections()).toHaveLength(2);
        expect(triggerMenu).not.toHaveBeenCalled();
        if (!isMac) {
            click(spreadsheet, eventAt(3, 3, { metaKey: true }));
            expect(getSelections()).toHaveLength(1);
        }
    });

    it('leaves Mac Control clicks to the formula reference selector', () => {
        const { injector, spreadsheet, rowHeader, columnHeader, triggerMenu, eventAt, click } = createContextMenuTestBed(true);
        injector.get(IContextService).setContextValue(REF_SELECTIONS_ENABLED, true);
        for (const component of [spreadsheet, rowHeader, columnHeader]) {
            click(component, eventAt(1, 1, { ctrlKey: true }));
        }
        expect(triggerMenu).not.toHaveBeenCalled();
        click(spreadsheet, eventAt(1, 1, { button: 2 }));
        expect(triggerMenu).toHaveBeenCalledOnce();
    });
});

describe('SheetContextMenuRenderController embed chrome bridge', () => {
    it('suppresses host sheet context menus only for active sheet-tab overrides', () => {
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'host-1',
            entry: 'sheets-sheet-tab',
        })).toBe(true);
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'host-1',
            entry: 'sheets-floating-object',
        })).toBe(false);
        expect(shouldSuppressSheetContextMenuForEmbedOverride('host-1', {
            hostUnitId: 'other-host',
            entry: 'sheets-sheet-tab',
        })).toBe(false);
    });

    it('closes an open host context menu whenever a child session takes ownership', () => {
        expect(shouldHideSheetHostContextMenuForEmbedSession('host-1', {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            sessionMode: 'child-keyboard',
        })).toBe(true);
        expect(shouldHideSheetHostContextMenuForEmbedSession('host-1', {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            sessionMode: 'child-fullscreen',
        })).toBe(true);
        expect(shouldHideSheetHostContextMenuForEmbedSession('host-1', {
            embedId: 'embed-1',
            hostUnitId: 'host-2',
            sessionMode: 'child-fullscreen',
        })).toBe(false);
        expect(shouldHideSheetHostContextMenuForEmbedSession('host-1', {
            embedId: 'embed-1',
            hostUnitId: 'host-1',
            sessionMode: 'host-passive',
        })).toBe(false);
    });
});
