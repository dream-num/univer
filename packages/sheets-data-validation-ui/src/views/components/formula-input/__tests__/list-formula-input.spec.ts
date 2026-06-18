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

import { deserializeListOptions } from '@univerjs/sheets';
import { describe, expect, it } from 'vitest';
import { buildCustomListFormulaPayload } from '../utils';

describe('ListFormulaInput', () => {
    it('keeps commas inside custom list values', () => {
        const payload = buildCustomListFormulaPayload([
            { label: 'a,b', color: '#ff0000' },
            { label: 'c', color: '#ffffff' },
        ], '#ffffff');

        expect(deserializeListOptions(payload.formula1)).toEqual(['a,b', 'c']);
        expect(payload.formula2).toBe('#ff0000,');
    });

    it('keeps colors aligned with the first non-empty occurrence of each custom option', () => {
        const payload = buildCustomListFormulaPayload([
            { label: '', color: '#ff0000' },
            { label: 'Pending', color: '#ffffff' },
            { label: 'Done', color: '#00ff00' },
            { label: 'Pending', color: '#0000ff' },
        ], '#ffffff');

        expect(deserializeListOptions(payload.formula1)).toEqual(['Pending', 'Done']);
        expect(payload.formula2).toBe(',#00ff00');
    });
});
