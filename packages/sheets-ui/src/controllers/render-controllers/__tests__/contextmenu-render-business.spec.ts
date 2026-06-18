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
import { ContextMenuPosition } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { SheetContextMenuRenderController } from '../contextmenu.render-controller';

function createEventSubject() {
    const handlers = new Set<(evt: any) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: any) => void) => {
            handlers.add(handler);
            return { dispose: vi.fn(() => handlers.delete(handler)) };
        }),
        emit: (evt: any) => handlers.forEach((handler) => handler(evt)),
    };
}

function createController(rangeType = RANGE_TYPE.NORMAL) {
    const mainPointerDown$ = createEventSubject();
    const rowHeaderPointerDown$ = createEventSubject();
    const columnHeaderPointerDown$ = createEventSubject();
    const contextMenuService = { triggerContextMenu: vi.fn() };
    const selection = {
        range: {
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
            rangeType,
        },
    };
    const skeleton = {
        getNoMergeCellWithCoordByIndex: vi.fn((row: number, col: number) => ({
            startX: col * 50,
            endX: col * 50 + 49,
            startY: row * 20,
            endY: row * 20 + 19,
        })),
    };
    const controller = new SheetContextMenuRenderController(
        {
            mainComponent: { onPointerDown$: mainPointerDown$ },
            components: new Map([
                [SHEET_VIEW_KEY.ROW, { onPointerDown$: rowHeaderPointerDown$ }],
                [SHEET_VIEW_KEY.COLUMN, { onPointerDown$: columnHeaderPointerDown$ }],
            ]),
        } as any,
        contextMenuService as any,
        { getCurrentSelections: vi.fn(() => [selection]) } as any,
        { getSkeleton: vi.fn(() => skeleton) } as any,
        { has: vi.fn(() => false), get: vi.fn() } as any
    );

    return {
        columnHeaderPointerDown$,
        contextMenuService,
        controller,
        mainPointerDown$,
        rowHeaderPointerDown$,
    };
}

describe('SheetContextMenuRenderController business flows', () => {
    it('opens the main-area menu for right-clicks inside and outside normal cell selections', () => {
        const { contextMenuService, controller, mainPointerDown$ } = createController();

        mainPointerDown$.emit({ button: 0, offsetX: 60, offsetY: 30 });
        expect(contextMenuService.triggerContextMenu).not.toHaveBeenCalled();

        mainPointerDown$.emit({ button: 2, offsetX: 60, offsetY: 30 });
        mainPointerDown$.emit({ button: 2, offsetX: 500, offsetY: 300 });
        expect(contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(1, expect.objectContaining({ button: 2 }), ContextMenuPosition.MAIN_AREA);
        expect(contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(2, expect.objectContaining({ button: 2 }), ContextMenuPosition.MAIN_AREA);

        controller.dispose();
    });

    it('uses row and column menu positions for header selections and header components', () => {
        const row = createController(RANGE_TYPE.ROW);
        row.mainPointerDown$.emit({ button: 2, offsetX: 10, offsetY: 25 });
        row.rowHeaderPointerDown$.emit({ button: 2, offsetX: 10, offsetY: 25 });
        expect(row.contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(1, expect.any(Object), ContextMenuPosition.ROW_HEADER);
        expect(row.contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(2, expect.any(Object), ContextMenuPosition.ROW_HEADER);
        row.controller.dispose();

        const column = createController(RANGE_TYPE.COLUMN);
        column.mainPointerDown$.emit({ button: 2, offsetX: 75, offsetY: 10 });
        column.columnHeaderPointerDown$.emit({ button: 2, offsetX: 75, offsetY: 10 });
        expect(column.contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(1, expect.any(Object), ContextMenuPosition.COL_HEADER);
        expect(column.contextMenuService.triggerContextMenu).toHaveBeenNthCalledWith(2, expect.any(Object), ContextMenuPosition.COL_HEADER);
        column.controller.dispose();
    });
});
