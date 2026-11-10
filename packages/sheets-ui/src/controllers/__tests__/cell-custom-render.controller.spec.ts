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
import type { IPointerEvent, IRenderContext } from '@univerjs/engine-render';
import { EventSubject, Injector, IPermissionService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { CellCustomRenderController } from '../cell-custom-render.controller';

function createController(options?: { editable?: boolean; selectionEditable?: boolean }) {
    const pointerDown$ = new EventSubject<Pick<IPointerEvent, 'offsetX' | 'offsetY'>>();
    const pointerMove$ = new EventSubject<Pick<IPointerEvent, 'offsetX' | 'offsetY'>>();
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
        getComposedCellStyleByCellData: vi.fn(() => ({ fs: 12 })),
    };
    const skeleton = {
        worksheet,
        getCellIndexByOffset: vi.fn(() => ({ row: 1, column: 2 })),
        getCellWithCoordByIndex: vi.fn(() => ({ startX: 10, startY: 20 })),
    };
    const currentSkeleton$ = new Subject<{ skeleton: typeof skeleton }>();
    const spreadsheet = {
        onPointerDown$: pointerDown$,
        onPointerMove$: pointerMove$,
    };
    const scene = {
        getActiveViewportByCoord: vi.fn(() => ({ viewportScrollX: 5, viewportScrollY: 6 })),
        getAncestorScale: vi.fn(() => ({ scaleX: 2, scaleY: 2 })),
    };
    const context = {
        unitId: 'unit-1',
        unit: { getActiveSheet: vi.fn(() => worksheet) },
    } as unknown as IRenderContext<Workbook>;
    const injector = new Injector([
        [SheetSkeletonManagerService, {
            useValue: {
                currentSkeleton$,
                getCurrentParam: vi.fn(() => ({ skeleton })),
            },
        }],
        [IRenderManagerService, {
            useValue: {
                getRenderUnitById: vi.fn(() => ({ mainComponent: spreadsheet, scene })),
            },
        }],
        [IPermissionService, {
            useValue: {
                composePermission: vi.fn(() => [{ value: options?.editable ?? true }]),
            },
        }],
    ]);

    return { injector, context, pointerDown$, pointerMove$, renderA, renderB };
}

afterEach(() => vi.useRealTimers());

describe('CellCustomRenderController', () => {
    it('dispatches pointer events to hit custom renderers when sheet and cell are editable', async () => {
        vi.useFakeTimers();
        const { injector, context, pointerDown$, pointerMove$, renderA, renderB } = createController();
        const controller = injector.createInstance(CellCustomRenderController, context);

        pointerDown$.emitEvent({ offsetX: 20, offsetY: 30 });
        pointerMove$.emitEvent({ offsetX: 20, offsetY: 30 });
        await vi.advanceTimersByTimeAsync(35);
        renderA.isHit.mockReturnValue(false);
        pointerMove$.emitEvent({ offsetX: 200, offsetY: 300 });
        await vi.advanceTimersByTimeAsync(35);

        expect(renderA.onPointerDown).toHaveBeenCalled();
        expect(renderA.onPointerEnter).toHaveBeenCalled();
        expect(renderA.onPointerLeave).toHaveBeenCalled();
        expect(renderB.onPointerEnter).not.toHaveBeenCalled();

        controller.dispose();
        injector.dispose();
    });

    it.each([
        { editable: false, selectionEditable: true },
        { editable: true, selectionEditable: false },
    ])('does not dispatch pointer down when editing is denied: %j', (permissions) => {
        const { injector, context, pointerDown$, renderA } = createController(permissions);
        const controller = injector.createInstance(CellCustomRenderController, context);
        pointerDown$.emitEvent({ offsetX: 20, offsetY: 30 });
        expect(renderA.onPointerDown).not.toHaveBeenCalled();
        controller.dispose();
        injector.dispose();
    });
});
