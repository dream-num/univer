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

import type { FilterSelectionMode } from '../types/enum/record-filter';
import { RecordValueType } from '../types/enum/record-filter';

export type RecordValue =
    | { type: RecordValueType.Blank }
    | { type: RecordValueType.String | RecordValueType.Error; value: string }
    | { type: RecordValueType.Number | RecordValueType.Date; value: number }
    | { type: RecordValueType.Boolean; value: boolean };

export type RecordSelection =
    | { mode: FilterSelectionMode.All }
    | { mode: FilterSelectionMode.Include | FilterSelectionMode.Exclude; values: RecordValue[] };

export function getRecordValueKey(_value: RecordValue): string {
    const value = _value as unknown;
    if (!isRecord(value) || typeof value.type !== 'string') {
        throw new TypeError('Invalid record value.');
    }

    switch (value.type) {
        case RecordValueType.Blank:
            if ('value' in value) {
                throw new TypeError('Blank record values cannot have a value.');
            }
            return '["blank"]';
        case RecordValueType.String:
        case RecordValueType.Error:
            if (typeof value.value !== 'string') {
                throw new TypeError('Invalid record value.');
            }
            return JSON.stringify([value.type, value.value]);
        case RecordValueType.Boolean:
            if (typeof value.value !== 'boolean') {
                throw new TypeError('Invalid record value.');
            }
            return JSON.stringify([value.type, value.value]);
        case RecordValueType.Number:
        case RecordValueType.Date:
            if (typeof value.value !== 'number') {
                throw new TypeError('Invalid record value.');
            }
            if (!Number.isFinite(value.value)) {
                throw new RangeError('Record numeric values must be finite.');
            }
            return JSON.stringify([value.type, value.value === 0 ? 0 : value.value]);
        default:
            throw new TypeError('Unknown record value type.');
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
