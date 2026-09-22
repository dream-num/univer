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

import { FilterSelectionMode, RecordValueType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { TableColumnFilterTypeEnum } from '../../types/enum';
import { Table } from '../table';

describe('Table', () => {
    it('round-trips compact record filters without sharing snapshot values', () => {
        const table = new Table(
            'table-1',
            'Orders',
            { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            ['Status']
        );
        table.setTableFilterColumn(0, {
            filterType: TableColumnFilterTypeEnum.record,
            mode: FilterSelectionMode.Exclude,
            values: [{ type: RecordValueType.String, value: 'blocked' }],
        });

        const snapshot = table.toJSON();
        const restored = new Table(
            'placeholder',
            'Placeholder',
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 },
            []
        );
        restored.fromJSON(snapshot);
        const snapshotFilter = snapshot.filters.tableColumnFilterList![0]!;
        if (snapshotFilter.filterType === TableColumnFilterTypeEnum.record) {
            snapshotFilter.values[0] = { type: RecordValueType.String, value: 'mutated' };
        }

        expect(restored.getTableFilterColumn(0)).toEqual({
            filterType: TableColumnFilterTypeEnum.record,
            mode: 'exclude',
            values: [{ type: 'string', value: 'blocked' }],
        });
    });
});
