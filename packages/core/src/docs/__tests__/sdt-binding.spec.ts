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

import type { ISdtCustomRange } from '../../types/interfaces/i-document-data';
import { describe, expect, it } from 'vitest';
import { CustomRangeType } from '../../types/interfaces/i-document-data';
import { getSdtBindingKey, getSdtBindingValue } from '../sdt-binding';

describe('SDT scalar bindings', () => {
    it('uses the XML value instead of a localized list label or structural cell anchors', () => {
        const body = { dataStream: '\x1CYes\r\n\x1D' };
        const range: ISdtCustomRange = {
            rangeId: 'answer',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: body.dataStream.length - 1,
            properties: { kind: 'dropDownList', placement: 'cell', listItems: [{ displayText: 'Yes', value: '1' }] },
        };
        expect(getSdtBindingValue(body, range)).toBe('1');
        range.properties.showingPlaceholder = true;
        expect(getSdtBindingValue(body, range)).toBe('');
    });

    it('requires a complete binding and keeps distinct XML stores and namespaces separate', () => {
        const range: ISdtCustomRange = {
            rangeId: 'answer',
            rangeType: CustomRangeType.SDT,
            startIndex: 0,
            endIndex: 0,
            properties: { kind: 'text', placement: 'inline', dataBinding: { xpath: '/x:value' } },
        };
        expect(getSdtBindingKey(range)).toBeUndefined();
        range.properties.dataBinding!.storeItemID = 'STORE';
        const key = getSdtBindingKey(range);
        range.properties.dataBinding!.storeItemID = 'store';
        expect(getSdtBindingKey(range)).toBe(key);
        range.properties.dataBinding!.prefixMappings = 'xmlns:x="urn:other"';
        expect(getSdtBindingKey(range)).not.toBe(key);
    });
});
