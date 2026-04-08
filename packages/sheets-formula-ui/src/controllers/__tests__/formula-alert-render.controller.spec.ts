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

import { ErrorType, extractFormulaError } from '@univerjs/engine-formula';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormulaAlertRenderController } from '../formula-alert-render.controller';

vi.mock('@univerjs/engine-formula', async (importActual) => {
    const actual = await importActual<typeof import('@univerjs/engine-formula')>();
    return {
        ...actual,
        extractFormulaError: vi.fn(() => actual.ErrorType.DIV_BY_ZERO),
    };
});

afterEach(() => {
    vi.useRealTimers();
});

describe('FormulaAlertRenderController', () => {
    it('shows formula alerts for hovered cells and hides them for repeated hovers or zen mode', async () => {
        vi.useFakeTimers();
        const currentCell$ = new Subject<{ location: { unitId: string; subUnitId: string; row: number; col: number } }>();
        const visible$ = new Subject<boolean>();
        const currentAlert = new Map<string, { alert: { location: { unitId: string; subUnitId: string; row: number; col: number } } }>();
        const showAlert = vi.fn((alert) => currentAlert.set('SHEET_FORMULA_ALERT', { alert }));
        const removeAlert = vi.fn((key: string) => currentAlert.delete(key));
        const worksheet = { getCell: vi.fn(() => ({ v: '#DIV/0!' })) };

        const controller = new FormulaAlertRenderController(
            { unit: { getActiveSheet: vi.fn(() => worksheet) } } as never,
            { currentCell$ } as never,
            { currentAlert, removeAlert, showAlert } as never,
            { t: (key: string) => key } as never,
            { getArrayFormulaCellData: vi.fn(() => null) } as never,
            { visible$ } as never
        );

        expect(controller).toBeTruthy();

        const location = { unitId: 'book-1', subUnitId: 'sheet-1', row: 2, col: 1 };
        currentCell$.next({ location });
        await vi.advanceTimersByTimeAsync(120);

        expect(showAlert).toHaveBeenCalledWith(expect.objectContaining({
            key: 'SHEET_FORMULA_ALERT',
            title: 'formula.error.title',
            message: 'formula.error.divByZero',
            location,
        }));

        currentCell$.next({ location });
        await vi.advanceTimersByTimeAsync(120);
        expect(removeAlert).toHaveBeenCalledWith('SHEET_FORMULA_ALERT');

        visible$.next(true);
        expect(removeAlert).toHaveBeenCalledWith('SHEET_FORMULA_ALERT');
    });

    it('hides alerts when there is no extractable formula error', async () => {
        vi.useFakeTimers();
        vi.mocked(extractFormulaError).mockReturnValueOnce(null as never);
        const currentCell$ = new Subject<{ location: { unitId: string; subUnitId: string; row: number; col: number } }>();
        const removeAlert = vi.fn();

        const controller = new FormulaAlertRenderController(
            { unit: { getActiveSheet: vi.fn(() => ({ getCell: vi.fn(() => ({ v: 'plain-text' })) })) } } as never,
            { currentCell$ } as never,
            { currentAlert: new Map(), removeAlert, showAlert: vi.fn() } as never,
            { t: (key: string) => key } as never,
            { getArrayFormulaCellData: vi.fn(() => null) } as never,
            { visible$: new Subject<boolean>() } as never
        );

        expect(controller).toBeTruthy();

        currentCell$.next({ location: { unitId: 'book-1', subUnitId: 'sheet-1', row: 0, col: 0 } });
        await vi.advanceTimersByTimeAsync(120);

        expect(removeAlert).toHaveBeenCalledWith('SHEET_FORMULA_ALERT');
        expect(vi.mocked(extractFormulaError)).toHaveBeenCalledWith({ v: 'plain-text' }, false);
        expect(ErrorType.DIV_BY_ZERO).toBeTruthy();
    });
});
