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
import { BaseDataModel } from '../base-data-model';
import { getEmptySnapshot } from '../empty-snapshot';
import {
    allocateBaseFormulaTableName,
    createBaseFormulaTableNameMap,
    createBaseFormulaTableReferenceNormalizer,
    getBaseFormulaTableName,
    migrateBaseFormulaTableNames,
    normalizeBaseFormulaTableName,
    normalizeBaseFormulaTableReferences,
} from '../formula-table-name';

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

    it('preserves persisted formula names when a lower-sorting colliding table is added', () => {
        const before = {
            tables: {
                b: { id: 'b', name: 'Sales table', formulaName: 'Sales_table' },
            },
        };
        const insertedFormulaName = allocateBaseFormulaTableName(
            'Sales-table',
            createBaseFormulaTableNameMap(before).values()
        );
        const after = {
            tables: {
                b: before.tables.b,
                a: { id: 'a', name: 'Sales-table', formulaName: insertedFormulaName },
            },
        };

        expect(Object.fromEntries(createBaseFormulaTableNameMap(after))).toEqual({
            a: 'Sales_table_2',
            b: 'Sales_table',
        });
        expect(normalizeBaseFormulaTableReferences('=SUM(Sales_table[Amount])', after)).toBe(
            '=SUM(Sales_table[Amount])'
        );
    });

    it('keeps the persisted formula name when the display name changes', () => {
        const snapshot = {
            tables: {
                a: { id: 'a', name: 'Revenue', formulaName: 'Sales' },
            },
        };

        expect(getBaseFormulaTableName(snapshot.tables.a, snapshot)).toBe('Sales');
    });

    it('does not collapse a persisted suffix when another table is deleted', () => {
        const snapshot = {
            tables: {
                b: { id: 'b', name: 'Sales-table', formulaName: 'Sales_table_2' },
            },
        };

        expect(getBaseFormulaTableName(snapshot.tables.b, snapshot)).toBe('Sales_table_2');
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

    it('reuses one compiled alias normalizer across formulas', () => {
        const snapshot = {
            tables: {
                'table.+(1)': { id: 'table.+(1)', name: 'Work Items' },
            },
        };
        const normalizeReferences = createBaseFormulaTableReferenceNormalizer(snapshot);

        expect(normalizeReferences('=SUM(table.+(1)[Amount])')).toBe('=SUM(Work_Items[Amount])');
        expect(normalizeReferences('="table.+(1)[Amount]"&Book!table.+(1)[Amount]')).toBe(
            '="table.+(1)[Amount]"&Book!table.+(1)[Amount]'
        );
    });

    it('persists a canonical formula name while migrating a historical snapshot', () => {
        const snapshot = {
            tables: {
                'table-1': {
                    id: 'table-1',
                    name: 'Work Items',
                    formulaName: undefined as string | undefined,
                    fields: {
                        total: { type: 'formula', config: { formula: '=SUM(table-1[Amount])' } },
                    },
                    cellData: {
                        0: { 0: { f: '=SUM(_T_table_x2d_1[Amount])' } },
                    },
                },
            },
        };

        migrateBaseFormulaTableNames(snapshot as never);

        expect(snapshot.tables['table-1'].formulaName).toBe('Work_Items');
        expect(snapshot.tables['table-1'].fields.total.config.formula).toBe('=SUM(Work_Items[Amount])');
        expect(snapshot.tables['table-1'].cellData[0][0].f).toBe('=SUM(Work_Items[Amount])');

        migrateBaseFormulaTableNames(snapshot as never);
        expect(snapshot.tables['table-1'].formulaName).toBe('Work_Items');
        expect(snapshot.tables['table-1'].fields.total.config.formula).toBe('=SUM(Work_Items[Amount])');
    });

    it('derives a historical formula name without silently changing the OT snapshot', () => {
        const snapshot = getEmptySnapshot('base-1', 'Base');
        snapshot.tables['table-1'].name = 'Work Items';
        const loaded = new BaseDataModel(snapshot).getSnapshot();

        expect(loaded.tables['table-1'].formulaName).toBeUndefined();
        expect(getBaseFormulaTableName(loaded.tables['table-1'], loaded)).toBe('Work_Items');
    });
});
