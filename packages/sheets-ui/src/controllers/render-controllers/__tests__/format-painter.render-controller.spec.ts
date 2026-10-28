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
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    RANGE_TYPE,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    Rect,
    RenderManagerService,
    SHEET_VIEWPORT_KEY,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetRowHeader,
    Vector2,
    Viewport,
} from '@univerjs/engine-render';
import {
    BorderStyleManagerService,
    RangeProtectionRuleModel,
    SetRangeValuesMutation,
    SetSelectionsOperation,
    SheetInterceptorService,
    SheetSkeletonService,
    SheetsSelectionsService,
    WorkbookPermissionService,
    WorksheetPermissionService,
    WorksheetProtectionPointModel,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import {
    FormatPainterSessionService,
    IPlatformService,
    IShortcutService,
    IUIRuntimeScopeService,
    PlatformService,
    ShortcutService,
    UIRuntimeScopeService,
} from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApplyFormatPainterCommand } from '../../../commands/commands/set-format-painter.command';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import enUS from '../../../locale/en-US';
import { FormatPainterService, IFormatPainterService } from '../../../services/format-painter/format-painter.service';
import { IMarkSelectionService, MarkSelectionService } from '../../../services/mark-selection/mark-selection.service';
import { ISheetSelectionRenderService } from '../../../services/selection/base-selection-render.service';
import { SheetSelectionRenderService } from '../../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';
import { FormatPainterController } from '../../format-painter/format-painter.controller';
import { FormatPainterRenderController } from '../format-painter.render-controller';

