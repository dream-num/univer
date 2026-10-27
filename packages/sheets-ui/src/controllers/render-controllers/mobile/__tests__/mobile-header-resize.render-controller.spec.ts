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

import type { Workbook } from '@univerjs/core';
import type { BaseObject, IPointerEvent, IRenderContext } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { EventSubject, ICommandService, LocaleType, RANGE_TYPE, RedoCommand, UndoCommand } from '@univerjs/core';
import {
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    SelectionMoveType,
    SetWorksheetColWidthMutation,
    SetWorksheetRowHeightMutation,
    SetWorksheetRowIsAutoHeightMutation,
    SheetSkeletonService,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetScrollManagerService } from '../../../../services/scroll-manager.service';
import { SheetSkeletonManagerService } from '../../../../services/sheet-skeleton-manager.service';
import { createTestBed } from '../../../editor/__tests__/create-test-bed';
import { MobileHeaderResizeRenderController } from '../mobile-header-resize.render-controller';

interface IMobileHeaderResizeTestAccess {
    _currentRow: number;
    _currentColumn: number;
    _rowResizeButton: BaseObject;
    _columnResizeButton: BaseObject;
    _resizeHelperShape: BaseObject;
    _handleSelectionChange(selections: ISelectionWithStyle[]): void;
    _startResize(event: { offsetX: number; offsetY: number }, type: 'row' | 'column'): void;
    _updateButtonPositionOnScroll(): void;
    dispose(): void;
}

const testBeds: ReturnType<typeof createTestBed>[] = [];

function pointerEvent(type: string, clientX = 0, clientY = 0, pointerId = 0, pointerType = 'touch') {
    return Object.defineProperties(new MouseEvent(type, { clientX, clientY, bubbles: true, cancelable: true }), {
        pointerId: { value: pointerId },
        pointerType: { value: pointerType },
        offsetX: { value: clientX },
        offsetY: { value: clientY },
    }) as IPointerEvent;
}

function createController(zoomRatio = 2, size = 20) {
    const testBed = createTestBed({
        id: 'test',
        appVersion: '1.0.0',
        locale: LocaleType.EN_US,
        name: '',
        styles: {},
        sheetOrder: ['sheet-1'],
        sheets: {
            'sheet-1': {
                id: 'sheet-1',
                rowCount: 20,
                columnCount: 20,
                defaultRowHeight: 20,
                defaultColumnWidth: 80,
                rowData: { 2: { h: size } },
                columnData: { 1: { w: size * 4 } },
                rowHeader: { width: 48 },
                columnHeader: { height: 24 },
                zoomRatio,
                cellData: {},
            },
        },
    }, [[SheetSkeletonService]]);
    testBeds.push(testBed);
    const injector = testBed.univer.__getInjector();
    const canvasElement = document.createElement('canvas');
    document.body.appendChild(canvasElement);
    const scene = {
        addObjects: vi.fn(),
        addObject: vi.fn(),
        onTransformChange$: new EventSubject(),
        getActiveViewportByCoord: () => ({ viewportScrollX: 0, viewportScrollY: 0 }),
        getViewports: () => [],
        makeDirty: vi.fn(),
        getAncestorScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
        getEngine: vi.fn(() => ({ getCanvasElement: () => canvasElement, width: 800, height: 600 })),
        disableObjectsEvent: vi.fn(),
        enableObjectsEvent: vi.fn(),
    };
    const context = {
        scene,
        unit: testBed.sheet,
        unitId: testBed.sheet.getUnitId(),
    } as unknown as IRenderContext<Workbook>;
    function createSkeletonManager() {
        return injector.createInstance(SheetSkeletonManagerService, context);
    }
    function createScrollManager() {
        return injector.createInstance(SheetScrollManagerService, context);
    }
    function createResizeController() {
        return injector.createInstance(MobileHeaderResizeRenderController, context);
    }
    injector.add([SheetSkeletonManagerService, { useFactory: createSkeletonManager }]);
    injector.add([SheetScrollManagerService, { useFactory: createScrollManager }]);
    injector.add([MobileHeaderResizeRenderController, { useFactory: createResizeController }]);
    const skeletonManager = injector.get(SheetSkeletonManagerService);
    skeletonManager.setCurrent({ sheetId: 'sheet-1' });
    const controller = injector.get(MobileHeaderResizeRenderController) as unknown as IMobileHeaderResizeTestAccess;
    const commandService = injector.get(ICommandService);
    [
        DeltaRowHeightCommand,
        DeltaColumnWidthCommand,
        SetWorksheetRowHeightMutation,
        SetWorksheetRowIsAutoHeightMutation,
        SetWorksheetColWidthMutation,
    ].forEach((command) => commandService.registerCommand(command));
    const executeCommand = vi.spyOn(commandService, 'executeCommand');

    return {
        canvasElement,
        controller,
        commandService,
        executeCommand,
        scene,
        skeleton: skeletonManager.getCurrentSkeleton()!,
        selections: injector.get(SheetsSelectionsService),
        worksheet: testBed.sheet.getActiveSheet()!,
    };
}

