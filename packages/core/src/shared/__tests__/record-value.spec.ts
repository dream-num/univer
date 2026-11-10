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
import type { RecordValue } from '../record-value';
import { RecordValueType } from '../../types/enum/record-filter';
import { getRecordValueKey } from '../record-value';

describe('record value identity', () => {
    it('keeps typed identities distinct even when captions look the same', () => {
        const members: RecordValue[] = [
            { type: RecordValueType.Blank },
            { type: RecordValueType.String, value: '' },
            { type: RecordValueType.String, value: '(Blank)' },
            { type: RecordValueType.String, value: '1' },
            { type: RecordValueType.Number, value: 1 },
            { type: RecordValueType.Date, value: 1 },
            { type: RecordValueType.String, value: 'true' },
            { type: RecordValueType.Boolean, value: true },
            { type: RecordValueType.String, value: '#N/A' },
            { type: RecordValueType.Error, value: '#N/A' },
        ];

        expect(new Set(members.map(getRecordValueKey)).size).toBe(members.length);
    });

    it('keeps wire keys stable across JSON round trips and normalizes negative zero', () => {
        const value: RecordValue = { type: RecordValueType.String, value: 'north\u0000:string:南' };
        expect(getRecordValueKey(value)).toBe(JSON.stringify(['string', value.value]));
        expect(getRecordValueKey(JSON.parse(JSON.stringify(value)))).toBe(getRecordValueKey(value));
        expect(getRecordValueKey({ type: RecordValueType.Number, value: -0 }))
            .toBe(getRecordValueKey({ type: RecordValueType.Number, value: 0 }));
    });

    it('rejects malformed identities before they enter filter key sets', () => {
        for (const value of [null, [], {}, { type: 'unknown' }, { type: 'blank', value: undefined }, { type: 'string', value: 1 }, { type: 'boolean', value: 1 }]) {
            expect(() => getRecordValueKey(value as never)).toThrow(TypeError);
        }
        for (const type of [RecordValueType.Number, RecordValueType.Date] as const) {
            for (const value of [Number.NaN, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]) {
                expect(() => getRecordValueKey({ type, value })).toThrow(RangeError);
            }
        }
    });
});
