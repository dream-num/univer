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
import { TableManager } from '../table-manager';

describe('TableManager', () => {
    it('preserves the table style id in add events emitted during deserialization', () => {
        const worksheet = {
            getCell: () => ({ v: 'Name' }),
            getSheetId: () => 'sheet-1',
        };
        const workbook = {
            getSheetBySheetId: () => worksheet,
            getUnitId: () => 'unit-1',
        };
        const univerInstanceService = {
            getUnit: () => workbook,
        };
        const manager = new TableManager(univerInstanceService as never, {} as never);
        const events: Array<{ tableStyleId?: string }> = [];
        manager.tableAdd$.subscribe((event) => events.push(event));

        manager.fromJSON('unit-1', {
            'sheet-1': {
                tables: [
                    {
                        id: 'table-1',
                        name: 'Table1',
                        range: {
                            startRow: 0,
                            startColumn: 0,
                            endRow: 1,
                            endColumn: 0,
                        },
                        options: {
                            tableStyleId: 'ImportedTableStyle',
                        },
                        filters: {},
                        columns: [],
                        meta: {},
                    },
                ],
                tableFilteredOutRows: [],
            },
        });

        expect(events).toHaveLength(1);
        expect(events[0].tableStyleId).toBe('ImportedTableStyle');
    });
});
