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

import { ContextService, IContextService, Injector } from '@univerjs/core';
import { SheetCanvasPopManagerService } from '@univerjs/sheets-ui';
import { IDialogService } from '@univerjs/ui';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, UNIVER_SHEET_TABLE_FILTER_PANEL_ID } from '../../const';
import { SheetsTableComponentController } from '../sheet-table-component.controller';

let injector: Injector;

afterEach(() => {
    injector.dispose();
    vi.restoreAllMocks();
});

function createController() {
    injector = new Injector();
    injector.add([IContextService, { useClass: ContextService }]);
    const contextService = injector.get(IContextService);
    vi.spyOn(contextService, 'setContextValue');
    const popupDisposables: Array<{ dispose: ReturnType<typeof vi.fn> }> = [];
    const popupService = {
        attachPopupToCell: vi.fn((..._args: unknown[]) => {
            const disposable = { dispose: vi.fn() };
            popupDisposables.push(disposable);
            return disposable;
        }),
    };
    const dialogService = { close: vi.fn() };
    injector.add([SheetCanvasPopManagerService, { useValue: popupService as never }]);
    injector.add([IDialogService, { useValue: dialogService as never }]);
    injector.add([SheetsTableComponentController]);
    return { contextService, popupService, dialogService, popupDisposables };
}

describe('SheetsTableComponentController', () => {
    it('opens, toggles and reopens the table filter popup based on current filter cell', () => {
        const { contextService, popupService, popupDisposables } = createController();
        const controller = injector.get(SheetsTableComponentController);
        const info = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };

        controller.openOrToggleFilterPanel(info);

        expect(contextService.setContextValue).toHaveBeenCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, true);
        expect(popupService.attachPopupToCell).toHaveBeenCalledWith(2, 3, expect.objectContaining({
            componentKey: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
            direction: 'horizontal',
            offset: [5, 0],
            portal: true,
        }), info.unitId, info.subUnitId, undefined, undefined);
        expect(controller.getCurrentTableFilterInfo()).toEqual(info);

        controller.openOrToggleFilterPanel(info);

        expect(contextService.setContextValue).toHaveBeenLastCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
        expect(popupDisposables[0].dispose).toHaveBeenCalled();
        expect(controller.getCurrentTableFilterInfo()).toBeNull();

        controller.dispose();
    });

    it('disposes the previous popup and opens a new one when switching to another filter cell', () => {
        const { contextService, popupService, popupDisposables } = createController();
        const controller = injector.get(SheetsTableComponentController);
        const firstInfo = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };
        const secondInfo = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 4 };

        controller.openOrToggleFilterPanel(firstInfo);
        controller.openOrToggleFilterPanel(secondInfo);

        expect(contextService.setContextValue).toHaveBeenCalledTimes(1);
        expect(popupDisposables[0].dispose).toHaveBeenCalled();
        expect(popupService.attachPopupToCell).toHaveBeenLastCalledWith(
            2,
            4,
            expect.any(Object),
            secondInfo.unitId,
            secondInfo.subUnitId,
            undefined,
            undefined
        );
        expect(controller.getCurrentTableFilterInfo()).toEqual(secondInfo);

        controller.dispose();
    });

    it.each(['onClickOutside', 'onAnchorDisposed'] as const)('closes the filter dialog and context on %s', (close) => {
        const { popupService, dialogService, contextService } = createController();
        const controller = injector.get(SheetsTableComponentController);
        const info = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };

        controller.openOrToggleFilterPanel(info);
        const popupCall = popupService.attachPopupToCell.mock.calls[0] as [
            number,
            number,
            { onClickOutside: () => void; onAnchorDisposed: () => void }
        ];
        const popupOptions = popupCall[2];
        popupOptions[close]();

        expect(dialogService.close).toHaveBeenCalledWith(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
        expect(contextService.setContextValue).toHaveBeenLastCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);
        expect(controller.getCurrentTableFilterInfo()).toBeNull();

        controller.dispose();
    });

    it('moves an open filter to the same header in another pane instead of closing it', () => {
        const { popupService, popupDisposables, contextService } = createController();
        const controller = injector.get(SheetsTableComponentController);
        const cell = { unitId: 'unit-1', subUnitId: 'sheet-1', tableId: 'table-1', row: 2, column: 3 };
        controller.openOrToggleFilterPanel({ ...cell, renderId: 'left-pane' });
        controller.openOrToggleFilterPanel({ ...cell, renderId: 'right-pane' });
        expect(contextService.getContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY)).toBe(true);
        expect(popupDisposables[0].dispose).toHaveBeenCalled();
        expect(popupService.attachPopupToCell).toHaveBeenLastCalledWith(
            2,
            3,
            expect.any(Object),
            'unit-1',
            'sheet-1',
            undefined,
            'right-pane'
        );
    });
});
