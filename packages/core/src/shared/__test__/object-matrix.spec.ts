/**
 * Copyright 2023 DreamNum Inc.
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

import { ObjectMatrix } from '../object-matrix';

describe('test ObjectMatrix', () => {
    const getPrimitiveObj = () => ({
        1: { 1: '123', 2: '222', 3: '333' },
        2: { 1: '111', 2: '121', 3: '313' },
    });
    it('test deleteValue', () => {
        const matrix = new ObjectMatrix(getPrimitiveObj());
        matrix.realDeleteValue(1, 1);
        expect(matrix.getValue(1, 1)).toBe(undefined);
        expect(matrix.getSizeOf()).toBe(2);
        matrix.realDeleteValue(1, 2);
        matrix.realDeleteValue(1, 3);
        expect(matrix.getValue(1, 2)).toBe(null);
        expect(matrix.getValue(1, 3)).toBe(null);
        expect(matrix.getRow(1)).toBe(undefined);
        expect(matrix.getSizeOf()).toBe(1);
    });
});
