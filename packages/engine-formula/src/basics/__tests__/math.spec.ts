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
import { calculateCombin, calculateFactorial } from '../math';

describe('Test math', () => {
    it('Factorial test', () => {
        expect(calculateFactorial(0)).toBe(1);
        expect(calculateFactorial(1)).toBe(1);
        expect(calculateFactorial(1.9)).toBe(1);
        expect(calculateFactorial(5)).toBe(120);
        expect(calculateFactorial(-1)).toBe(Number.NaN);
        expect(calculateFactorial(171)).toBe(Infinity);
    });

    it('Combin test', () => {
        expect(calculateCombin(8, 2)).toBe(28);
        expect(calculateCombin(1000000, 2000)).toBe(Infinity);
    });
});
