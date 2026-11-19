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
import { ICommandService, LocaleService, LocaleType, RANGE_TYPE, Univer, UniverInstanceType } from '@univerjs/core';
import { CanvasColorService, CURSOR_TYPE, ICanvasColorService, IRenderManagerService, RenderManagerService, SHEET_VIEWPORT_KEY, Spreadsheet, SpreadsheetColumnHeader, SpreadsheetRowHeader, Viewport } from '@univerjs/engine-render';
import { MoveColsCommand, MoveRowsCommand, SetSelectionsOperation, SheetInterceptorService, SheetSkeletonService, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, ContextMenuService, IContextMenuService, IPlatformService, IShortcutService, IUIRuntimeScopeService, PlatformService, ShortcutService, UIRuntimeScopeService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { SheetContextMenuRenderController } from '../contextmenu.render-controller';
import { HeaderMoveRenderController } from '../header-move.render-controller';

describe.each([
    { name: 'row', rangeType: RANGE_TYPE.ROW, command: MoveRowsCommand, menu: ContextMenuPosition.ROW_HEADER },
    { name: 'column', rangeType: RANGE_TYPE.COLUMN, command: MoveColsCommand, menu: ContextMenuPosition.COL_HEADER },
])('HeaderMoveRenderController $name gestures', ({ rangeType, command, menu }) => {
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

    function createGestureTestBed(isMac = false, selected = true) {
        const injector = univer.__getInjector();
        vi.spyOn(injector.get(IPlatformService), 'isMac', 'get').mockReturnValue(isMac);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'header-move',
            sheetOrder: ['sheet1'],
            sheets: { sheet1: { id: 'sheet1', rowCount: 20, columnCount: 10, cellData: {} } },
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
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [HeaderMoveRenderController]);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetContextMenuRenderController]);
        const header = rangeType === RANGE_TYPE.ROW ? rowHeader : columnHeader;
        const eventAt = (index: number, modifiers: Partial<IPointerEvent> = {}) => {
            const cell = skeleton.getNoMergeCellWithCoordByIndex(index, index);
            return {
                offsetX: rangeType === RANGE_TYPE.ROW ? 10 : (cell.startX + cell.endX) / 2,
                offsetY: rangeType === RANGE_TYPE.COLUMN ? 10 : (cell.startY + cell.endY) / 2,
                button: 0,
                buttons: 1,
                stopPropagation: () => {},
                ...modifiers,
            } as IPointerEvent;
        };
        if (selected) {
            header.onPointerDown$.emitEvent(eventAt(3));
            render.scene.onPointerUp$.emitEvent(eventAt(3, { buttons: 0 }));
        }
        const execute = vi.spyOn(injector.get(ICommandService), 'executeCommand').mockResolvedValue(true);
        const triggerMenu = vi.spyOn(injector.get(IContextMenuService), 'triggerContextMenu');
        return { render, header, eventAt, execute, triggerMenu };
    }

    it.each([
        { gesture: 'right click', isMac: false, button: 2, ctrlKey: false },
        { gesture: 'Mac right click', isMac: true, button: 2, ctrlKey: false },
        { gesture: 'Mac Control-click', isMac: true, button: 0, ctrlKey: true },
    ].flatMap((gesture) => [false, true].map((selected) => ({ ...gesture, selected }))))(
        'does not drag after $gesture when the menu captures pointerup (selected: $selected)',
        ({ isMac, button, ctrlKey, selected }) => {
            const { render, header, eventAt, execute, triggerMenu } = createGestureTestBed(isMac, selected);
            const controller = render.with(HeaderMoveRenderController);
            controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, { handler: () => true });

            header.onPointerDown$.emitEvent(eventAt(3, { button, ctrlKey }));
            // The menu receives pointerup; the canvas only receives the subsequent hover.
            render.scene.onPointerMove$.emitEvent(eventAt(1, { buttons: 0 }));

            expect(triggerMenu).toHaveBeenCalledWith(expect.anything(), menu);
            expect(render.scene.getCursor()).not.toBe(CURSOR_TYPE.GRABBING);
            expect(render.scene.objectsEvented).toBe(true);
            render.scene.onPointerUp$.emitEvent(eventAt(1, { buttons: 0 }));
            expect(execute).not.toHaveBeenCalledWith(command.id, expect.anything());
        }
    );

    it.each([
        { gesture: 'left drag', isMac: false, ctrlKey: false },
        { gesture: 'Mac left drag', isMac: true, ctrlKey: false },
        { gesture: 'non-Mac Control-drag', isMac: false, ctrlKey: true },
    ])('still moves the selection with $gesture', ({ isMac, ctrlKey }) => {
        const { render, header, eventAt, execute, triggerMenu } = createGestureTestBed(isMac);
        const controller = render.with(HeaderMoveRenderController);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, { handler: () => true });
        const range = univer.__getInjector().get(SheetsSelectionsService).getCurrentLastSelection()!.range;

        header.onPointerDown$.emitEvent(eventAt(3, { ctrlKey }));
        render.scene.onPointerMove$.emitEvent(eventAt(1));
        render.scene.onPointerUp$.emitEvent(eventAt(1, { buttons: 0 }));

        expect(execute).toHaveBeenCalledWith(command.id, {
            fromRange: range,
            toRange: {
                ...range,
                ...(rangeType === RANGE_TYPE.ROW ? { startRow: 1, endRow: 1 } : { startColumn: 1, endColumn: 1 }),
            },
        });
        expect(triggerMenu).not.toHaveBeenCalled();
        expect(render.scene.objectsEvented).toBe(true);
    });

    it.each([
        { gesture: 'middle button', button: 1, permitted: true },
        { gesture: 'denied move permission', button: 0, permitted: false },
    ])('does not move with $gesture', ({ button, permitted }) => {
        const { render, header, eventAt, execute } = createGestureTestBed();
        const controller = render.with(HeaderMoveRenderController);
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_MOVE_PERMISSION_CHECK, { handler: () => permitted });

        header.onPointerDown$.emitEvent(eventAt(3, { button }));
        render.scene.onPointerMove$.emitEvent(eventAt(1));
        render.scene.onPointerUp$.emitEvent(eventAt(1, { buttons: 0 }));

        expect(execute).not.toHaveBeenCalledWith(command.id, expect.anything());
        expect(render.scene.objectsEvented).toBe(true);
    });
});
