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

import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, UNIVER_SHEET_TABLE_FILTER_PANEL_ID } from '../../const';
import { SheetsTableComponentController } from '../sheet-table-component.controller';

function createController() {
    const contextValues = new Map<string, unknown>();
    const panelOpened$ = new BehaviorSubject<unknown>(undefined);
    const popupDisposables: Array<{ dispose: ReturnType<typeof vi.fn> }> = [];
    const contextService = {
        getContextValue: vi.fn((key: string) => contextValues.get(key)),
        setContextValue: vi.fn((key: string, value: unknown) => {
            contextValues.set(key, value);
            panelOpened$.next(value);
        }),
        subscribeContextValue$: vi.fn(() => panelOpened$),
    };
    const popupService = {
        attachPopupToCell: vi.fn((..._args: unknown[]) => {
            const disposable = { dispose: vi.fn() };
            popupDisposables.push(disposable);
            return disposable;
        }),
    };
    const dialogService = { close: vi.fn() };
    const controller = new SheetsTableComponentController(
        contextService as never,
        popupService as never,
        dialogService as never
    );

    return { controller, contextService, popupService, dialogService, popupDisposables };
}

describe('SheetsTableComponentController', () => {
    it('opens, toggles and reopens the table filter popup based on current filter cell', () => {
        const { controller, contextService, popupService, popupDisposables } = createController();
        const info = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };

        controller.openOrToggleFilterPanel(info);

        expect(contextService.setContextValue).toHaveBeenCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, true);
        expect(popupService.attachPopupToCell).toHaveBeenCalledWith(2, 3, expect.objectContaining({
            componentKey: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
            direction: 'horizontal',
            offset: [5, 0],
            portal: true,
        }));
        expect(controller.getCurrentTableFilterInfo()).toEqual(info);

        controller.openOrToggleFilterPanel(info);

        expect(contextService.setContextValue).toHaveBeenLastCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
        expect(popupDisposables[0].dispose).toHaveBeenCalled();
        expect(controller.getCurrentTableFilterInfo()).toBeNull();

        controller.dispose();
    });

    it('disposes the previous popup and opens a new one when switching to another filter cell', () => {
        const { controller, contextService, popupService, popupDisposables } = createController();
        const firstInfo = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };
        const secondInfo = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 4 };

        controller.openOrToggleFilterPanel(firstInfo);
        controller.openOrToggleFilterPanel(secondInfo);

        expect(contextService.setContextValue).toHaveBeenCalledTimes(1);
        expect(popupDisposables[0].dispose).toHaveBeenCalled();
        expect(popupService.attachPopupToCell).toHaveBeenLastCalledWith(2, 4, expect.any(Object));
        expect(controller.getCurrentTableFilterInfo()).toEqual(secondInfo);

        controller.dispose();
    });

    it('closes the filter dialog and context when clicking outside the popup', () => {
        const { controller, popupService, dialogService, contextService } = createController();
        const info = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };

        controller.openOrToggleFilterPanel(info);
        const popupCall = popupService.attachPopupToCell.mock.calls[0] as [number, number, { onClickOutside: () => void }];
        const popupOptions = popupCall[2];
        popupOptions.onClickOutside();

        expect(dialogService.close).toHaveBeenCalledWith(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
        expect(contextService.setContextValue).toHaveBeenLastCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
        expect(controller.getCurrentTableFilterInfo()).toBeNull();

        controller.dispose();
    });
});
