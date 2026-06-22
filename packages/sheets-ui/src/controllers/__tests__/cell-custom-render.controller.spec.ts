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

import { UnitAction } from '@univerjs/protocol';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CellCustomRenderController } from '../cell-custom-render.controller';

function createEventSubject() {
    const subscribers = new Set<(evt: any) => void>();

    return {
        subscribeEvent: vi.fn((handler: (evt: any) => void) => {
            subscribers.add(handler);
            const unsubscribe = vi.fn(() => subscribers.delete(handler));

            return { dispose: unsubscribe, unsubscribe };
        }),
        emit: (evt: any) => subscribers.forEach((handler) => handler(evt)),
    };
}

function createController(options?: { editable?: boolean; selectionEditable?: boolean }) {
    const pointerDown$ = createEventSubject();
    const pointerMove$ = createEventSubject();
    const renderA = {
        zIndex: 1,
        isHit: vi.fn(() => true),
        onPointerDown: vi.fn(),
        onPointerEnter: vi.fn(),
        onPointerLeave: vi.fn(),
    };
    const renderB = {
        zIndex: 2,
        isHit: vi.fn(() => false),
        onPointerEnter: vi.fn(),
        onPointerLeave: vi.fn(),
    };
    const cellData = {
        customRender: [renderB, renderA],
        selectionProtection: [{ [UnitAction.Edit]: options?.selectionEditable ?? true }],
    };
    const worksheet = {
        getSheetId: vi.fn(() => 'sheet-1'),
        getMergedCell: vi.fn(() => null),
        getCell: vi.fn(() => cellData),
    };
    const skeleton = {
        worksheet,
        getCellIndexByOffset: vi.fn(() => ({ row: 1, column: 2 })),
        getStyles: vi.fn(() => ({ getStyleByCell: vi.fn(() => ({ fs: 12 })) })),
        getCellWithCoordByIndex: vi.fn(() => ({ startX: 10, startY: 20 })),
    };
    const currentSkeleton$ = new Subject<any>();
    const spreadsheet = {
        onPointerDown$: pointerDown$,
        onPointerMove$: pointerMove$,
    };
    const scene = {
        getActiveViewportByCoord: vi.fn(() => ({ viewportScrollX: 5, viewportScrollY: 6 })),
        getAncestorScale: vi.fn(() => ({ scaleX: 2, scaleY: 2 })),
    };
    const controller = new CellCustomRenderController(
        {
            unitId: 'unit-1',
            unit: { getActiveSheet: vi.fn(() => worksheet) },
        } as any,
        {
            currentSkeleton$,
            getCurrentParam: vi.fn(() => ({ skeleton })),
        } as any,
        {
            getRenderById: vi.fn(() => ({ mainComponent: spreadsheet, scene })),
        } as any,
        {
            composePermission: vi.fn(() => [{ value: options?.editable ?? true }]),
        } as any
    );

    return { controller, pointerDown$, pointerMove$, renderA, renderB, currentSkeleton$, skeleton, worksheet };
}

describe('CellCustomRenderController', () => {
    it('dispatches pointer events to hit custom renderers when sheet and cell are editable', async () => {
        const { controller, pointerDown$, pointerMove$, renderA, renderB } = createController();

        pointerDown$.emit({ offsetX: 20, offsetY: 30 });
        pointerMove$.emit({ offsetX: 20, offsetY: 30 });
        await new Promise((resolve) => setTimeout(resolve, 35));
        renderA.isHit.mockReturnValue(false);
        pointerMove$.emit({ offsetX: 200, offsetY: 300 });
        await new Promise((resolve) => setTimeout(resolve, 35));

        expect(renderA.onPointerDown).toHaveBeenCalled();
        expect(renderA.onPointerEnter).toHaveBeenCalled();
        expect(renderA.onPointerLeave).toHaveBeenCalled();
        expect(renderB.onPointerEnter).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('does not dispatch pointer down when workbook or protected cell is not editable', () => {
        const nonEditable = createController({ editable: false });
        nonEditable.pointerDown$.emit({ offsetX: 20, offsetY: 30 });
        expect(nonEditable.renderA.onPointerDown).not.toHaveBeenCalled();
        nonEditable.controller.dispose();

        const protectedCell = createController({ selectionEditable: false });
        protectedCell.pointerDown$.emit({ offsetX: 20, offsetY: 30 });
        expect(protectedCell.renderA.onPointerDown).not.toHaveBeenCalled();
        protectedCell.controller.dispose();
    });
});
