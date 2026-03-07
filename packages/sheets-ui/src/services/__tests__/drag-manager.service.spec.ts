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

import type { IUniverInstanceService, Nullable, UnitModel, Workbook, Worksheet } from '@univerjs/core';
import type { IDragEvent, IRender, IRenderManagerService } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { IDragCellPosition } from '../drag-manager.service';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getHoverCellPosition } from '../../common/utils';
import { DragManagerService } from '../drag-manager.service';
import { SheetScrollManagerService } from '../scroll-manager.service';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

vi.mock('../../common/utils', () => ({
    getHoverCellPosition: vi.fn(),
}));

type DragManagerInstanceServiceStub = Pick<IUniverInstanceService, 'getCurrentTypeOfUnit$' | 'getCurrentUnitForType'>;
type DragManagerRenderManagerStub = Pick<IRenderManagerService, 'getRenderById'>;

function createRender() {
    return {
        with: vi.fn((token: unknown) => {
            if (token === SheetSkeletonManagerService) {
                return {
                    getCurrentParam: vi.fn(() => ({ skeleton: { id: 'skeleton' } })),
                };
            }

            if (token === SheetScrollManagerService) {
                return {
                    getCurrentScrollState: vi.fn(() => ({ x: 0, y: 0 })),
                };
            }

            return null;
        }),
    };
}

function createUniverInstanceService(
    currentType$: Subject<unknown>,
    workbook: Workbook | null
): DragManagerInstanceServiceStub {
    return {
        getCurrentTypeOfUnit$<T extends UnitModel<object, number>>(): Observable<Nullable<T>> {
            return currentType$.asObservable() as Observable<Nullable<T>>;
        },
        getCurrentUnitForType<T extends UnitModel<object, number>>(): Nullable<T> {
            return workbook as Nullable<T>;
        },
    };
}

function createRenderManagerService(render: ReturnType<typeof createRender>): DragManagerRenderManagerStub {
    return {
        getRenderById() {
            return render as unknown as IRender;
        },
    };
}

function createHoverPosition(workbook: Workbook, worksheet: Worksheet, row: number, col: number, position: IDragCellPosition['position']) {
    const location = { unitId: 'unit-1', subUnitId: 'sheet-1', workbook, worksheet, row, col };

    return {
        location,
        overflowLocation: location,
        position,
    };
}

function createDragEvent(offsetX: number, offsetY: number, dataTransfer: DataTransfer | null): IDragEvent {
    return {
        altKey: false,
        button: 0,
        buttons: 0,
        clientX: offsetX,
        clientY: offsetY,
        ctrlKey: false,
        currentState: null,
        dataTransfer: dataTransfer as DataTransfer,
        defaultPrevented: false,
        detail: 0,
        deviceType: 0 as never,
        eventPhase: 0,
        inputIndex: 0,
        isTrusted: false,
        metaKey: false,
        movementX: 0,
        movementY: 0,
        offsetX,
        offsetY,
        previousState: null,
        returnValue: true,
        shiftKey: false,
        srcElement: null,
        target: null,
        timeStamp: 0,
        type: 'drag',
        view: null,
        x: offsetX,
        y: offsetY,
        bubbles: false,
        cancelBubble: false,
        cancelable: false,
        composed: false,
        composedPath: () => [],
        initEvent: vi.fn(),
        preventDefault: vi.fn(),
        stopImmediatePropagation: vi.fn(),
        stopPropagation: vi.fn(),
        NONE: 0,
        CAPTURING_PHASE: 0,
        AT_TARGET: 0,
        BUBBLING_PHASE: 0,
        initUIEvent: vi.fn(),
    } as unknown as IDragEvent;
}

