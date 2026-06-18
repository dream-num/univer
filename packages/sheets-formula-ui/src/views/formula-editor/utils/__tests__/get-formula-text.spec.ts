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
import { getFormulaText } from '../get-formula-text';

describe('getFormulaText', () => {
    it('removes the leading equals sign before showing formula editor content', () => {
        expect(getFormulaText('=SUM(A1:B2)')).toBe('SUM(A1:B2)');
    });

    it('keeps non-formula cell text out of the formula editor content', () => {
        expect(getFormulaText('SUM(A1:B2)')).toBe('');
    });
});
