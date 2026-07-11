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
import { describe, expect, it } from 'vitest';
import { BaseDataModel } from '../base-data-model';
import { BaseFieldType } from '../typedef';

describe('BaseDataModel', () => {
    it('keeps complete recordOrder without sorting all records', () => {
        const throwingOrderKey = {
            localeCompare: () => {
                throw new Error('complete recordOrder should avoid sorting all records');
            },
        } as unknown as string;
        const snapshot: Partial<IBaseSnapshot> = {
            id: 'base-1',
            name: 'Base',
            tableOrder: ['table-1'],
            tables: {
                'table-1': {
                    id: 'table-1',
                    name: 'Table',
                    fields: {
                        title: { id: 'title', name: 'Title', type: BaseFieldType.Text, config: {} },
                    },
                    fieldOrder: ['title'],
                    primaryFieldId: 'title',
                    records: {
                        'record-1': {
                            id: 'record-1',
                            orderKey: throwingOrderKey,
                            createdAt: 0,
                            updatedAt: 0,
                            values: { title: 'One' },
                        },
                        'record-2': {
                            id: 'record-2',
                            orderKey: throwingOrderKey,
                            createdAt: 0,
                            updatedAt: 0,
                            values: { title: 'Two' },
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
    });
});
