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
import { INTERCEPTOR_POINT } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { FormulaRenderManagerController } from '../formula-render.controller';

vi.mock('@univerjs/engine-formula', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-formula')>();

    return {
        ...actual,
        extractFormulaError: vi.fn(),
    };
});

describe('FormulaRenderManagerController', () => {
    it('marks formula error cells without mutating raw cell data', () => {
        let interceptor: any;
        const disposable = { dispose: vi.fn() };
        const sheetInterceptorService = {
            intercept: vi.fn((point, config) => {
                interceptor = config;
                return disposable;
            }),
        };
        const formulaDataModel = {
            getArrayFormulaCellData: vi.fn(() => ({ unit: { sheet: { 1: { 2: { f: '=A1' } } } } })),
        };
        const controller = new FormulaRenderManagerController(sheetInterceptorService as any, formulaDataModel as any);
        const rawCell = { v: '#DIV/0!', markers: { br: { size: 1 } } };
        vi.mocked(extractFormulaError).mockReturnValue(ErrorType.DIV_BY_ZERO);

        const result = interceptor.handler(rawCell, {
            unitId: 'unit',
            subUnitId: 'sheet',
            row: 1,
            col: 2,
            rawData: rawCell,
        }, (cell: unknown) => cell);

        expect(sheetInterceptorService.intercept).toHaveBeenCalledWith(
            INTERCEPTOR_POINT.CELL_CONTENT,
            expect.objectContaining({ priority: 10 })
        );
        expect(result).not.toBe(rawCell);
        expect(result.markers).toEqual(expect.objectContaining({
            br: { size: 1 },
            tl: { size: 6, color: '#409f11' },
        }));
        expect(extractFormulaError).toHaveBeenCalledWith(rawCell, true);

        controller.dispose();
        expect(disposable.dispose).toHaveBeenCalled();
    });

    it('passes through cells when there is no formula error or cell data', () => {
        let interceptor: any;
        const controller = new FormulaRenderManagerController({
            intercept: vi.fn((_point, config) => {
                interceptor = config;
                return { dispose: vi.fn() };
            }),
        } as any, {
            getArrayFormulaCellData: vi.fn(() => null),
        } as any);

        vi.mocked(extractFormulaError).mockReturnValueOnce(null as never);
        expect(interceptor.handler({ v: 'plain' }, {
            unitId: 'unit',
            subUnitId: 'sheet',
            row: 0,
            col: 0,
            rawData: { v: 'plain' },
        }, (cell: unknown) => cell)).toEqual({ v: 'plain' });

        vi.mocked(extractFormulaError).mockReturnValueOnce(ErrorType.VALUE);
        expect(interceptor.handler(null, {
            unitId: 'unit',
            subUnitId: 'sheet',
            row: 0,
            col: 0,
            rawData: null,
        }, (cell: unknown) => cell)).toBeNull();

        controller.dispose();
    });
});
