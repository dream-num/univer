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

import { CellValueType } from '@univerjs/core';

import { describe, expect, it } from 'vitest';
import { extractFormulaNumber } from '../utils';

describe('Test utils', () => {
    it('Function extractFormulaNumber', () => {
        const v = 0.07 / 0.1;
        expect(extractFormulaNumber({ v })).toBeNull();
        expect(extractFormulaNumber({ v, f: '=SUM(A1)' })).toBeNull();
        expect(extractFormulaNumber({ v, si: 'id1', f: '=SUM(A1)', t: CellValueType.NUMBER })).toBe(0.7);
    });
});
