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
import { Complex } from '../complex';

describe('Test complex', () => {
    it('Parses a real part written with an exponent', () => {
        const complex = new Complex('1e-7-i');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1e-7);
        expect(complex.getINum()).toBe(-1);
    });

    it('Parses exponents with an explicit sign in both parts', () => {
        const complex = new Complex('-1E+3-2e-3j');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(-1000);
        expect(complex.getINum()).toBe(-0.002);
        expect(complex.getSuffix()).toBe('j');
    });

    it('Reads back what getComplex writes for a tiny real part', () => {
        const complex = Complex.createByComplexStr(1e-7, -1, 'i');

        expect(complex.isError()).toBe(false);
        expect(complex.getRealNum()).toBe(1e-7);
        expect(complex.getINum()).toBe(-1);
    });

    it('Keeps rejecting two separators', () => {
        expect(new Complex('1+2-3i').isError()).toBe(true);
        expect(new Complex('1-2+3i').isError()).toBe(true);
    });
});
