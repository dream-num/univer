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

import type { LexerTreeBuilder } from '@univerjs/engine-formula';
import type { Table } from '../../../models/table';
import { describe, expect, it, vi } from 'vitest';
import { getCalculatedColumnFillMutation } from '../calculated-column';

describe('getCalculatedColumnFillMutation', () => {
    it('fills inserted table rows with row-adjusted calculated column formulas', () => {
        const table = {
            getTableInfo: () => ({
                showHeader: true,
                range: { startRow: 0, startColumn: 4, endRow: 9, endColumn: 6 },
                columns: [
                    { formula: undefined },
                    { formula: 'A2*2' },
                    { formula: '=$A2' },
                ],
            }),
        } as unknown as Table;
        const moveFormulaRefOffset = vi.fn((formula: string, _columnOffset: number, rowOffset: number) => `${formula}@${rowOffset}`);

        const mutation = getCalculatedColumnFillMutation(
            table,
            'unit-1',
            'sheet-1',
            7,
            8,
            () => ({ moveFormulaRefOffset } as unknown as LexerTreeBuilder)
        );

        expect(moveFormulaRefOffset.mock.calls).toEqual([
            ['=A2*2', 0, 6],
            ['=A2*2', 0, 7],
            ['=$A2', 0, 6],
            ['=$A2', 0, 7],
        ]);
        expect(mutation?.params).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: {
                7: { 5: { f: '=A2*2@6' }, 6: { f: '=$A2@6' } },
                8: { 5: { f: '=A2*2@7' }, 6: { f: '=$A2@7' } },
            },
        });
    });

    it('skips tables without calculated columns', () => {
        const table = {
            getTableInfo: () => ({
                showHeader: true,
                range: { startRow: 0, startColumn: 0, endRow: 2, endColumn: 0 },
                columns: [{ formula: '' }],
            }),
        } as unknown as Table;

        expect(getCalculatedColumnFillMutation(
            table,
            'unit-1',
            'sheet-1',
            2,
            2,
            () => ({ moveFormulaRefOffset: vi.fn() } as unknown as LexerTreeBuilder)
        )).toBeUndefined();
    });

    it('marks inserted rows as single-cell arrays for array calculated columns', () => {
        const table = {
            getTableInfo: () => ({
                showHeader: false,
                range: { startRow: 0, startColumn: 7, endRow: 9, endColumn: 7 },
                columns: [{ formula: 'A1*2', formulaIsArray: true }],
            }),
        } as unknown as Table;
        const moveFormulaRefOffset = vi.fn((formula: string, _columnOffset: number, rowOffset: number) => `${formula}@${rowOffset}`);

        const mutation = getCalculatedColumnFillMutation(
            table,
            'unit-1',
            'sheet-1',
            3,
            4,
            () => ({ moveFormulaRefOffset } as unknown as LexerTreeBuilder)
        );

        expect(mutation?.params).toEqual({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            cellValue: {
                3: { 7: { f: '=A1*2@3', ref: 'H4' } },
                4: { 7: { f: '=A1*2@4', ref: 'H5' } },
            },
        });
    });
});
