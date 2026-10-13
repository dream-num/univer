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

import { Injector } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CellAlertManagerService, CellAlertType } from '../cell-alert-manager.service';
import { CellPopupManagerService } from '../cell-popup-manager.service';

function createAlert(key: string) {
    return {
        key,
        type: CellAlertType.INFO,
        title: 'title',
        message: 'message',
        width: 180,
        height: 80,
        location: {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            row: 3,
            col: 4,
        },
    };
}

describe('CellAlertManagerService', () => {
    let injector: Injector;

    beforeEach(() => {
        injector = new Injector();
        injector.add([CellAlertManagerService]);
    });

    afterEach(() => injector.dispose());

    it('adds/replaces/removes alerts and emits current list', () => {
        const oldPopupDispose = { dispose: vi.fn() };
        const newPopupDispose = { dispose: vi.fn() };
        const showPopup = vi
            .fn()
            .mockReturnValueOnce(oldPopupDispose)
            .mockReturnValueOnce(newPopupDispose);
        injector.add([IRenderManagerService, { useValue: { getRenderUnitById: vi.fn(() => ({ id: 'render' })) } as never }]);
        injector.add([CellPopupManagerService, { useValue: { showPopup } as never }]);
        const service = injector.get(CellAlertManagerService);

        const emitted: Array<Array<[string, unknown]>> = [];
        service.currentAlert$.subscribe((value) => emitted.push(value));

        const first = createAlert('alert-1');
        service.showAlert(first as never);
        expect(showPopup).toHaveBeenCalledWith(
            first.location,
            expect.objectContaining({
                componentKey: 'univer.sheet.cell-alert',
                direction: 'horizontal',
                priority: 1,
                showOnSelectionMoving: false,
                extraProps: { alert: first },
            })
        );
        expect(service.currentAlert.size).toBe(1);
        expect(emitted.at(-1)?.map(([key]) => key)).toEqual(['alert-1']);

        const updated = { ...first, message: 'updated' };
        service.showAlert(updated);
        expect(oldPopupDispose.dispose).toHaveBeenCalledTimes(1);
        expect(service.currentAlert.get('alert-1')?.alert.message).toBe('updated');
        expect(showPopup).toHaveBeenLastCalledWith(updated.location, expect.objectContaining({ extraProps: { alert: updated } }));
        expect(emitted.at(-1)?.map(([key]) => key)).toEqual(['alert-1']);

        service.removeAlert('alert-1');
        expect(newPopupDispose.dispose).toHaveBeenCalled();
        expect(service.currentAlert.size).toBe(0);
        expect(emitted.at(-1)).toEqual([]);
    });

    it('handles no-render and clear-all branches', () => {
        const popupA = { dispose: vi.fn() };
        const popupB = { dispose: vi.fn() };
        const showPopup = vi.fn().mockReturnValueOnce(popupA).mockReturnValueOnce(popupB);
        let currentRender: { id: string } | null = { id: 'render' };
        const renderManager = {
            getRenderUnitById: vi.fn(() => currentRender),
        };
        injector.add([IRenderManagerService, { useValue: renderManager as never }]);
        injector.add([CellPopupManagerService, { useValue: { showPopup } as never }]);
        const service = injector.get(CellAlertManagerService);

        service.showAlert(createAlert('a') as never);
        service.showAlert(createAlert('b') as never);
        expect(service.currentAlert.size).toBe(2);

        service.clearAlert();
        expect(service.currentAlert.size).toBe(0);
        expect(popupA.dispose).toHaveBeenCalled();
        expect(popupB.dispose).toHaveBeenCalled();

        currentRender = null;
        service.showAlert(createAlert('no-render') as never);
        expect(showPopup).toHaveBeenCalledTimes(2);
        expect(service.currentAlert.has('no-render')).toBe(true);

        service.removeAlert('not-found');
    });

    it('anchors actionable alerts to the left of the cell', () => {
        const showPopup = vi.fn(() => ({ dispose: vi.fn() }));
        injector.add([IRenderManagerService, { useValue: { getRenderUnitById: vi.fn(() => ({ id: 'render' })) } as never }]);
        injector.add([CellPopupManagerService, { useValue: { showPopup } as never }]);
        const service = injector.get(CellAlertManagerService);
        const alert = {
            ...createAlert('action-alert'),
            menu: [{ label: 'Text to Number', onSelect: vi.fn() }],
        };

        service.showAlert(alert as never);

        expect(showPopup).toHaveBeenCalledWith(
            alert.location,
            expect.objectContaining({
                componentKey: 'univer.sheet.cell-alert',
                direction: 'left-center',
                autoRelayout: true,
                showOnSelectionMoving: true,
                extraProps: { alert },
            })
        );
    });
});
