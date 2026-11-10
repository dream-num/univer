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

import { ICommandService } from '@univerjs/core';
import { DeltaColumnWidthCommand, DeltaRowHeightCommand } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
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

    // https://github.com/dream-num/univer/issues/5483
    describe('when the scene is scaled', () => {
        function setup(scale: number) {
            const testBed = createRenderTestBed();
            const { context, injector, scene } = testBed;
            scene.scale(scale, scale);

            const commandService = injector.get(ICommandService);
            const executeSpy = vi.spyOn(commandService, 'executeCommand').mockResolvedValue(true as any);

            const controller = injector.createInstance(HeaderResizeRenderController, context as any);
            controller.interceptor.intercept(controller.interceptor.getInterceptPoints().HEADER_RESIZE_PERMISSION_CHECK, {
                handler: () => true,
            });

            return { testBed, context, controller, executeSpy };
        }

        it('resizes a column whose scene offset exceeds the canvas width when zoomed out', () => {
            const { testBed, context, controller, executeSpy } = setup(0.5);

            // At 50% zoom, screen x 498 maps to scene x 996, the right edge of column 9 (scene x 900-1000),
            // which lies beyond the 800px canvas width in scene units.
            const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as any;
            columnHeader.onPointerMove$.emit({ offsetX: 498, offsetY: 10, button: 0 }, {});

            const columnResizeRect = (controller as any)._columnResizeRect;
            columnResizeRect.onPointerDown$.emitEvent({ offsetX: 498, offsetY: 10, button: 0 } as any);
            (context.scene as any).onPointerMove$.emit({ offsetX: 523, offsetY: 10, button: 0 }, {});
            (context.scene as any).onPointerUp$.emit({ offsetX: 523, offsetY: 10, button: 0 }, {});

            // Dragging 25 screen px = 50 scene px, minus half of the scaled thumb (4 / 0.5 / 2).
            expect(executeSpy).toHaveBeenCalledWith(DeltaColumnWidthCommand.id, {
                deltaX: 46,
                anchorCol: 9,
            });

            testBed.univer.dispose();
        });

        it('resizes a row whose scene offset exceeds the canvas height when zoomed out', () => {
            const { testBed, context, controller, executeSpy } = setup(0.5);

            // Screen y 409 maps to scene y 818, the bottom edge of row 40 (scene y 800-820).
            const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
            rowHeader.onPointerMove$.emit({ offsetX: 10, offsetY: 409, button: 0 }, {});

            const rowResizeRect = (controller as any)._rowResizeRect;
            rowResizeRect.onPointerDown$.emitEvent({ offsetX: 10, offsetY: 409, button: 0 } as any);
            (context.scene as any).onPointerMove$.emit({ offsetX: 10, offsetY: 429, button: 0 }, {});
            (context.scene as any).onPointerUp$.emit({ offsetX: 10, offsetY: 429, button: 0 }, {});

            expect(executeSpy).toHaveBeenCalledWith(DeltaRowHeightCommand.id, {
                deltaY: 36,
                anchorRow: 40,
            });

            testBed.univer.dispose();
        });

        it('clamps the column resize to the visible area in scene units when zoomed in', () => {
            const { testBed, context, controller, executeSpy } = setup(2);

            // Screen x 399 maps to scene x 199.5, the right edge of column 1 (scene x 100-200).
            const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN) as any;
            columnHeader.onPointerMove$.emit({ offsetX: 399, offsetY: 10, button: 0 }, {});

            const columnResizeRect = (controller as any)._columnResizeRect;
            columnResizeRect.onPointerDown$.emitEvent({ offsetX: 399, offsetY: 10, button: 0 } as any);
            // Drag past the canvas edge.
            (context.scene as any).onPointerMove$.emit({ offsetX: 1000, offsetY: 10, button: 0 }, {});
            (context.scene as any).onPointerUp$.emit({ offsetX: 1000, offsetY: 10, button: 0 }, {});

            // The visible right edge is (800 - 10) / 2 = 395 in scene units, so the delta is capped at 395 - 100.
            expect(executeSpy).toHaveBeenCalledWith(DeltaColumnWidthCommand.id, {
                deltaX: 295,
                anchorCol: 1,
            });

            testBed.univer.dispose();
        });

        it('clamps the row resize to the visible area in scene units when zoomed in', () => {
            const { testBed, context, controller, executeSpy } = setup(2);

            // Screen y 79 maps to scene y 39.5, the bottom edge of row 1 (scene y 20-40).
            const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW) as any;
            rowHeader.onPointerMove$.emit({ offsetX: 10, offsetY: 79, button: 0 }, {});

            const rowResizeRect = (controller as any)._rowResizeRect;
            rowResizeRect.onPointerDown$.emitEvent({ offsetX: 10, offsetY: 79, button: 0 } as any);
            // Drag past the canvas edge.
            (context.scene as any).onPointerMove$.emit({ offsetX: 10, offsetY: 1000, button: 0 }, {});
            (context.scene as any).onPointerUp$.emit({ offsetX: 10, offsetY: 1000, button: 0 }, {});

            // The visible bottom edge is (600 - 10) / 2 = 295 in scene units, so the delta is capped at 295 - 20.
            expect(executeSpy).toHaveBeenCalledWith(DeltaRowHeightCommand.id, {
                deltaY: 275,
                anchorRow: 1,
            });

            testBed.univer.dispose();
        });
    });
});
