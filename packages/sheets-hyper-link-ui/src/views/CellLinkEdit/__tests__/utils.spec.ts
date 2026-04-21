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
import { isBlankInput, resolveRangePayload } from '../utils';

describe('CellLinkEdit utils', () => {
    it('treats whitespace-only labels as blank input', () => {
        expect(isBlankInput('')).toBe(true);
        expect(isBlankInput('   ')).toBe(true);
        expect(isBlankInput('\n\t')).toBe(true);
        expect(isBlankInput(' label ')).toBe(false);
    });

    it('returns an empty payload for invalid range text', () => {
        expect(resolveRangePayload('', 'Sheet1')).toBe('');
        expect(resolveRangePayload('not-a-range', 'Sheet1')).toBe('');
    });

    it('normalizes valid range text and falls back to the active sheet name', () => {
        expect(resolveRangePayload('A1:B2', 'Sheet1')).toBe('Sheet1!A1:B2');
        expect(resolveRangePayload('Sheet2!A1:B2', 'Sheet1')).toBe('Sheet2!A1:B2');
    });
});
