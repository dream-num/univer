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

import { RANGE_TYPE } from '@univerjs/core';
import { SelectionMoveType, SheetsSelectionsService } from '@univerjs/sheets';
import { ContextMenuService, DesktopLayoutService, IContextMenuService, ILayoutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { createRenderTestBed } from '../../__tests__/render-test-bed';
import {
    SheetContextMenuMobileRenderController,
    shouldKeepCurrentSelectionForMobileContextMenu,
} from '../mobile-contextmenu.render-controller';

function createEventSubject() {
    const listeners: Array<() => void> = [];
    return {
        subscribeEvent: (listener: () => void) => {
            listeners.push(listener);
            return { dispose: vi.fn() };
        },
        emit: () => listeners.forEach((listener) => listener()),
    };
}

describe('mobile context menu helpers', () => {
    it('opens on a second tap inside the current selection', () => {
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

    it('keeps the menu closed when tapping outside the current selection', () => {
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

    it('delays the selected-tap menu so a double-tap remains available for editing', async () => {
        vi.useFakeTimers();
        const contentElement = document.createElement('div');
        const canvas = document.createElement('canvas');
        contentElement.appendChild(canvas);
        document.body.appendChild(contentElement);

        const triggerContextMenu = vi.fn();
        const onDblclick$ = createEventSubject();
        const testBed = createRenderTestBed({
            dependencies: [
                [IContextMenuService, { useClass: ContextMenuService }],
                [ILayoutService, { useClass: DesktopLayoutService }],
            ],
        });
        const { context, injector, scene, sheet, skeleton } = testBed;
        const layoutRegistration = injector.get(ILayoutService).registerContentElement(contentElement);
        const contextMenuRegistration = injector.get(IContextMenuService).registerContextMenuHandler({
            visible: false,
            handleContextMenu: triggerContextMenu,
            hideContextMenu: vi.fn(),
        });
        const worksheet = sheet.getActiveSheet();
        const selectionManagerService = injector.get(SheetsSelectionsService);
        selectionManagerService.setSelections(
            sheet.getUnitId(),
            worksheet.getSheetId(),
            [{
                range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
                primary: null,
                style: null,
            }],
            SelectionMoveType.MOVE_END
        );
        Object.assign(scene, { pick: () => null });
        Object.assign(skeleton, {
            getCellWithCoordByOffset: () => ({
                actualColumn: 1,
                actualRow: 1,
                endX: 200,
                endY: 40,
                isMerged: false,
                isMergedMainCell: false,
                mergeInfo: {
                    endColumn: 1,
                    endRow: 1,
                    endX: 200,
                    endY: 40,
                    startColumn: 1,
                    startRow: 1,
                    startX: 100,
                    startY: 20,
                },
                startX: 100,
                startY: 20,
            }),
        });
        const mainComponent = context.mainComponent;
        if (!mainComponent) throw new Error('Expected the sheet render component to be available.');
        Object.assign(mainComponent, { onDblclick$ });
        testBed.renderManagerService.removeRender(sheet.getUnitId());
        const controller = injector.createInstance(SheetContextMenuMobileRenderController, context);
        canvas.addEventListener('pointerup', (event) => event.stopPropagation());

        const dispatchPointer = (type: string) => {
            const event = new Event(type, { bubbles: true, cancelable: true });
            Object.defineProperties(event, {
                isPrimary: { value: true },
                clientX: { value: 20 },
                clientY: { value: 20 },
            });
            canvas.dispatchEvent(event);
        };
        dispatchPointer('pointerdown');
        expect(selectionManagerService.getCurrentLastSelection()?.range).toEqual({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        });
        dispatchPointer('pointerup');

        expect(triggerContextMenu).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(500);
        expect(triggerContextMenu).toHaveBeenCalledOnce();

        triggerContextMenu.mockClear();
        dispatchPointer('pointerdown');
        dispatchPointer('pointerup');
        dispatchPointer('pointerdown');
        dispatchPointer('pointerup');
        onDblclick$.emit();
        await vi.advanceTimersByTimeAsync(500);
        expect(triggerContextMenu).not.toHaveBeenCalled();

        controller.dispose();
        contextMenuRegistration.dispose();
        layoutRegistration.dispose();
        contentElement.remove();
        testBed.univer.dispose();
        vi.useRealTimers();
    });
});
