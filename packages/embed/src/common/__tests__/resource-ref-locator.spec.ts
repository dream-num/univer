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
import { normalizeResourceRefLocator, parseResourceRefLocator } from '../resource-ref-locator';

describe('resource ref locator parser', () => {
    it('parses bare unit locators into canonical anchor refs', () => {
        const parsed = parseResourceRefLocator('child-sheet');

        expect(parsed.canonicalRef).toBe('#unit=child-sheet');
        expect(parsed.scheme).toBeUndefined();
        expect(parsed.unitSelector).toBe('child-sheet');
        expect([...parsed.params.entries()]).toEqual([['unit', 'child-sheet']]);
        expect(normalizeResourceRefLocator('child-sheet')).toBe('#unit=child-sheet');
    });

    it('normalizes anchor unit locators through the same parser output', () => {
        const parsed = parseResourceRefLocator('#unit=child%20sheet');

        expect(parsed.canonicalRef).toBe('#unit=child%20sheet');
        expect(parsed.unitSelector).toBe('child sheet');
        expect([...parsed.params.entries()]).toEqual([['unit', 'child sheet']]);
    });

    it('rejects unsupported or invalid locator shapes', () => {
        expect(() => parseResourceRefLocator(' child-sheet')).toThrow('RESOURCE_REF_LOCATOR_INVALID');
        expect(() => parseResourceRefLocator('#unit=')).toThrow('RESOURCE_REF_LOCATOR_INVALID');
        expect(() => parseResourceRefLocator('#unit=child-sheet&range=A1')).toThrow('RESOURCE_REF_LOCATOR_UNSUPPORTED');
        expect(() => parseResourceRefLocator('univer://unit/remote-sheet')).toThrow('RESOURCE_REF_LOCATOR_UNSUPPORTED');
        expect(() => parseResourceRefLocator('univer://remote-workbook#unit=child-sheet')).toThrow('RESOURCE_REF_LOCATOR_UNSUPPORTED');
    });
});