afterEach(() => {
    testBeds.splice(0).forEach((testBed) => testBed.univer.dispose());
    document.body.replaceChildren();
});

describe('MobileHeaderResizeRenderController business methods', () => {
    it.each([
        { axis: 'row', pointerType: 'mouse' },
        { axis: 'column', pointerType: 'mouse' },
        { axis: 'row', pointerType: 'touch' },
        { axis: 'column', pointerType: 'touch' },
    ] as const)('resizes a $axis with $pointerType input and releases outside the canvas', async ({ axis, pointerType }) => {
        const { controller, commandService, executeCommand, selections, scene, worksheet } = createController();
        const isRow = axis === 'row';
        selections.setSelections([{
            range: {
                startRow: isRow ? 2 : 0,
                endRow: isRow ? 2 : 19,
                startColumn: isRow ? 0 : 1,
                endColumn: isRow ? 19 : 1,
                rangeType: isRow ? RANGE_TYPE.ROW : RANGE_TYPE.COLUMN,
            },
            primary: null,
            style: null,
        }], SelectionMoveType.MOVE_END);
        const handle = isRow ? controller._rowResizeButton : controller._columnResizeButton;
        const initialSize = isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1);
        handle.onPointerDown$.emitEvent(pointerEvent('pointerdown', 100, 100, 1, pointerType));
        expect(scene.disableObjectsEvent).toHaveBeenCalledTimes(1);

        // Another pointer cannot move or finish the active drag.
        document.dispatchEvent(pointerEvent('pointermove', 500, 500, 2, pointerType));
        document.dispatchEvent(pointerEvent('pointerup', 500, 500, 2, pointerType));
        expect(scene.enableObjectsEvent).not.toHaveBeenCalled();
        document.dispatchEvent(pointerEvent('pointermove', isRow ? 100 : 140, isRow ? 140 : 100, 1, pointerType));
        const draggedOffset = isRow ? handle.top : handle.left;
        document.dispatchEvent(pointerEvent('pointerup', 140, 140, 1, pointerType));
        expect(isRow ? handle.top : handle.left).toBe(draggedOffset);
        expect(scene.enableObjectsEvent).toHaveBeenCalledTimes(1);
        expect(executeCommand).toHaveBeenCalledTimes(1);
        expect(await executeCommand.mock.results[0].value).toBe(true);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(initialSize + 20);
        await commandService.executeCommand(UndoCommand.id);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(initialSize);
        await commandService.executeCommand(RedoCommand.id);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(initialSize + 20);

        executeCommand.mockClear();
        handle.onPointerDown$.emitEvent(pointerEvent('pointerdown', 100, 100, 1, pointerType));
        document.dispatchEvent(pointerEvent('pointerup', 100, 100, 1, pointerType));
        expect(scene.enableObjectsEvent).toHaveBeenCalledTimes(2);
        expect(executeCommand).not.toHaveBeenCalled();
    });

    it.each(['pointercancel', 'blur', 'dispose', 'secondPointer'] as const)(
        'restores scene events and removes drag listeners on %s without submitting a resize',
        (reason) => {
            const { controller, executeCommand, scene } = createController();
            controller._handleSelectionChange([{
                range: { startRow: 0, endRow: 19, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.COLUMN },
                primary: null,
                style: null,
            }]);
            const handle = controller._columnResizeButton;
            const initialLeft = handle.left;
            handle.onPointerDown$.emitEvent(pointerEvent('pointerdown', 100, 100));
            const disposeHelper = vi.spyOn(controller._resizeHelperShape, 'dispose');
            document.dispatchEvent(pointerEvent('pointermove', 140, 100));
            expect(handle.left).not.toBe(initialLeft);
            if (reason === 'dispose') {
                controller.dispose();
            } else if (reason === 'blur') {
                window.dispatchEvent(new Event('blur'));
            } else if (reason === 'secondPointer') {
                document.dispatchEvent(pointerEvent('pointerdown', 100, 100, 1));
            } else {
                document.dispatchEvent(pointerEvent('pointercancel'));
            }
            expect(scene.enableObjectsEvent).toHaveBeenCalledTimes(1);
            expect(controller._resizeHelperShape).toBeNull();
            expect(disposeHelper).toHaveBeenCalledTimes(1);
            if (reason !== 'dispose') {
                expect(handle.left).toBe(initialLeft);
            }
            document.dispatchEvent(pointerEvent('pointermove', 180, 100));
            document.dispatchEvent(pointerEvent('pointerup'));
            expect(executeCommand).not.toHaveBeenCalled();
            expect(scene.enableObjectsEvent).toHaveBeenCalledTimes(1);
        }
    );

    it.each([
        { axis: 'row', zoom: 0.5, size: 20 },
        { axis: 'row', zoom: 1, size: 20 },
        { axis: 'row', zoom: 2, size: 20 },
        { axis: 'column', zoom: 0.5, size: 20 },
        { axis: 'column', zoom: 1, size: 20 },
        { axis: 'column', zoom: 2, size: 20 },
        { axis: 'row', zoom: 2, size: 1 },
        { axis: 'column', zoom: 2, size: 0.25 },
    ] as const)('collapses $axis selections at zoom $zoom and size $size without passing zero', async ({ axis, zoom, size }) => {
        const { canvasElement, controller, commandService, executeCommand, selections, skeleton, worksheet } =
            createController(zoom, size);
        const isRow = axis === 'row';
        const initialSize = isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1);
        const previousSize = isRow ? worksheet.getRowHeight(1) : worksheet.getColumnWidth(0);
        selections.setSelections([{
            range: {
                startRow: isRow ? 1 : 0,
                endRow: isRow ? 2 : 19,
                startColumn: 0,
                endColumn: isRow ? 19 : 1,
                rangeType: isRow ? RANGE_TYPE.ROW : RANGE_TYPE.COLUMN,
            },
            primary: null,
            style: null,
        }], SelectionMoveType.MOVE_END);
        const initialOffset = isRow ? skeleton.getOffsetByRow(2) : skeleton.getOffsetByColumn(1);
        controller._startResize({ offsetX: 200, offsetY: 100 }, axis);
        const rawDelta = -(initialSize + 30) * zoom;
        canvasElement.dispatchEvent(pointerEvent('pointermove', 200 + (isRow ? 0 : rawDelta), 100 + (isRow ? rawDelta : 0)));

        const handle = isRow ? controller._rowResizeButton : controller._columnResizeButton;
        expect(isRow ? controller._resizeHelperShape.top : controller._resizeHelperShape.left)
            .toBe(initialOffset - initialSize - 2);
        expect(isRow ? handle.top : handle.left).toBe(initialOffset - initialSize - 6);
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(executeCommand).toHaveBeenCalledWith(
            isRow ? DeltaRowHeightCommand.id : DeltaColumnWidthCommand.id,
            isRow ? { anchorRow: 2, deltaY: -initialSize } : { anchorCol: 1, deltaX: -initialSize }
        );
        expect(await executeCommand.mock.results[0].value).toBe(true);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(0);
        expect(isRow ? worksheet.getRowHeight(1) : worksheet.getColumnWidth(0)).toBe(0);

        await commandService.executeCommand(UndoCommand.id);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(initialSize);
        expect(isRow ? worksheet.getRowHeight(1) : worksheet.getColumnWidth(0)).toBe(previousSize);
        await commandService.executeCommand(RedoCommand.id);
        expect(isRow ? worksheet.getRowHeight(2) : worksheet.getColumnWidth(1)).toBe(0);
    });

    it('can drag back from the zero boundary before releasing', async () => {
        const { canvasElement, controller, executeCommand, selections, worksheet } = createController();
        selections.setSelections([{
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 19, rangeType: RANGE_TYPE.ROW },
            primary: null,
            style: null,
        }], SelectionMoveType.MOVE_END);
        controller._startResize({ offsetX: 12, offsetY: 100 }, 'row');
        for (const clientY of [0, 80]) {
            canvasElement.dispatchEvent(pointerEvent('pointermove', 12, clientY));
        }
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(executeCommand).toHaveBeenCalledWith(DeltaRowHeightCommand.id, { anchorRow: 2, deltaY: -10 });
        expect(await executeCommand.mock.results[0].value).toBe(true);
        expect(worksheet.getRowHeight(2)).toBe(10);
    });

    it('does not submit a small finger movement or a drag returning to its initial position', () => {
        const { canvasElement, controller, executeCommand } = createController();
        controller._currentRow = 2;
        controller._startResize({ offsetX: 12, offsetY: 100 }, 'row');
        canvasElement.dispatchEvent(pointerEvent('pointermove', 12, 98));
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(executeCommand).not.toHaveBeenCalled();

        controller._startResize({ offsetX: 12, offsetY: 100 }, 'row');
        for (const clientY of [0, 100]) {
            canvasElement.dispatchEvent(pointerEvent('pointermove', 12, clientY));
        }
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(executeCommand).not.toHaveBeenCalled();
    });

    it('shows a row or column resize handle for header selections and updates it on scroll', () => {
        const { controller } = createController();

        controller._handleSelectionChange([{
            range: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW },
            primary: null,
            style: null,
        }]);
        expect(controller._currentRow).toBe(4);
        expect(controller._rowResizeButton.visible).toBe(true);
        expect(controller._rowResizeButton).toMatchObject({
            left: 18,
            top: 118,
        });

        controller._handleSelectionChange([{
            range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
            primary: null,
            style: null,
        }]);
        expect(controller._currentColumn).toBe(3);
        expect(controller._columnResizeButton.visible).toBe(true);
        expect(controller._columnResizeButton).toMatchObject({
            left: 362,
            top: 6,
        });

        controller._updateButtonPositionOnScroll();
        expect(controller._columnResizeButton).toMatchObject({
            left: 362,
            top: 6,
        });
    });

    it('executes row and column resize commands after a meaningful touch drag', async () => {
        const { canvasElement, controller, executeCommand, scene } = createController();

        controller._currentRow = 2;
        controller._startResize({ offsetX: 12, offsetY: 60 }, 'row');
        canvasElement.dispatchEvent(pointerEvent('pointermove', 12, 90));
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(scene.disableObjectsEvent).toHaveBeenCalled();
        expect(scene.enableObjectsEvent).toHaveBeenCalled();
        expect(executeCommand).toHaveBeenCalledWith(DeltaRowHeightCommand.id, {
            deltaY: 15,
            anchorRow: 2,
        });
        await executeCommand.mock.results[0].value;

        executeCommand.mockClear();
        controller._currentColumn = 1;
        controller._startResize({ offsetX: 160, offsetY: 12 }, 'column');
        canvasElement.dispatchEvent(pointerEvent('pointermove', 200, 12));
        canvasElement.dispatchEvent(pointerEvent('pointerup'));
        expect(executeCommand).toHaveBeenCalledWith(DeltaColumnWidthCommand.id, {
            deltaX: 20,
            anchorCol: 1,
        });
        await executeCommand.mock.results[0].value;
    });

    it('centers the row resize handle inside the row header when an outline gutter is present', () => {
        const { controller, skeleton } = createController();
        skeleton.setMarginLeft(24);

        controller._handleSelectionChange([{
            range: { startRow: 2, endRow: 2, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW },
            primary: null,
            style: null,
        }]);

        expect(controller._rowResizeButton).toMatchObject({
            left: 42,
            top: 78,
        });

        controller._updateButtonPositionOnScroll();
        expect(controller._rowResizeButton).toMatchObject({
            left: 42,
            top: 78,
        });
    });
});
