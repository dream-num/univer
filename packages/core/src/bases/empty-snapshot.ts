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
import { CellValueType, LocaleType } from '../types/enum';
import { BASE_RECORD_ID_FIELD_ID, createBaseRecordIdField } from './record-identity';
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
    const recordCount = options.recordCount ?? 0;
    const recordIdField = createBaseRecordIdField();
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
            values: { [BASE_RECORD_ID_FIELD_ID]: recordId },
            orderKey: String(index + 1).padStart(4, '0'),
            createdAt: now,
            updatedAt: now,
        };
        recordOrder.push(recordId);
        rowIndex[recordId] = index;
        rowId[index] = recordId;
        cellData[index] = {
            0: { v: recordId, t: CellValueType.STRING },
        };
    }

    const gridView: IViewSnapshot = {
        id: gridViewId,
        tableId: options.id,
        name: 'Grid',
        type: BaseViewType.Grid,
        fieldOrder: [BASE_RECORD_ID_FIELD_ID, primaryFieldId],
        fieldSettings: {
            [BASE_RECORD_ID_FIELD_ID]: { hidden: true },
        },
        config: { frozenFieldCount: 1 },
    };

    return {
        id: options.id,
        name: options.name,
        primaryFieldId,
        fieldOrder: [BASE_RECORD_ID_FIELD_ID, primaryFieldId],
        fields: {
            [BASE_RECORD_ID_FIELD_ID]: recordIdField,
            [primaryFieldId]: primaryField,
        },
        records,
        recordOrder,
        rowIndex,
        rowId,
        colIndex: {
            [BASE_RECORD_ID_FIELD_ID]: 0,
            [primaryFieldId]: 1,
        },
        colId: {
            0: BASE_RECORD_ID_FIELD_ID,
            1: primaryFieldId,
        },
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
        schemaVersion: 2,
        tableOrder: [tableId],
        tables: {
            [tableId]: createDefaultBaseTableSnapshot({
                id: tableId,
                name: 'Table 1',
                now,
                recordCount: 0,
            }),
        },
        createdAt: now,
        updatedAt: now,
    };
}
