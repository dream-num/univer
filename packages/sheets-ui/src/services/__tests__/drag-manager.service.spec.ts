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
        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = {
            getUnitId: () => 'unit-1',
            getActiveSheet: () => worksheet,
        };
        const currentType$ = new Subject<any>();

        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => currentType$.asObservable()),
            getCurrentUnitForType: vi.fn(() => workbook),
        };

        const render = createRender();
        const renderManagerService = {
            getRenderById: vi.fn(() => render),
        };

        const service = new DragManagerService(univerInstanceService as any, renderManagerService as any);
        const currentCells: any[] = [];
        const endCells: any[] = [];
        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        (getHoverCellPosition as any).mockReturnValue({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
        });

        const dataTransfer = { files: [] } as any;
        service.onDragOver({ offsetX: 12, offsetY: 34, dataTransfer } as any);
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

        service.onDrop({ offsetX: 12, offsetY: 34, dataTransfer } as any);
        expect(endCells.at(-1)).toEqual({
            location: { unitId: 'unit-1', subUnitId: 'sheet-1', row: 2, col: 3 },
            position: { startX: 10, startY: 20, endX: 40, endY: 60 },
            dataTransfer,
        });

        (getHoverCellPosition as any).mockReturnValue(null);
        service.onDragOver({ offsetX: 1, offsetY: 1, dataTransfer } as any);
        service.onDrop({ offsetX: 1, offsetY: 1, dataTransfer } as any);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
    });

    it('clears states when workbook becomes unavailable and supports dispose', () => {
        const currentType$ = new Subject<any>();
        const univerInstanceService = {
            getCurrentTypeOfUnit$: vi.fn(() => currentType$.asObservable()),
            getCurrentUnitForType: vi.fn(() => null),
        };
        const renderManagerService = {
            getRenderById: vi.fn(() => createRender()),
        };
        const service = new DragManagerService(univerInstanceService as any, renderManagerService as any);
        const currentCells: any[] = [];
        const endCells: any[] = [];

        const currentSub = service.currentCell$.subscribe((v) => currentCells.push(v));
        const endSub = service.endCell$.subscribe((v) => endCells.push(v));

        currentType$.next(null);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        service.onDragOver({ offsetX: 0, offsetY: 0, dataTransfer: null } as any);
        service.onDrop({ offsetX: 0, offsetY: 0, dataTransfer: null } as any);
        expect(currentCells.at(-1)).toBeNull();
        expect(endCells.at(-1)).toBeNull();

        currentSub.unsubscribe();
        endSub.unsubscribe();
        service.dispose();
    });
});
