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

import { DataValidationStatus } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataValidationAlertController } from '../dv-alert.controller';

afterEach(() => {
    vi.useRealTimers();
});

describe('DataValidationAlertController', () => {
    it('shows an alert for invalid hovered cells and clears it when repeated or zen mode opens', async () => {
        vi.useFakeTimers();
        const currentCell$ = new Subject<{ location: { unitId: string; subUnitId: string; row: number; col: number } }>();
        const visible$ = new Subject<boolean>();
        const currentAlert = new Map<string, { alert: { location: { unitId: string; subUnitId: string; row: number; col: number } } }>();
        const showAlert = vi.fn((alert) => currentAlert.set('SHEET_DATA_VALIDATION_ALERT', { alert }));
        const removeAlert = vi.fn((key: string) => currentAlert.delete(key));
        const dataValidationModel = {
            getRuleByLocation: vi.fn(() => ({ uid: 'rule-1', type: 'list' })),
            validator: vi.fn(() => DataValidationStatus.INVALID),
            getValidator: vi.fn(() => ({ getRuleFinalError: vi.fn(() => 'invalid list value') })),
        };

        const controller = new DataValidationAlertController(
            { currentCell$ } as never,
            { currentAlert, removeAlert, showAlert } as never,
            { getUnit: vi.fn(() => ({ getSheetBySheetId: vi.fn(() => ({ getSheetId: () => 'sheet-1' })) })) } as never,
            { t: (key: string) => key } as never,
            { visible$ } as never,
            dataValidationModel as never
        );

        expect(controller).toBeTruthy();

        const location = { unitId: 'book-1', subUnitId: 'sheet-1', row: 1, col: 2 };
        currentCell$.next({ location });
        await vi.advanceTimersByTimeAsync(120);

        expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({
            key: 'SHEET_DATA_VALIDATION_ALERT',
            title: 'dataValidation.error.title',
            message: 'invalid list value',
            location,
        }));

        currentCell$.next({ location });
        await vi.advanceTimersByTimeAsync(120);
        expect(removeAlert).toHaveBeenCalledWith('SHEET_DATA_VALIDATION_ALERT');

        visible$.next(true);
        expect(removeAlert).toHaveBeenCalledWith('SHEET_DATA_VALIDATION_ALERT');
    });

    it('removes alerts when the hovered cell has no validation rule', async () => {
        vi.useFakeTimers();
        const currentCell$ = new Subject<{ location: { unitId: string; subUnitId: string; row: number; col: number } }>();
        const removeAlert = vi.fn();

        const controller = new DataValidationAlertController(
            { currentCell$ } as never,
            { currentAlert: new Map(), removeAlert, showAlert: vi.fn() } as never,
            { getUnit: vi.fn(() => ({ getSheetBySheetId: vi.fn(() => ({ getSheetId: () => 'sheet-1' })) })) } as never,
            { t: (key: string) => key } as never,
            { visible$: new Subject<boolean>() } as never,
            {
                getRuleByLocation: vi.fn(() => null),
                validator: vi.fn(),
                getValidator: vi.fn(),
            } as never
        );

        expect(controller).toBeTruthy();

        currentCell$.next({ location: { unitId: 'book-1', subUnitId: 'sheet-1', row: 3, col: 4 } });
        await vi.advanceTimersByTimeAsync(120);

        expect(removeAlert).toHaveBeenCalledWith('SHEET_DATA_VALIDATION_ALERT');
    });
});
