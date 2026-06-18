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

import { RANGE_TYPE } from '@univerjs/core';
import { DeltaColumnWidthCommand, DeltaRowHeightCommand } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { MobileHeaderResizeRenderController } from '../mobile-header-resize.render-controller';

function createButton() {
    return {
        visible: false,
        transformByState: vi.fn(function (this: any, state) {
            Object.assign(this, state);
            return this;
        }),
        setShapeProps: vi.fn(),
        show: vi.fn(function (this: any) {
            this.visible = true;
        }),
        hide: vi.fn(function (this: any) {
            this.visible = false;
        }),
        dispose: vi.fn(),
        onPointerDown$: { subscribeEvent: vi.fn() },
    };
}

function createController() {
    const canvasListeners = new Map<string, EventListener>();
    const canvasElement = {
        addEventListener: vi.fn((type: string, handler: EventListener) => canvasListeners.set(type, handler)),
        removeEventListener: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0 })),
    };
    const scene = {
        addObjects: vi.fn(),
        addObject: vi.fn((shape: any) => {
            shape.dispose ??= vi.fn();
            shape.transformByState ??= vi.fn(() => shape);
        }),
        getAncestorScale: vi.fn(() => ({ scaleX: 1, scaleY: 1 })),
        getEngine: vi.fn(() => ({ getCanvasElement: () => canvasElement, width: 800, height: 600 })),
        disableObjectsEvent: vi.fn(),
        enableObjectsEvent: vi.fn(),
    };
    const skeleton = {
        rowHeaderWidth: 48,
        columnHeaderHeight: 24,
        columnTotalWidth: 1000,
        rowTotalHeight: 2000,
        getOffsetByRow: vi.fn((row: number) => (row + 1) * 20),
        getOffsetByColumn: vi.fn((col: number) => (col + 1) * 80),
        getNoMergeCellWithCoordByIndex: vi.fn((row: number, col: number) => ({
            startX: col * 80,
            endX: (col + 1) * 80,
            startY: row * 20,
            endY: (row + 1) * 20,
        })),
    };
    const controller = Object.create(MobileHeaderResizeRenderController.prototype) as any;
    controller._context = {
        scene,
        unit: {
            getActiveSheet: vi.fn(() => ({ getZoomRatio: vi.fn(() => 2) })),
        },
    };
    controller._sheetSkeletonManagerService = {
        getCurrentSkeleton: vi.fn(() => skeleton),
    };
    controller._commandService = { executeCommand: vi.fn() };
    controller._contextService = { getContextValue: vi.fn(() => false) };
    controller._rowResizeButton = createButton();
    controller._columnResizeButton = createButton();
    controller.disposeWithMe = vi.fn();

    return { canvasElement, canvasListeners, controller, scene, skeleton };
}

describe('MobileHeaderResizeRenderController business methods', () => {
    it('shows a row or column resize handle for header selections and updates it on scroll', () => {
        const { controller } = createController();

        controller._handleSelectionChange([{
            range: { startRow: 2, endRow: 4, startColumn: 0, endColumn: 0, rangeType: RANGE_TYPE.ROW },
        }]);
        expect(controller._currentRow).toBe(4);
        expect(controller._rowResizeButton.show).toHaveBeenCalled();
        expect(controller._rowResizeButton.transformByState).toHaveBeenCalledWith({
            left: 18,
            top: 94,
        });

        controller._handleSelectionChange([{
            range: { startRow: 0, endRow: 0, startColumn: 1, endColumn: 3, rangeType: RANGE_TYPE.COLUMN },
        }]);
        expect(controller._currentColumn).toBe(3);
        expect(controller._columnResizeButton.show).toHaveBeenCalled();
        expect(controller._columnResizeButton.transformByState).toHaveBeenCalledWith({
            left: 314,
            top: 6,
        });

        controller._updateButtonPositionOnScroll();
        expect(controller._columnResizeButton.transformByState).toHaveBeenLastCalledWith({
            left: 314,
            top: 6,
        });
    });

    it('executes row and column resize commands after a meaningful touch drag', () => {
        const { canvasListeners, controller, scene } = createController();

        controller._currentRow = 2;
        controller._startResize({ offsetX: 12, offsetY: 60 }, 'row');
        canvasListeners.get('touchmove')!({
            touches: [{ clientX: 12, clientY: 90 }],
            preventDefault: vi.fn(),
        } as unknown as Event);
        canvasListeners.get('touchend')!({ preventDefault: vi.fn() } as unknown as Event);
        expect(scene.disableObjectsEvent).toHaveBeenCalled();
        expect(scene.enableObjectsEvent).toHaveBeenCalled();
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(DeltaRowHeightCommand.id, {
            deltaY: 15,
            anchorRow: 2,
        });

        controller._commandService.executeCommand.mockClear();
        controller._currentColumn = 1;
        controller._startResize({ offsetX: 160, offsetY: 12 }, 'column');
        canvasListeners.get('touchmove')!({
            touches: [{ clientX: 200, clientY: 12 }],
            preventDefault: vi.fn(),
        } as unknown as Event);
        canvasListeners.get('touchend')!({ preventDefault: vi.fn() } as unknown as Event);
        expect(controller._commandService.executeCommand).toHaveBeenCalledWith(DeltaColumnWidthCommand.id, {
            deltaX: 20,
            anchorCol: 1,
        });
    });
});
