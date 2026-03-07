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

import type { Nullable } from '@univerjs/core';
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

describe('DragManagerService', () => {
    it('publishes drag-over/drop positions and handles null active cell', () => {
        const mockGetHoverCellPosition = vi.mocked(getHoverCellPosition);
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const currentType$ = new Subject<unknown>();

        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => currentType$.asObservable()),
            getCurrentUnitForType: vi.fn(() => workbook),
        };

        const render = createRender();
        const renderManagerService = {
            getRenderById: vi.fn(() => render),
        };

        const service = new DragManagerService(
            univerInstanceService as ConstructorParameters<typeof DragManagerService>[0],
            renderManagerService as ConstructorParameters<typeof DragManagerService>[1]
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const endCells: Array<Nullable<IDragCellPosition>> = [];
        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        mockGetHoverCellPosition.mockReturnValue({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
        });

        const dataTransfer = { files: [] } as unknown as DataTransfer;
        service.onDragOver({ offsetX: 12, offsetY: 34, dataTransfer } as Parameters<DragManagerService['onDragOver']>[0]);
        expect(getHoverCellPosition).toHaveBeenCalledWith(
            render,
            workbook,
            worksheet,
            { skeleton: { id: 'skeleton' } },
            12,
            34
        );
        expect(currentCells.at(-1)).toEqual({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
            dataTransfer,
        });

        service.onDrop({ offsetX: 12, offsetY: 34, dataTransfer } as Parameters<DragManagerService['onDrop']>[0]);
        expect(endCells.at(-1)).toEqual({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
            dataTransfer,
        });

        mockGetHoverCellPosition.mockReturnValue(null);
        service.onDragOver({ offsetX: 1, offsetY: 1, dataTransfer } as Parameters<DragManagerService['onDragOver']>[0]);
        service.onDrop({ offsetX: 1, offsetY: 1, dataTransfer } as Parameters<DragManagerService['onDrop']>[0]);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
    });

    it('clears states when workbook becomes unavailable and supports dispose', () => {
        const currentType$ = new Subject<unknown>();
        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => currentType$.asObservable()),
            getCurrentUnitForType: vi.fn(() => null),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => createRender()),
        };
        const service = new DragManagerService(
            univerInstanceService as ConstructorParameters<typeof DragManagerService>[0],
            renderManagerService as ConstructorParameters<typeof DragManagerService>[1]
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const endCells: Array<Nullable<IDragCellPosition>> = [];

        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        currentType$.next(null);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        service.onDragOver({ offsetX: 0, offsetY: 0, dataTransfer: null } as Parameters<DragManagerService['onDragOver']>[0]);
        service.onDrop({ offsetX: 0, offsetY: 0, dataTransfer: null } as Parameters<DragManagerService['onDrop']>[0]);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
        service.dispose();
    });

    it('deduplicates drag-over emissions when the pointer stays on the same cell', () => {
        const mockGetHoverCellPosition = vi.mocked(getHoverCellPosition);
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };

        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => new Subject<unknown>().asObservable()),
            getCurrentUnitForType: vi.fn(() => workbook),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => createRender()),
        };

        const service = new DragManagerService(
            univerInstanceService as ConstructorParameters<typeof DragManagerService>[0],
            renderManagerService as ConstructorParameters<typeof DragManagerService>[1]
        );
        const currentCells: Array<Nullable<IDragCellPosition>> = [];
        const currentSub = service.currentCell$.subscribe((value) => currentCells.push(value));

        mockGetHoverCellPosition
            .mockReturnValueOnce({
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
                position: { startX: 10, startY: 20, endX: 30, endY: 40 },
            })
            .mockReturnValueOnce({
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
                position: { startX: 11, startY: 21, endX: 31, endY: 41 },
            })
            .mockReturnValueOnce({
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 4, col: 5 },
                position: { startX: 12, startY: 22, endX: 32, endY: 42 },
            });

        service.onDragOver({ offsetX: 10, offsetY: 20, dataTransfer: { files: [] } as unknown as DataTransfer } as Parameters<DragManagerService['onDragOver']>[0]);
        service.onDragOver({ offsetX: 11, offsetY: 21, dataTransfer: { files: ['changed'] } as unknown as DataTransfer } as Parameters<DragManagerService['onDragOver']>[0]);
        service.onDragOver({ offsetX: 12, offsetY: 22, dataTransfer: { files: [] } as unknown as DataTransfer } as Parameters<DragManagerService['onDragOver']>[0]);

        expect(currentCells).toEqual([
            {
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
                position: { startX: 10, startY: 20, endX: 30, endY: 40 },
                dataTransfer: { files: [] },
            },
            {
                location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 4, col: 5 },
                position: { startX: 12, startY: 22, endX: 32, endY: 42 },
                dataTransfer: { files: [] },
            },
        ]);

        currentSub.unsubscribe();
        service.dispose();
    });
});