describe('FormatPainterRenderController header targets', () => {
    let univer: Univer;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
            return { canvas: this, setTransform: vi.fn(), clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        });
        univer = new Univer();
    });

    afterEach(() => {
        vi.clearAllTimers();
        univer.dispose();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    function setup() {
        const injector = univer.__getInjector();
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: enUS });
        localeService.setLocale(LocaleType.EN_US);
        localeService.setDirection('ltr');
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IPlatformService, { useClass: PlatformService }]);
        injector.add([IShortcutService, { useClass: ShortcutService }]);
        injector.add([IUIRuntimeScopeService, { useClass: UIRuntimeScopeService }]);
        injector.add([IMarkSelectionService, { useClass: MarkSelectionService }]);
        injector.add([IFormatPainterService, { useClass: FormatPainterService }]);
        injector.add([SheetSkeletonService]);
        injector.add([SheetInterceptorService]);
        injector.add([SheetsSelectionsService]);
        injector.add([BorderStyleManagerService]);
        injector.add([RangeProtectionRuleModel]);
        injector.add([WorksheetProtectionRuleModel]);
        injector.add([WorksheetProtectionPointModel]);
        injector.add([WorkbookPermissionService]);
        injector.add([WorksheetPermissionService]);
        injector.add([FormatPainterSessionService]);
        injector.add([FormatPainterController]);
        injector.get(SheetSkeletonService);
        injector.get(SheetInterceptorService);
        const commands = injector.get(ICommandService);
        [SetSelectionsOperation, SetRangeValuesMutation, ApplyFormatPainterCommand]
            .forEach((command) => commands.registerCommand(command));
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'header-format-painter',
            sheetOrder: ['sheet1'],
            sheets: {
                sheet1: {
                    id: 'sheet1',
                    rowCount: 8,
                    columnCount: 6,
                    cellData: { 0: { 0: { s: { bl: BooleanNumber.TRUE } } }, 3: { 3: { v: 'keep', f: '=1+1' } } },
                },
            },
        });
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        injector.get(WorkbookPermissionService);
        injector.get(WorksheetPermissionService);
        const renderManager = injector.get(IRenderManagerService);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [SheetSkeletonManagerService]);
        const render = renderManager.createRender(workbook.getUnitId());
        render.engine.resizeBySize(800, 600);
        injector.createInstance(Viewport, SHEET_VIEWPORT_KEY.VIEW_MAIN, render.scene, {
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        });
        const skeletonManager = render.with(SheetSkeletonManagerService);
        skeletonManager.setCurrent({ sheetId: 'sheet1' });
        const skeleton = skeletonManager.getCurrentSkeleton()!;
        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN, skeleton);
        const rowHeader = new SpreadsheetRowHeader(SHEET_VIEW_KEY.ROW, skeleton);
        const columnHeader = new SpreadsheetColumnHeader(SHEET_VIEW_KEY.COLUMN, skeleton);
        const drawingCell = skeleton.getNoMergeCellWithCoordByIndex(2, 2);
        const drawing = new Rect('drawing', {
            left: drawingCell.startX + 1,
            top: drawingCell.startY + 1,
            width: drawingCell.endX - drawingCell.startX - 2,
            height: drawingCell.endY - drawingCell.startY - 2,
            zIndex: 2,
        });
        render.mainComponent = spreadsheet;
        render.components.set(SHEET_VIEW_KEY.MAIN, spreadsheet);
        render.components.set(SHEET_VIEW_KEY.ROW, rowHeader);
        render.components.set(SHEET_VIEW_KEY.COLUMN, columnHeader);
        render.scene.addObjects([spreadsheet, rowHeader, columnHeader, drawing]);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [ISheetSelectionRenderService, { useClass: SheetSelectionRenderService }]);
        injector.get(FormatPainterController);
        renderManager.registerRenderModule(UniverInstanceType.UNIVER_SHEET, [FormatPainterRenderController]);
        const canvas = render.engine.getCanvasElement();
        const session = injector.get(FormatPainterSessionService);
        const selections = injector.get(SheetsSelectionsService);
        const eventAt = (row: number, column: number) => {
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return { offsetX: (cell.startX + cell.endX) / 2, offsetY: (cell.startY + cell.endY) / 2, button: 0, stopPropagation: () => {} } as IPointerEvent;
        };
        const click = (component: Spreadsheet | SpreadsheetRowHeader | SpreadsheetColumnHeader | Rect, event: IPointerEvent) => {
            const headerEvent = {
                ...event,
                offsetX: component === rowHeader ? skeleton.rowHeaderWidth / 2 : event.offsetX,
                offsetY: component === columnHeader ? skeleton.columnHeaderHeight / 2 : event.offsetY,
            };
            expect(render.scene.pick(new Vector2(headerEvent.offsetX, headerEvent.offsetY))).toBe(component);
            const pointerEvent = (type: string) => {
                const pointer = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0 });
                Object.defineProperties(pointer, {
                    offsetX: { value: headerEvent.offsetX },
                    offsetY: { value: headerEvent.offsetY },
                });
                return pointer;
            };
            canvas.dispatchEvent(pointerEvent('pointermove'));
            const down = pointerEvent('pointerdown');
            canvas.dispatchEvent(down);
            if (!down.defaultPrevented) {
                component.onPointerDown$.emitEvent(headerEvent);
            }
            canvas.dispatchEvent(pointerEvent('pointerup'));
            render.scene.onPointerUp$.emitEvent(headerEvent);
        };
        click(spreadsheet, eventAt(0, 0));
        return { workbook, commands, session, selections, canvas, drawing, rowHeader, columnHeader, eventAt, click };
    }

    it.each([RANGE_TYPE.ROW, RANGE_TYPE.COLUMN])('paints a whole %s with undo and redo', async (rangeType) => {
        const bed = setup();
        expect(bed.session.activate()).toBe(true);
        bed.click(rangeType === RANGE_TYPE.ROW ? bed.rowHeader : bed.columnHeader, bed.eventAt(3, 3));
        expect(bed.canvas.dataset.formatPainter).toBe('available');
        await vi.advanceTimersByTimeAsync(0);
        const worksheet = bed.workbook.getActiveSheet();
        const range = bed.selections.getCurrentLastSelection()!.range;
        expect(range).toMatchObject(rangeType === RANGE_TYPE.ROW
            ? { startRow: 3, endRow: 3, startColumn: 0, endColumn: 5, rangeType }
            : { startRow: 0, endRow: 7, startColumn: 3, endColumn: 3, rangeType });
        for (let row = 0; row < worksheet.getRowCount(); row++) {
            for (let column = 0; column < worksheet.getColumnCount(); column++) {
                const painted = (row === 0 && column === 0) ||
                    (rangeType === RANGE_TYPE.ROW ? row === 3 : column === 3);
                expect(worksheet.getCellStyle(row, column)?.bl === BooleanNumber.TRUE).toBe(painted);
            }
        }
        expect(worksheet.getCell(3, 3)).toMatchObject({ v: 'keep', f: '=1+1' });
        expect(bed.session.mode).toBe('off');
        expect(bed.canvas.dataset.formatPainter).toBeUndefined();
        expect(await bed.commands.executeCommand(UndoCommand.id)).toBe(true);
        expect(worksheet.getCellStyle(3, 3)?.bl).toBeUndefined();
        expect(worksheet.getCell(3, 3)).toMatchObject({ v: 'keep', f: '=1+1' });
        expect(await bed.commands.executeCommand(RedoCommand.id)).toBe(true);
        expect(worksheet.getCellStyle(3, 3)?.bl).toBe(BooleanNumber.TRUE);
    });

    it('keeps continuous painting active across row and column headers and blocks other objects', async () => {
        const bed = setup();
        expect(bed.session.activate(true)).toBe(true);
        bed.click(bed.drawing, bed.eventAt(2, 2));
        expect(bed.canvas.dataset.formatPainter).toBe('unavailable');
        await vi.advanceTimersByTimeAsync(0);
        expect(bed.workbook.getActiveSheet().getCellStyle(2, 2)?.bl).toBeUndefined();
        bed.click(bed.rowHeader, bed.eventAt(3, 0));
        await vi.advanceTimersByTimeAsync(0);
        bed.click(bed.columnHeader, bed.eventAt(0, 4));
        await vi.advanceTimersByTimeAsync(0);
        expect(bed.workbook.getActiveSheet().getCellStyle(3, 5)?.bl).toBe(BooleanNumber.TRUE);
        expect(bed.workbook.getActiveSheet().getCellStyle(7, 4)?.bl).toBe(BooleanNumber.TRUE);
        expect(bed.session.mode).toBe('continuous');
        expect(bed.canvas.dataset.formatPainter).toBe('available');
    });
});
