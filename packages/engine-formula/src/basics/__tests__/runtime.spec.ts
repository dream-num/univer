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
import { convertRuntimeToUnitData, convertUnitDataToRuntime } from '../runtime';

describe('formula runtime data', () => {
    it.each(['__proto__', 'constructor', 'prototype', 'toString'])('round trips special unit and sheet identifiers (%s) without prototype pollution', (key) => {
        const marker = '__formula_pollution__';
        const data = JSON.parse(JSON.stringify({ [key]: { [marker]: { 0: { 0: { v: 42 } } } }, normal: { [key]: { 0: { 0: { v: 7 } } } } }));
        try {
            const runtime = convertUnitDataToRuntime(data);
            expect(runtime[key]![marker].getValue(0, 0)).toEqual({ v: 42 });
            expect(runtime.normal![key].getValue(0, 0)).toEqual({ v: 7 });
            expect(convertRuntimeToUnitData(runtime)).toEqual(data);
            expect(Object.getOwnPropertyDescriptor(Object.prototype, marker)).toBeUndefined();
        } finally {
            Reflect.deleteProperty(Object.prototype, marker);
            Reflect.deleteProperty(Object, marker);
        }
    });
});
