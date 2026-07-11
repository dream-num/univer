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

import type { IBaseSnapshot, IFieldSnapshot, IRecordSnapshot, ITableSnapshot, IViewSnapshot } from './typedef';
import pkg from '../../package.json';
import { generateRandomId } from '../shared';
import { LocaleType } from '../types/enum';
import { BaseFieldType, BaseViewType } from './typedef';

export interface ICreateDefaultBaseTableSnapshotOptions {
    id: string;
    name: string;
    primaryFieldId?: string;
    primaryFieldName?: string;
    gridViewId?: string;
    recordCount?: number;
    now?: number;
}

export function createDefaultBaseTableSnapshot(options: ICreateDefaultBaseTableSnapshotOptions): ITableSnapshot {
    const now = options.now ?? Date.now();
    const primaryFieldId = options.primaryFieldId ?? generateRandomId(6);
    const gridViewId = options.gridViewId ?? generateRandomId(6);
    const recordCount = options.recordCount ?? 5;
    const primaryField: IFieldSnapshot = {
        id: primaryFieldId,
        name: options.primaryFieldName ?? 'Name',
        type: BaseFieldType.Text,
        config: { placeholder: 'bases.fieldConfig.textPlaceholder' },
    };
    const records: Record<string, IRecordSnapshot> = {};
    const recordOrder: string[] = [];
    const rowIndex: Record<string, number> = {};
    const rowId: Record<number, string> = {};
    const cellData: NonNullable<ITableSnapshot['cellData']> = {};

    for (let index = 0; index < recordCount; index++) {
        const recordId = `${options.id}-record-${index + 1}`;
        records[recordId] = {
            id: recordId,
            values: {},
            orderKey: String(index + 1).padStart(4, '0'),
            createdAt: now,
            updatedAt: now,
        };
        recordOrder.push(recordId);
        rowIndex[recordId] = index;
        rowId[index] = recordId;
        cellData[index] = {};
    }

    const gridView: IViewSnapshot = {
        id: gridViewId,
        tableId: options.id,
        name: 'Grid',
        type: BaseViewType.Grid,
        fieldOrder: [primaryFieldId],
        fieldSettings: {},
        config: { frozenFieldCount: 1 },
    };

    return {
        id: options.id,
        name: options.name,
        primaryFieldId,
        fieldOrder: [primaryFieldId],
        fields: { [primaryFieldId]: primaryField },
        records,
        recordOrder,
        rowIndex,
        rowId,
        colIndex: { [primaryFieldId]: 0 },
        colId: { 0: primaryFieldId },
        cellData,
        resources: {
            attachmentSets: {},
            attachments: {},
        },
        views: { [gridViewId]: gridView },
        viewOrder: [gridViewId],
    };
}

export function getEmptySnapshot(
    unitId: string = generateRandomId(),
    name: string = '',
    locale: LocaleType = LocaleType.ZH_CN
): IBaseSnapshot {
    const now = Date.now();
    const tableId = 'table-1';

    return {
        id: unitId,
        name,
        locale,
        appVersion: pkg.version,
        schemaVersion: 1,
        tableOrder: [tableId],
        tables: {
            [tableId]: createDefaultBaseTableSnapshot({
                id: tableId,
                name: 'Table 1',
                now,
                recordCount: 5,
            }),
        },
        createdAt: now,
        updatedAt: now,
    };
}
