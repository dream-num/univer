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
import { fractionalPower } from '../fractional-power';

describe('Excel fractional powers', () => {
    it('matches Excel for fractional powers of a time and a date serial', () => {
        expect(fractionalPower(0.125, 0.125)).toBe(0.7711054127039705);
        expect(fractionalPower(45323, 0.125)).toBe(3.819793022700358);
    });

    it('preserves subnormal results and distinguishes an overflowing intermediate', () => {
        expect(fractionalPower(1e-100, 3.125)).toBe(3.16227766016e-313);
        expect(fractionalPower(0.125, 1e308)).toBeNaN();
        expect(fractionalPower(2, 1024.5)).toBe(Infinity);
    });
});
