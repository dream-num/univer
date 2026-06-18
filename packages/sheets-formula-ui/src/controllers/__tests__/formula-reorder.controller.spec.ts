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

import { ReorderRangeCommand, SetRangeValuesMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { FormulaReorderController } from '../formula-reorder.controller';

function createController(options?: { worksheet?: any }) {
    let interceptor: any;
    const disposable = { dispose: vi.fn() };
    const sheetInterceptorService = {
        interceptCommand: vi.fn((registeredInterceptor) => {
            interceptor = registeredInterceptor;
            return disposable;
        }),
    };
    const workbook = {
        getSheetBySheetId: vi.fn(() => options?.worksheet ?? null),
    };
    const controller = new FormulaReorderController(
        sheetInterceptorService as any,
        { getUniverSheetInstance: vi.fn(() => workbook) } as any,
        { getFormulaStringByCell: vi.fn(() => '=A2') } as any,
        { moveFormulaRefOffset: vi.fn(() => '=A1') } as any
    );

    return { controller, interceptor, disposable };
}

describe('FormulaReorderController', () => {
    it('creates redo and undo mutations with formula references shifted to the reordered row', () => {
        const matrix = {
            getValue: vi.fn((row: number, col: number) => {
                if (row === 1 && col === 0) {
                    return { f: '=A2', si: 'shared' };
                }
                if (row === 0 && col === 0) {
                    return { v: 'old-row' };
                }
                return { v: `cell-${row}-${col}` };
            }),
        };
        const { controller, interceptor, disposable } = createController({
            worksheet: { getCellMatrix: vi.fn(() => matrix) },
        });

        const result = interceptor.getMutations({
            id: ReorderRangeCommand.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
                order: { 0: 1 },
            },
        });

        expect(result.redos).toEqual([{
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                cellValue: {
                    0: {
                        0: { f: '=A1', si: null },
                    },
                },
            },
        }]);
        expect(result.undos).toEqual([{
            id: SetRangeValuesMutation.id,
            params: {
                unitId: 'unit',
                subUnitId: 'sheet',
                cellValue: {
                    0: {
                        0: { v: 'old-row' },
                    },
                },
            },
        }]);

        controller.dispose();
        expect(disposable.dispose).toHaveBeenCalled();
    });

    it('returns empty mutations for non-reorder commands, missing worksheets and ranges without formulas', () => {
        const { interceptor } = createController();
        expect(interceptor.getMutations({ id: 'other-command', params: {} })).toEqual({ redos: [], undos: [] });
        expect(interceptor.getMutations({
            id: ReorderRangeCommand.id,
            params: { unitId: 'unit', subUnitId: 'missing', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, order: {} },
        })).toEqual({ redos: [], undos: [] });

        const noFormula = createController({
            worksheet: {
                getCellMatrix: vi.fn(() => ({ getValue: vi.fn(() => ({ v: 'plain' })) })),
            },
        });
        expect(noFormula.interceptor.getMutations({
            id: ReorderRangeCommand.id,
            params: { unitId: 'unit', subUnitId: 'sheet', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }, order: {} },
        })).toEqual({ redos: [], undos: [] });
    });
});
