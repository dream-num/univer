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

import { CellValueType } from '@univerjs/core';
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

    it('marks disabled circular formulas with numeric caches and clears the mark when enabled or resolved', () => {
        let interceptor: any;
        const circular = vi.fn(() => true);
        const controller = new FormulaRenderManagerController({
            intercept: vi.fn((_point, config) => {
                interceptor = config;
                return { dispose: vi.fn() };
            }),
        } as any, {
            getArrayFormulaCellData: () => null,
            isCircularReference: circular,
        } as any);
        const settings = { iterativeCalculation: false };
        const rawCell = { f: '=SUM(A1:B1)', v: 0, t: CellValueType.NUMBER };
        const position = {
            unitId: 'unit',
            subUnitId: 'sheet',
            row: 0,
            col: 0,
            rawData: rawCell,
            workbook: { getCalculationSettings: () => settings },
        };
        vi.mocked(extractFormulaError).mockReturnValue(null as never);
        const render = (cell: unknown = rawCell) => interceptor.handler(cell, position, (next: unknown) => next);

        expect(render().markers?.tl).toEqual({ size: 6, color: '#409f11' });
        expect(rawCell).not.toHaveProperty('markers');
        expect(circular).toHaveBeenCalledWith('unit', 'sheet', 0, 0);

        settings.iterativeCalculation = true;
        expect(render()).toBe(rawCell);
        settings.iterativeCalculation = false;
        circular.mockReturnValue(false);
        expect(render()).toBe(rawCell);
        circular.mockReturnValue(true);
        expect(render({ v: 0, t: CellValueType.NUMBER })).not.toHaveProperty('markers');
        controller.dispose();
    });
});
