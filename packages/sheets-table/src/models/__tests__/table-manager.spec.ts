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

import type { IWorkbookData, UnitModel } from '@univerjs/core';
import { LocaleType, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { TableManager } from '../table-manager';

describe('TableManager', () => {
    let univer: Univer | undefined;

    afterEach(() => {
        univer?.dispose();
    });

    it('preserves the table style id in add events emitted during deserialization', () => {
        univer = new Univer();
        univer.createUnit<IWorkbookData, UnitModel<IWorkbookData>>(
            UniverInstanceType.UNIVER_SHEET,
            {
                id: 'unit-1',
                appVersion: '3.0.0-alpha',
                locale: LocaleType.EN_US,
                name: 'table test',
                sheetOrder: ['sheet-1'],
                sheets: {
                    'sheet-1': {
                        id: 'sheet-1',
                        name: 'Sheet1',
                        rowCount: 2,
                        columnCount: 1,
                        cellData: {
                            0: {
                                0: { v: 'Name' },
                            },
                        },
                    },
                },
                styles: {},
            }
        );

        const manager = univer.__getInjector().createInstance(TableManager);
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
