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
import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, UNIVER_SHEET_TABLE_FILTER_PANEL_ID } from '../../const';
import { SheetsTableComponentController } from '../sheet-table-component.controller';

describe('SheetsTableComponentController', () => {
    it('should open and close popup based on context state', () => {
        const context$ = new Subject<boolean | undefined>();
        const setContextValue = vi.fn();

        const popupDispose = vi.fn();
        const attachPopupToCell = vi.fn(() => ({ dispose: popupDispose }));
        const dialogClose = vi.fn();

        const controller = new SheetsTableComponentController(
            { register: vi.fn(() => ({ dispose: vi.fn() })) } as any,
            {
                subscribeContextValue$: () => context$,
                getContextValue: () => false,
                setContextValue,
            } as any,
            { attachPopupToCell } as any,
            { close: dialogClose } as any
        );

        controller.setCurrentTableFilterInfo({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            column: 2,
            row: 4,
        });

        context$.next(true);

        expect(attachPopupToCell).toHaveBeenCalledWith(4, 2, expect.objectContaining({
            componentKey: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
            direction: 'horizontal',
            offset: [5, 0],
            portal: true,
        }));

        const popupCalls = attachPopupToCell.mock.calls as Array<Array<any>>;
        const options = popupCalls[0]?.[2] as { onClickOutside: () => void } | undefined;
        expect(options).toBeDefined();
        options?.onClickOutside();
        expect(dialogClose).toHaveBeenCalledWith(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
        expect(setContextValue).toHaveBeenCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);

        context$.next(false);
        expect(popupDispose).toHaveBeenCalled();
        expect(controller.getCurrentTableFilterInfo()).toBeNull();

        controller.closeFilterPanel();
        expect(setContextValue).toHaveBeenCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);

        controller.dispose();
    });

    it('should toggle the same filter panel and switch directly to another column', () => {
        const context$ = new Subject<boolean | undefined>();
        let opened = false;
        const setContextValue = vi.fn((_key, value) => {
            opened = value;
        });

        const firstPopupDispose = vi.fn();
        const secondPopupDispose = vi.fn();
        const attachPopupToCell = vi
            .fn()
            .mockReturnValueOnce({ dispose: firstPopupDispose })
            .mockReturnValueOnce({ dispose: secondPopupDispose });

        const controller = new SheetsTableComponentController(
            { register: vi.fn(() => ({ dispose: vi.fn() })) } as any,
            {
                subscribeContextValue$: () => context$,
                getContextValue: () => opened,
                setContextValue,
            } as any,
            { attachPopupToCell } as any,
            { close: vi.fn() } as any
        );

        const firstInfo = {
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            column: 2,
            row: 4,
        };
        const secondInfo = {
            ...firstInfo,
            column: 3,
        };

        controller.openOrToggleFilterPanel(firstInfo);
        expect(setContextValue).toHaveBeenCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, true);

        context$.next(true);
        expect(attachPopupToCell).toHaveBeenCalledWith(4, 2, expect.any(Object));

        controller.openOrToggleFilterPanel(secondInfo);
        expect(firstPopupDispose).toHaveBeenCalledTimes(1);
        expect(attachPopupToCell).toHaveBeenLastCalledWith(4, 3, expect.any(Object));
        expect(controller.getCurrentTableFilterInfo()).toEqual(secondInfo);

        controller.openOrToggleFilterPanel(secondInfo);
        expect(setContextValue).toHaveBeenLastCalledWith(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, false);

        controller.dispose();
    });
});
