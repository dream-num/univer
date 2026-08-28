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
import { describe, expect, it, vi } from 'vitest';
import {
    SheetContextMenuMobileRenderController,
    shouldKeepCurrentSelectionForMobileContextMenu,
} from '../mobile/mobile-contextmenu.render-controller';

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

    it('delays the selected-tap menu so a double-tap remains available for editing', () => {
        vi.useFakeTimers();
        const contentElement = document.createElement('div');
        const canvas = document.createElement('canvas');
        contentElement.appendChild(canvas);
        document.body.appendChild(contentElement);

        const triggerContextMenu = vi.fn();
        const onDblclick$ = createEventSubject();
        const controller = new SheetContextMenuMobileRenderController(
            {
                unitId: 'unit-1',
                unit: { getActiveSheet: () => ({ getSheetId: () => 'sheet-1' }) },
                scene: { pick: () => null },
                mainComponent: { onDblclick$ },
            } as never,
            { getContentElement: () => contentElement } as never,
            { visible: false, triggerContextMenu, hideContextMenu: vi.fn() } as never,
            { getContextValue: () => false } as never,
            { getRenderUnitById: () => null } as never,
            {
                getCurrentSelections: () => [],
                setSelections: vi.fn(),
            } as never,
            { getCurrentParam: () => null } as never
        );
        Object.assign(controller as object, {
            _getTargetCellByOffset: () => ({
                mergeInfo: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 },
            }),
            _getSelectionSnapshot: () => [{
                range: { startRow: 1, endRow: 2, startColumn: 1, endColumn: 2 },
                primary: null,
                style: null,
            }],
        });
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
        dispatchPointer('pointerup');

        expect(triggerContextMenu).not.toHaveBeenCalled();
        vi.advanceTimersByTime(500);
        expect(triggerContextMenu).toHaveBeenCalledOnce();

        triggerContextMenu.mockClear();
        dispatchPointer('pointerdown');
        dispatchPointer('pointerup');
        dispatchPointer('pointerdown');
        dispatchPointer('pointerup');
        onDblclick$.emit();
        vi.advanceTimersByTime(500);
        expect(triggerContextMenu).not.toHaveBeenCalled();

        controller.dispose();
        contentElement.remove();
        vi.useRealTimers();
    });
});
