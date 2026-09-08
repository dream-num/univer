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

// @vitest-environment jsdom

import type { BehaviorSubject } from 'rxjs';
import { RANGE_TYPE } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SelectionMoveType, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuPosition, ContextMenuService, DesktopLayoutService, IContextMenuService, ILayoutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { createRenderTestBed } from '../../__tests__/render-test-bed';
import {
    getMobileContextMenuPositionByViewportKey,
    SheetContextMenuMobileRenderController,
    shouldKeepCurrentSelectionForMobileContextMenu,
} from '../mobile-contextmenu.render-controller';

describe('mobile context menu helpers', () => {
    it('keeps the current selection when long-pressing inside it', () => {
        expect(shouldKeepCurrentSelectionForMobileContextMenu([
            {
                range: { startRow: 1, endRow: 3, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ], {
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(true);
    });

    it('replaces the current selection when long-pressing outside it', () => {
        expect(shouldKeepCurrentSelectionForMobileContextMenu([
            {
                range: { startRow: 1, endRow: 3, startColumn: 2, endColumn: 4, rangeType: RANGE_TYPE.NORMAL },
                primary: null,
                style: null,
            },
        ], {
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(false);
    });

    it('maps sheet viewports to the corresponding mobile context menu', () => {
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_MAIN)).toBe(ContextMenuPosition.MAIN_AREA);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP)).toBe(ContextMenuPosition.MAIN_AREA);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP)).toBe(ContextMenuPosition.ROW_HEADER);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM)).toBe(ContextMenuPosition.ROW_HEADER);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT)).toBe(ContextMenuPosition.COL_HEADER);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT)).toBe(ContextMenuPosition.COL_HEADER);
        expect(getMobileContextMenuPositionByViewportKey(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP)).toBeNull();
    });

    it('lets a feature handle a scrolled main-area long press at the touched cell', async () => {
        vi.useFakeTimers();
        const contentElement = document.createElement('div');
        const canvas = document.createElement('canvas');
        contentElement.appendChild(canvas);
        document.body.appendChild(contentElement);

        const triggerContextMenu = vi.fn();
        const testBed = createRenderTestBed({
            dependencies: [
                [IContextMenuService, { useClass: ContextMenuService }],
                [ILayoutService, { useClass: DesktopLayoutService }],
            ],
        });
        const { commandService, context, injector, scene, sheet, skeleton, viewportMap } = testBed;
        const layoutRegistration = injector.get(ILayoutService).registerContentElement(contentElement);
        const contextMenuRegistration = injector.get(IContextMenuService).registerContextMenuHandler({
            visible: false,
            handleContextMenu: triggerContextMenu,
            hideContextMenu: vi.fn(),
        });
        const worksheet = sheet.getActiveSheet();
        const selectionManagerService = injector.get(SheetsSelectionsService);
        commandService.registerCommand(SetSelectionsOperation);
        selectionManagerService.setSelections(
            sheet.getUnitId(),
            worksheet.getSheetId(),
            [{
                range: { startRow: 6, endRow: 6, startColumn: 3, endColumn: 3 },
                primary: null,
                style: null,
            }],
            SelectionMoveType.MOVE_END
        );
        viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN)!.viewportScrollX = 100;
        Object.assign(scene, { pick: () => null });
        Object.assign(skeleton, {
            getCellWithCoordByOffset: (
                offsetX: number,
                offsetY: number,
                scaleX: number,
                scaleY: number,
                scrollXY: { x: number; y: number }
            ) => {
                const actualColumn = Math.floor((offsetX / scaleX + scrollXY.x - 46) / 100);
                const actualRow = Math.floor((offsetY / scaleY + scrollXY.y - 20) / 20);
                return {
                    actualColumn,
                    actualRow,
                    endX: (actualColumn + 1) * 100 + 46,
                    endY: (actualRow + 1) * 20 + 20,
                    isMerged: false,
                    isMergedMainCell: false,
                    mergeInfo: {
                        endColumn: actualColumn,
                        endRow: actualRow,
                        endX: (actualColumn + 1) * 100 + 46,
                        endY: (actualRow + 1) * 20 + 20,
                        startColumn: actualColumn,
                        startRow: actualRow,
                        startX: actualColumn * 100 + 46,
                        startY: actualRow * 20 + 20,
                    },
                    startX: actualColumn * 100 + 46,
                    startY: actualRow * 20 + 20,
                };
            },
        });
        const mainComponent = context.mainComponent;
        if (!mainComponent) throw new Error('Expected the sheet render component to be available.');
        testBed.renderManagerService.removeRender(sheet.getUnitId());
        const controller = injector.createInstance(SheetContextMenuMobileRenderController, context);
        const handleLongPress = vi.fn();
        const contextMenuInterceptor = Reflect.get(controller, 'contextMenuInterceptor') as undefined | {
            getInterceptPoints: () => { MOBILE_CONTEXT_MENU: unknown };
            intercept: (
                point: unknown,
                interceptor: { handler: (value: unknown, context: unknown) => boolean }
            ) => () => void;
        };
        expect(contextMenuInterceptor).toBeDefined();
        const disposeInterceptor = contextMenuInterceptor!.intercept(
            contextMenuInterceptor!.getInterceptPoints().MOBILE_CONTEXT_MENU,
            {
                handler: (_value, longPressContext) => {
                    handleLongPress(longPressContext);
                    return true;
                },
            }
        );
        canvas.addEventListener('pointerup', (event) => event.stopPropagation());

        const dispatchPointer = (type: string) => {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
                button: { value: 0 },
                isPrimary: { value: true },
                clientX: { value: 320 },
                clientY: { value: 150 },
                pointerId: { value: 1 },
            });
            canvas.dispatchEvent(event);
        };
        dispatchPointer('pointerdown');
        expect(selectionManagerService.getCurrentLastSelection()?.range).toEqual({
            startRow: 6,
            endRow: 6,
            startColumn: 3,
            endColumn: 3,
        });
        expect(triggerContextMenu).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(499);
        expect(triggerContextMenu).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);
        expect(selectionManagerService.getCurrentLastSelection()?.range).toEqual({
            startRow: 6,
            endRow: 6,
            startColumn: 3,
            endColumn: 3,
        });
        expect(handleLongPress).toHaveBeenCalledWith({
            col: 3,
            menuPosition: ContextMenuPosition.MAIN_AREA,
            row: 6,
            subUnitId: worksheet.getSheetId(),
            unitId: sheet.getUnitId(),
        });
        expect(triggerContextMenu).not.toHaveBeenCalled();
        dispatchPointer('pointerup');

        disposeInterceptor();
        dispatchPointer('pointerdown');
        await vi.advanceTimersByTimeAsync(500);
        expect(triggerContextMenu).toHaveBeenCalledWith(
            expect.any(MouseEvent),
            ContextMenuPosition.MAIN_AREA,
            { unitId: sheet.getUnitId() }
        );
        dispatchPointer('pointerup');

        controller.dispose();
        contextMenuRegistration.dispose();
        layoutRegistration.dispose();
        contentElement.remove();
        testBed.univer.dispose();
        vi.useRealTimers();
    });

    it('cancels a pending row-header long press when the render is deactivated', async () => {
        vi.useFakeTimers();
        const contentElement = document.createElement('div');
        const canvas = document.createElement('canvas');
        contentElement.appendChild(canvas);
        document.body.appendChild(contentElement);

        const triggerContextMenu = vi.fn();
        const testBed = createRenderTestBed({
            dependencies: [
                [IContextMenuService, { useClass: ContextMenuService }],
                [ILayoutService, { useClass: DesktopLayoutService }],
            ],
        });
        const { context, injector, renderManagerService, scene, sheet, viewportMap } = testBed;
        const layoutRegistration = injector.get(ILayoutService).registerContentElement(contentElement);
        const contextMenuRegistration = injector.get(IContextMenuService).registerContextMenuHandler({
            visible: false,
            handleContextMenu: triggerContextMenu,
            hideContextMenu: vi.fn(),
        });
        Object.assign(scene, {
            getActiveViewportByCoord: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP),
            pick: () => null,
        });
        renderManagerService.removeRender(sheet.getUnitId());
        const controller = injector.createInstance(SheetContextMenuMobileRenderController, context);

        const event = new Event('pointerdown', { bubbles: true, cancelable: true });
        Object.defineProperties(event, {
            button: { value: 0 },
            isPrimary: { value: true },
            clientX: { value: 20 },
            clientY: { value: 20 },
            pointerId: { value: 1 },
        });
        canvas.dispatchEvent(event);
        (context.activated$ as BehaviorSubject<boolean>).next(false);
        await vi.advanceTimersByTimeAsync(500);
        expect(triggerContextMenu).not.toHaveBeenCalled();

        (context.activated$ as BehaviorSubject<boolean>).next(true);
        canvas.dispatchEvent(event);
        await vi.advanceTimersByTimeAsync(500);

        expect(triggerContextMenu).toHaveBeenCalledWith(
            expect.any(MouseEvent),
            ContextMenuPosition.ROW_HEADER,
            { unitId: sheet.getUnitId() }
        );

        controller.dispose();
        contextMenuRegistration.dispose();
        layoutRegistration.dispose();
        contentElement.remove();
        testBed.univer.dispose();
        vi.useRealTimers();
    });
});
