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

import { describe, expect, it } from 'vitest';
import { createBaseFormulaTableNameMap, getBaseFormulaTableName, normalizeBaseFormulaTableName, normalizeBaseFormulaTableReferences } from '../formula-table-name';

describe('Base formula table names', () => {
    it('normalizes display names into OOXML-compatible identifiers', () => {
        expect(normalizeBaseFormulaTableName('07 | Inventory and alerts')).toBe('_07_Inventory_and_alerts');
        expect(normalizeBaseFormulaTableName('A1')).toBe('_A1');
        expect(normalizeBaseFormulaTableName('R')).toBe('_R');
        expect(normalizeBaseFormulaTableName('库存')).toBe('Table');
    });

    it('uses one deterministic namespace for normalized duplicates and suffix collisions', () => {
        const snapshot = {
            tables: {
                c: { id: 'c', name: 'Sales-table' },
                b: { id: 'b', name: 'Sales_table_2' },
                a: { id: 'a', name: 'Sales table' },
            },
        };

        expect(Object.fromEntries(createBaseFormulaTableNameMap(snapshot))).toEqual({
            a: 'Sales_table',
            b: 'Sales_table_2',
            c: 'Sales_table_3',
        });
        expect(getBaseFormulaTableName(snapshot.tables.c, snapshot)).toBe('Sales_table_3');
    });

    it('migrates id-derived input aliases without touching strings or external tables', () => {
        const snapshot = {
            tables: {
                'table-1': { id: 'table-1', name: 'Work Items' },
            },
        };

        expect(normalizeBaseFormulaTableReferences(
            '=SUM(_T_table_x2d_1[Amount],table-1[Amount],"_T_table_x2d_1[Amount]",Book!_T_table_x2d_1[Amount])',
            snapshot
        )).toBe('=SUM(Work_Items[Amount],Work_Items[Amount],"_T_table_x2d_1[Amount]",Book!_T_table_x2d_1[Amount])');
    });
});
