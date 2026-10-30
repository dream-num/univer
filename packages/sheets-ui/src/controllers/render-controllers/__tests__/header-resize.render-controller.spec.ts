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

import type { IMouseEvent } from '@univerjs/engine-render';
import { BooleanNumber, ICommandService, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import {
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { HeaderMenuResizeShape } from '../../../views/header-resize-shape';
import type { ITestEvent } from './render-test-bed';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { HeaderResizeRenderController } from '../header-resize.render-controller';
import { createRenderTestBed } from './render-test-bed';

describe('HeaderResizeRenderController', () => {
    let testBed: ReturnType<typeof createRenderTestBed>;
    const cleanups: Array<() => void> = [];

    beforeEach(() => {
        testBed = createRenderTestBed({ dependencies: [[SheetSkeletonService]] });
        cleanups.push(() => testBed.univer.dispose());
        const { context, injector, sheet } = testBed;
        const worksheet = sheet.getActiveSheet()!;
        worksheet.getRowManager().setRowHeight(0, 20);
        worksheet.getColumnManager().setColumnWidth(0, 100);
        const commandService = injector.get(ICommandService);
        for (const command of [
            DeltaColumnWidthCommand,
            DeltaRowHeightCommand,
            SetWorksheetColWidthMutation,
            SetWorksheetRowHeightMutation,
            SetWorksheetRowIsAutoHeightMutation,
        ]) {
            commandService.registerCommand(command);
        }
        injector.get(SheetsSelectionsService).setSelections([{
            range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.NORMAL },
            primary: null,
            style: null,
        }]);
        const createController = () => injector.createInstance(HeaderResizeRenderController, context);
        injector.add([HeaderResizeRenderController, { useFactory: createController }]);
    });

    afterEach(() => {
        for (const cleanup of cleanups.splice(0).reverse()) {
            cleanup();
        }
    });

    it('updates row height by dragging the resize handle', () => {
        const { context, injector, scene, sheet } = testBed;

        const controller = injector.get(HeaderResizeRenderController);
        cleanups.push(() => controller.dispose());
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: () => true,
        });

        // Hover near the bottom edge of the first row to show the row resize handle.
        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as unknown as {
            onPointerMove$: ITestEvent<Partial<IMouseEvent>, object>;
        };
        rowHeader.onPointerMove$.emit({ offsetX: 10, offsetY: 19, button: 0 }, {});

        const rowResizeRect = (controller as unknown as { _rowResizeRect: HeaderMenuResizeShape })._rowResizeRect;
        // Start dragging the resize handle downward.
        rowResizeRect.onPointerDown$.emitEvent({ offsetX: 10, offsetY: 19, button: 0 } as IMouseEvent);
        scene.onPointerMove$.emit({ offsetX: 10, offsetY: 35, button: 0 }, { stopPropagation: () => undefined });
        scene.onPointerUp$.emit({ offsetX: 10, offsetY: 35, button: 0 }, { stopPropagation: () => undefined });

        expect(sheet.getActiveSheet()!.getRowHeight(0)).toBeGreaterThan(20);
    });

    it.each([RANGE_TYPE.ROW, RANGE_TYPE.COLUMN])('clamps dragging %s past the start to zero with undo and redo', async (rangeType) => {
        const { context, injector, scene, sheet } = testBed;
        const worksheet = sheet.getActiveSheet()!;
        const commandService = injector.get(ICommandService);
        const controller = injector.get(HeaderResizeRenderController);
        cleanups.push(() => controller.dispose());
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: () => true,
        });
        const isRow = rangeType === RANGE_TYPE.ROW;
        const header = context.components.get(isRow ? SHEET_VIEW_KEY.ROW : SHEET_VIEW_KEY.COLUMN) as unknown as {
            onPointerMove$: ITestEvent<Partial<IMouseEvent>, object>;
        };
        const start = isRow ? { offsetX: 10, offsetY: 19, button: 0 } : { offsetX: 99, offsetY: 10, button: 0 };
        header.onPointerMove$.emit(start, {});
        const shapes = controller as unknown as {
            _rowResizeRect: HeaderMenuResizeShape;
            _columnResizeRect: HeaderMenuResizeShape;
        };
        const shape = isRow ? shapes._rowResizeRect : shapes._columnResizeRect;
        shape.onPointerDown$.emitEvent(start as IMouseEvent);
        const end = isRow ? { offsetX: 10, offsetY: -100, button: 0 } : { offsetX: -100, offsetY: 10, button: 0 };
        scene.onPointerMove$.emit(end, { stopPropagation: () => undefined });
        scene.onPointerUp$.emit(end, { stopPropagation: () => undefined });
        const getSize = () => isRow ? worksheet.getRowHeight(0) : worksheet.getColumnWidth(0);
        expect(getSize()).toBe(0);
        expect(isRow ? worksheet.getRowVisible(0) : worksheet.getColVisible(0)).toBe(true);
        if (isRow) {
            expect(worksheet.getRowManager().getRow(0)?.ia).toBe(BooleanNumber.FALSE);
        }
        await commandService.executeCommand(UndoCommand.id);
        expect(getSize()).toBe(isRow ? 20 : 100);
        await commandService.executeCommand(RedoCommand.id);
        expect(getSize()).toBe(0);
    });

    it('positions resize handles in the base header area when outline uses margins', () => {
        const { context, injector, skeleton } = testBed;

        skeleton.rowHeaderWidth = 46;
        skeleton.columnHeaderHeight = 20;
        skeleton.rowHeaderWidthAndMarginLeft = 86;
        skeleton.columnHeaderHeightAndMarginTop = 60;
        Object.assign(skeleton.worksheet, {
            getConfig: () => ({
                rowHeader: { width: 46 },
                columnHeader: { height: 20 },
            }),
        });

        const controller = injector.get(HeaderResizeRenderController);
        cleanups.push(() => controller.dispose());
        controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
            handler: () => true,
        });

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as unknown as {
            onPointerMove$: ITestEvent<Partial<IMouseEvent>, object>;
        };
        rowHeader.onPointerMove$.emit({ offsetX: 70, offsetY: 19, button: 0 }, {});
        const rowResizeRect = (controller as unknown as { _rowResizeRect: HeaderMenuResizeShape })._rowResizeRect;
        expect(rowResizeRect.left).toBeCloseTo(40 + 46 / 2 - (46 / 3) / 2);
        expect(rowResizeRect.size).toBeCloseTo(46 / 3);

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as unknown as {
            onPointerMove$: ITestEvent<Partial<IMouseEvent>, object>;
        };
        columnHeader.onPointerMove$.emit({ offsetX: 99, offsetY: 52, button: 0 }, {});
        const columnResizeRect = (controller as unknown as { _columnResizeRect: HeaderMenuResizeShape })._columnResizeRect;
        expect(columnResizeRect.top).toBeCloseTo(40 + 20 / 2 - (20 * 0.7) / 2);
        expect(columnResizeRect.size).toBeCloseTo(20 * 0.7);
    });
});
