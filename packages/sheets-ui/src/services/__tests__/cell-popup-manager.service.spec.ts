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

import { describe, expect, it, vi } from 'vitest';
import { CellPopupManagerService } from '../cell-popup-manager.service';

describe('CellPopupManagerService', () => {
    it('creates/sorts popups and removes them through returned disposables', () => {
        const popupDisposable = { dispose: vi.fn() };
        const sheetPopupService = {
            attachPopupToCell: vi.fn(() => popupDisposable),
        };
        const service = new CellPopupManagerService(sheetPopupService as any);
        const changes: any[] = [];
        service.change$.subscribe((change) => changes.push(change));

        const location = { unitId: 'unit-1', subUnitId: 'sheet-1', row: 4, col: 5 };
        const disposeLow = service.showPopup(location, {
            id: 'p-low',
            componentKey: 'component-a',
            priority: 10,
        } as any);
        const disposeHigh = service.showPopup(location, {
            id: 'p-high',
            componentKey: 'component-b',
            priority: 1,
        } as any);

        expect(sheetPopupService.attachPopupToCell).toHaveBeenCalledTimes(1);
        expect(service.getPopups('unit-1', 'sheet-1', 4, 5, 'horizontal').map((p) => p.id)).toEqual(['p-high', 'p-low']);
        expect(changes.at(-1)).toEqual({ ...location, direction: 'horizontal' });

        disposeHigh.dispose();
        expect(service.getPopups('unit-1', 'sheet-1', 4, 5, 'horizontal').map((p) => p.id)).toEqual(['p-low']);
        expect(popupDisposable.dispose).not.toHaveBeenCalled();

        disposeLow.dispose();
        expect(service.getPopups('unit-1', 'sheet-1', 4, 5, 'horizontal')).toEqual([]);
        expect(popupDisposable.dispose).toHaveBeenCalledTimes(1);
    });

    it('supports vertical cache and hidePopup clear logic', () => {
        const horizontalDisposable = { dispose: vi.fn() };
        const verticalDisposable = { dispose: vi.fn() };
        const sheetPopupService = {
            attachPopupToCell: vi
                .fn()
                .mockReturnValueOnce(horizontalDisposable)
                .mockReturnValueOnce(verticalDisposable),
        };
        const service = new CellPopupManagerService(sheetPopupService as any);
        const changes: any[] = [];
        service.change$.subscribe((change) => changes.push(change));

        const location = { unitId: 'unit-2', subUnitId: 'sheet-2', row: 1, col: 2 };
        service.showPopup(location, {
            id: 'h1',
            componentKey: 'h',
            direction: 'horizontal',
            priority: 1,
        } as any);
        service.showPopup(location, {
            id: 'v1',
            componentKey: 'v',
            direction: 'vertical',
            priority: 2,
        } as any);

        expect(service.getPopups('unit-2', 'sheet-2', 1, 2, 'horizontal').length).toBe(1);
        expect(service.getPopups('unit-2', 'sheet-2', 1, 2, 'vertical').length).toBe(1);

        service.hidePopup('unit-2', 'sheet-2', 1, 2);
        expect(horizontalDisposable.dispose).toHaveBeenCalled();
        expect(verticalDisposable.dispose).toHaveBeenCalled();
        expect(service.getPopups('unit-2', 'sheet-2', 1, 2, 'horizontal')).toEqual([]);
        expect(service.getPopups('unit-2', 'sheet-2', 1, 2, 'vertical')).toEqual([]);

        // No-op branch.
        service.hidePopup('unit-2', 'sheet-2', 9, 9);

        const directions = changes
            .filter((change) => change.unitId === 'unit-2' && change.subUnitId === 'sheet-2')
            .map((change) => change.direction);
        expect(directions.includes('horizontal')).toBe(true);
        expect(directions.includes('vertical')).toBe(true);
    });
});
