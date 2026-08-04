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

import type { IBaseSnapshot } from '../typedef';
import { describe, expect, it, vi } from 'vitest';
import { BaseDataModel } from '../base-data-model';
import { BASE_RECORD_ID_FIELD_ID, createBaseRecordIdField } from '../record-identity';
import { BaseFieldType } from '../typedef';

describe('BaseDataModel', () => {
    it('excludes field types without a public authoring contract', () => {
        expect(Object.values(BaseFieldType)).toContain('recordLink');
        expect(Object.values(BaseFieldType)).not.toEqual(expect.arrayContaining([
            'twoWayLink',
            'lookup',
            'summary',
            'location',
            'button',
            'flow',
            'barcode',
        ]));
    });

    it('creates an empty default table without persistent records', () => {
        const model = new BaseDataModel({ id: 'base-1', name: 'Base' });
        const snapshot = model.getSnapshot();
        const table = snapshot.tables['table-1'];

        expect(snapshot.tableOrder).toEqual(['table-1']);
        expect(table.recordOrder).toEqual([]);
        expect(table.records).toEqual({});
        expect(table.rowId).toEqual({});
        expect(table.rowIndex).toEqual({});
        expect(table.cellData).toEqual({});
        expect(table.fieldOrder[0]).toBe(BASE_RECORD_ID_FIELD_ID);
        expect(table.fields[BASE_RECORD_ID_FIELD_ID]).toEqual(createBaseRecordIdField());
        expect(table.views[table.viewOrder[0] ?? '']?.fieldSettings?.[BASE_RECORD_ID_FIELD_ID]?.hidden).toBe(true);
    });

    it('keeps complete recordOrder without sorting all records', () => {
        const localeCompare = vi.spyOn(String.prototype, 'localeCompare').mockImplementation(() => {
            throw new Error('complete recordOrder should avoid sorting all records');
        });
        const snapshot: Partial<IBaseSnapshot> = {
            id: 'base-1',
            name: 'Base',
            tableOrder: ['table-1'],
            tables: {
                'table-1': {
                    id: 'table-1',
                    name: 'Table',
                    fields: {
                        [BASE_RECORD_ID_FIELD_ID]: createBaseRecordIdField(),
                        title: { id: 'title', name: 'Title', type: BaseFieldType.Text, config: {} },
                    },
                    fieldOrder: [BASE_RECORD_ID_FIELD_ID, 'title'],
                    primaryFieldId: 'title',
                    records: {
                        'record-1': {
                            id: 'record-1',
                            orderKey: '1',
                            createdAt: 0,
                            updatedAt: 0,
                            values: { [BASE_RECORD_ID_FIELD_ID]: 'record-1', title: 'One' },
                        },
                        'record-2': {
                            id: 'record-2',
                            orderKey: '2',
                            createdAt: 0,
                            updatedAt: 0,
                            values: { [BASE_RECORD_ID_FIELD_ID]: 'record-2', title: 'Two' },
                        },
                    },
                    recordOrder: ['record-2', 'record-1'],
                    viewOrder: [],
                    views: {},
                },
            },
        };

        const model = new BaseDataModel(snapshot);

        expect(model.getSnapshot().tables['table-1'].recordOrder).toEqual(['record-2', 'record-1']);
        expect(model.getSnapshot().tables['table-1'].cellData?.[0]?.[0]?.v).toBe('record-2');
        expect(model.getSnapshot().tables['table-1'].cellData?.[1]?.[0]?.v).toBe('record-1');
        expect(localeCompare).not.toHaveBeenCalled();
        localeCompare.mockRestore();
    });

    it('rejects a table whose record identity is missing instead of silently migrating it', () => {
        const snapshot: Partial<IBaseSnapshot> = {
            id: 'base-1',
            name: 'Base',
            tables: {
                'table-1': {
                    id: 'table-1',
                    name: 'Table',
                    fields: {
                        title: { id: 'title', name: 'Title', type: BaseFieldType.Text, config: {} },
                    },
                    fieldOrder: ['title'],
                    primaryFieldId: 'title',
                    records: {},
                    recordOrder: [],
                    viewOrder: [],
                    views: {},
                },
            },
        };

        expect(() => new BaseDataModel(snapshot)).toThrow('has an invalid record-id system field');
    });
});
