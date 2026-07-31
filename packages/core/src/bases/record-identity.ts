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

import type { IFieldSnapshot, ITableSnapshot } from './typedef';
import { BaseFieldType } from './typedef';

export const BASE_RECORD_ID_FIELD_ID = '__record_id';
export const BASE_RECORD_ID_FIELD_NAME = 'record-id';

const BASE_RECORD_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export function createBaseRecordIdField(): IFieldSnapshot {
    return {
        id: BASE_RECORD_ID_FIELD_ID,
        name: BASE_RECORD_ID_FIELD_NAME,
        type: BaseFieldType.RecordId,
        config: {},
        system: true,
        readonly: true,
    };
}

export function isValidBaseRecordId(recordId: string): boolean {
    return BASE_RECORD_ID_PATTERN.test(recordId);
}

export function isBaseRecordIdFieldName(name: string): boolean {
    return name.trim().toLowerCase() === BASE_RECORD_ID_FIELD_NAME;
}

export function assertBaseTableRecordIdentity(table: ITableSnapshot): void {
    const recordIdField = table.fields[BASE_RECORD_ID_FIELD_ID];
    const recordIdFields = Object.values(table.fields).filter((field) => field.type === BaseFieldType.RecordId);
    if (
        !recordIdField
        || recordIdFields.length !== 1
        || recordIdField.type !== BaseFieldType.RecordId
        || recordIdField.name !== BASE_RECORD_ID_FIELD_NAME
        || recordIdField.system !== true
        || recordIdField.readonly !== true
        || table.fieldOrder[0] !== BASE_RECORD_ID_FIELD_ID
        || table.primaryFieldId === BASE_RECORD_ID_FIELD_ID
        || !table.fields[table.primaryFieldId]
    ) {
        throw new Error(`[BaseDataModel]: table "${table.id}" has an invalid record-id system field.`);
    }

    const conflictingField = Object.values(table.fields).find((field) => {
        return field.id !== BASE_RECORD_ID_FIELD_ID && isBaseRecordIdFieldName(field.name);
    });
    if (conflictingField) {
        throw new Error(`[BaseDataModel]: field name "${conflictingField.name}" is reserved for the record-id system field.`);
    }

    for (const [recordKey, record] of Object.entries(table.records)) {
        if (
            record.id !== recordKey
            || !isValidBaseRecordId(record.id)
            || record.values[BASE_RECORD_ID_FIELD_ID] !== record.id
        ) {
            throw new Error(`[BaseDataModel]: record "${recordKey}" has an invalid record-id projection.`);
        }
    }
}
