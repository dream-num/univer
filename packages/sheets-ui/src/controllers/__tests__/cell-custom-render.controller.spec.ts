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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { IPointerEvent } from '@univerjs/engine-render';
import { EventSubject, IPermissionService, Univer, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { UnitAction } from '@univerjs/protocol';
import {
    INTERCEPTOR_POINT,
    SheetInterceptorService,
    SheetSkeletonService,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { CellCustomRenderController } from '../cell-custom-render.controller';

const testUnivers: Univer[] = [];
afterEach(() => testUnivers.splice(0).forEach((univer) => univer.dispose()));

function createController(options?: {
    editable?: boolean;
    selectionEditable?: boolean;
    clearProjectionOnPointerDown?: boolean;
}) {
    const univer = new Univer();
    testUnivers.push(univer);
    const injector = univer.__getInjector();
    const pointerDown$ = new EventSubject<IPointerEvent>();
    const pointerMove$ = new EventSubject<IPointerEvent>();
    const renderA = {
        drawWith: vi.fn(),
        zIndex: 1,
        isHit: vi.fn(() => true),
        onPointerDown: vi.fn(),
        onPointerEnter: vi.fn(),
        onPointerLeave: vi.fn(),
    };
    const renderB = {
        drawWith: vi.fn(),
        zIndex: 2,
        isHit: vi.fn(() => false),
        onPointerEnter: vi.fn(),
        onPointerLeave: vi.fn(),
    };
    const spreadsheet = {
        onPointerDown$: pointerDown$,
        onPointerMove$: pointerMove$,
    };
    const scene = {
        onTransformChange$: new EventSubject(),
        getActiveViewportByCoord: () => ({ viewportScrollX: 0, viewportScrollY: 0 }),
        getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
    };
    injector.add([IRenderManagerService, { useValue: {
        getRenderUnitById: () => ({ mainComponent: spreadsheet, scene }),
    } as never }]);
    injector.add([SheetInterceptorService]);
    injector.add([SheetSkeletonService]);
    const interceptors = injector.get(SheetInterceptorService);
    injector.get(SheetSkeletonService);
    interceptors.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
        handler: (cell, _location, next) => {
            const displayCell = {
                ...cell,
                customRender: [renderB, renderA],
                selectionProtection: [{ [UnitAction.Edit]: options?.selectionEditable ?? true }],
            };
            return next(displayCell);
        },
    });
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit-1',
        sheetOrder: ['sheet-1'],
        sheets: { 'sheet-1': { id: 'sheet-1', rowCount: 4, columnCount: 4 } },
    });
    const context = { unitId: workbook.getUnitId(), unit: workbook, scene };
    injector.add([SheetSkeletonManagerService, {
        useFactory: function createSkeletonManager() {
            return injector.createInstance(SheetSkeletonManagerService, context as never);
        },
    }]);
    const skeletons = injector.get(SheetSkeletonManagerService);
    skeletons.setCurrent({ sheetId: 'sheet-1' });
    const skeleton = skeletons.getCurrentSkeleton()!;
    const permissionService = injector.get(IPermissionService);
    const workbookPermission = new WorkbookEditablePermission('unit-1');
    workbookPermission.value = options?.editable ?? true;
    permissionService.addPermissionPoint(workbookPermission);
    permissionService.addPermissionPoint(new WorksheetEditPermission('unit-1', 'sheet-1'));
    if (options?.clearProjectionOnPointerDown) {
        skeletons.setProjection('sheet-1', { isRowFiltered: (row) => row === 0, getCell: () => undefined });
        pointerDown$.subscribeEvent(() => skeletons.setProjection('sheet-1', undefined));
    }
    injector.add([CellCustomRenderController, {
        useFactory: function createRenderController() {
            return injector.createInstance(CellCustomRenderController, context as never);
        },
    }]);
    return {
        injector,
        pointerDown$,
        pointerMove$,
        renderA,
        renderB,
        skeletons,
        event: {
            offsetX: skeleton.rowHeaderWidth + 5,
            offsetY: skeleton.columnHeaderHeight + 5,
        } as IPointerEvent,
    };
}

afterEach(() => vi.useRealTimers());

describe('CellCustomRenderController', () => {
    it('dispatches pointer events to hit custom renderers when sheet and cell are editable', async () => {
        vi.useFakeTimers();
        const { injector, pointerDown$, pointerMove$, renderA, renderB, event } = createController();
        const controller = injector.get(CellCustomRenderController);

        pointerDown$.emitEvent(event);
        pointerMove$.emitEvent(event);
        await vi.advanceTimersByTimeAsync(35);
        renderA.isHit.mockReturnValue(false);
        pointerMove$.emitEvent(event);
        await vi.advanceTimersByTimeAsync(35);

        expect(renderA.onPointerDown).toHaveBeenCalled();
        expect(renderA.onPointerEnter).toHaveBeenCalled();
        expect(renderA.onPointerLeave).toHaveBeenCalled();
        expect(renderB.onPointerEnter).not.toHaveBeenCalled();

        controller.dispose();
    });

    it('does not dispatch pointer down when workbook or protected cell is not editable', () => {
        const nonEditable = createController({ editable: false });
        nonEditable.injector.get(CellCustomRenderController);
        nonEditable.pointerDown$.emitEvent(nonEditable.event);
        expect(nonEditable.renderA.onPointerDown).not.toHaveBeenCalled();

        const protectedCell = createController({ selectionEditable: false });
        protectedCell.injector.get(CellCustomRenderController);
        protectedCell.pointerDown$.emitEvent(protectedCell.event);
        expect(protectedCell.renderA.onPointerDown).not.toHaveBeenCalled();
    });

    it('uses the live skeleton when an earlier pointer handler clears the display projection', () => {
        const bed = createController({ clearProjectionOnPointerDown: true });
        bed.injector.get(CellCustomRenderController);
        expect(bed.skeletons.hasProjection('sheet-1')).toBe(true);
        expect(() => bed.pointerDown$.emitEvent(bed.event)).not.toThrow();
        expect(bed.skeletons.hasProjection('sheet-1')).toBe(false);
        expect(bed.renderA.onPointerDown).toHaveBeenCalledWith(expect.objectContaining({ row: 0, col: 0 }), bed.event);
    });
});