describe('DragManagerService', () => {
    it('publishes drag-over/drop positions and handles null active cell', () => {
        const mockGetHoverCellPosition = vi.mocked(getHoverCellPosition);
        const worksheet = { getSheetId: () => 'sheet-1' } as unknown as Worksheet;
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        } as unknown as Workbook;
        const currentType$ = new Subject<unknown>();

        const univerInstanceService = createUniverInstanceService(currentType$, workbook);

        const render = createRender();
        const renderManagerService = createRenderManagerService(render);

        const service = new DragManagerService(
            univerInstanceService as unknown as IUniverInstanceService,
            renderManagerService as unknown as IRenderManagerService
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const endCells: Array<Nullable<IDragCellPosition>> = [];
        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        mockGetHoverCellPosition.mockReturnValue(createHoverPosition(workbook, worksheet, 2, 3, { startX: 10, startY: 20, endX: 40, endY: 60 }));

        const dataTransfer = { files: [] } as unknown as DataTransfer;
        service.onDragOver(createDragEvent(12, 34, dataTransfer));
        expect(getHoverCellPosition).toHaveBeenCalledWith(
            render,
            workbook,
            worksheet,
            { skeleton: { id: 'skeleton' } },
            12,
            34
        );
        expect(currentCells.at(-1)).toEqual({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', workbook, worksheet, row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
            dataTransfer,
        });

        service.onDrop(createDragEvent(12, 34, dataTransfer));
        expect(endCells.at(-1)).toEqual({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', workbook, worksheet, row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
            dataTransfer,
        });

        mockGetHoverCellPosition.mockReturnValue(null);
        service.onDragOver(createDragEvent(1, 1, dataTransfer));
        service.onDrop(createDragEvent(1, 1, dataTransfer));
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
    });

    it('clears states when workbook becomes unavailable and supports dispose', () => {
        const currentType$ = new Subject<unknown>();
        const univerInstanceService = createUniverInstanceService(currentType$, null);
        const renderManagerService = createRenderManagerService(createRender());
        const service = new DragManagerService(
            univerInstanceService as unknown as IUniverInstanceService,
            renderManagerService as unknown as IRenderManagerService
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const endCells: Array<Nullable<IDragCellPosition>> = [];

        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        currentType$.next(null);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        service.onDragOver(createDragEvent(0, 0, null));
        service.onDrop(createDragEvent(0, 0, null));
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
        service.dispose();
    });

    it('deduplicates drag-over emissions when the pointer stays on the same cell', () => {
        const mockGetHoverCellPosition = vi.mocked(getHoverCellPosition);
        const worksheet = { getSheetId: () => 'sheet-1' } as unknown as Worksheet;
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        } as unknown as Workbook;

        const univerInstanceService = createUniverInstanceService(new Subject<unknown>(), workbook);
        const renderManagerService = createRenderManagerService(createRender());

        const service = new DragManagerService(
            univerInstanceService as unknown as IUniverInstanceService,
            renderManagerService as unknown as IRenderManagerService
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const currentSub = service.currentCell$.subscribe((value) => currentCells.push(value));

        mockGetHoverCellPosition
            .mockReturnValueOnce(createHoverPosition(workbook, worksheet, 2, 3, { startX: 10, startY: 20, endX: 30, endY: 40 }))
            .mockReturnValueOnce(createHoverPosition(workbook, worksheet, 2, 3, { startX: 11, startY: 21, endX: 31, endY: 41 }))
            .mockReturnValueOnce(createHoverPosition(workbook, worksheet, 4, 5, { startX: 12, startY: 22, endX: 32, endY: 42 }));

        service.onDragOver(createDragEvent(10, 20, { files: [] } as unknown as DataTransfer));
        service.onDragOver(createDragEvent(11, 21, { files: ['changed'] } as unknown as DataTransfer));
        service.onDragOver(createDragEvent(12, 22, { files: [] } as unknown as DataTransfer));

        expect(currentCells).toEqual([
            {
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', workbook, worksheet, row: 2, col: 3 },
                position: { startX: 10, startY: 20, endX: 30, endY: 40 },
                dataTransfer: { files: [] },
            },
            {
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', workbook, worksheet, row: 4, col: 5 },
                position: { startX: 12, startY: 22, endX: 32, endY: 42 },
                dataTransfer: { files: [] },
            },
        ]);

        currentSub.unsubscribe();
        service.dispose();
    });
});
