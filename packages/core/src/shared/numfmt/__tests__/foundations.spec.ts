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

// Derived from numfmt 3.2.6 (MIT), commit c2cfdfa01bb1f24df51e985825671eb480daed4c.
// See packages/core/src/shared/numfmt/LICENSE.

// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { dec2frac } from '../dec-to-frac';
import { numDec } from '../num-dec';
import { round } from '../round';

describe('numfmt numeric foundations', () => {
    it('preserves the 3.2.6 rounding behavior during migration', () => {
        expect(round(1.4)).toBe(1);
        expect(round(1.5)).toBe(2);
        expect(round(-1.5)).toBe(-2);
        expect(round(1499, -2)).toBe(1500);
    });

    it('converts decimal fractions', () => {
        expect(dec2frac(1 / 3)).toEqual([1, 3]);
        expect(dec2frac(-0.25)).toEqual([-1, 4]);
    });

    it('reports the same digit metadata as upstream', () => {
        expect(numDec(0)).toEqual({
            total: 1,
            sign: 0,
            period: 0,
            int: 1,
            frac: 0,
        });
        expect(numDec(-12.34)).toEqual({
            total: 6,
            digits: 4,
            sign: 1,
            period: 1,
            int: 2,
            frac: 2,
        });
    });
});
