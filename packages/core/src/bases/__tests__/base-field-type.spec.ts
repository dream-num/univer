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
import { BaseFieldType, BaseFilterConjunction, BaseFilterOperator, BaseSortDirection } from '../index';

describe('BaseFieldType', () => {
    it('exposes runtime enum values that match persisted field type strings', () => {
        expect(BaseFieldType.Text).toBe('text');
        expect(BaseFieldType.SingleSelect).toBe('singleSelect');
        expect(BaseFieldType.CreatedAt).toBe('createdAt');
        expect(Object.values(BaseFieldType)).toContain('summary');
    });
});

describe('BaseFilterOperator', () => {
    it('exposes runtime enum values that match persisted filter operator strings', () => {
        expect(BaseFilterOperator.IS).toBe('is');
        expect(BaseFilterOperator.NOT_CONTAINS).toBe('notContains');
        expect(BaseFilterOperator.BEFORE).toBe('before');
    });
});

describe('BaseFilterConjunction', () => {
    it('exposes runtime enum values that match persisted filter conjunction strings', () => {
        expect(BaseFilterConjunction.AND).toBe('and');
        expect(BaseFilterConjunction.OR).toBe('or');
    });
});

describe('BaseSortDirection', () => {
    it('exposes runtime enum values that match persisted sort and group direction strings', () => {
        expect(BaseSortDirection.ASC).toBe('asc');
        expect(BaseSortDirection.DESC).toBe('desc');
    });
});
