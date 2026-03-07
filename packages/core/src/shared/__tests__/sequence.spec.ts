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
import { ABCToNumber, numberToABC, numberToListABC, repeatStringNumTimes } from '../sequence';

describe('sequence helpers', () => {
    it('should convert between letters and zero-based indices', () => {
        expect(ABCToNumber('A')).toBe(0);
        expect(ABCToNumber('Z')).toBe(25);
        expect(ABCToNumber('AA')).toBe(26);
        expect(ABCToNumber('az')).toBe(51);
        expect(ABCToNumber('')).toBeNaN();
        expect(ABCToNumber(null as never)).toBeNaN();

        expect(numberToABC(0)).toBe('A');
        expect(numberToABC(25)).toBe('Z');
        expect(numberToABC(26)).toBe('AA');
        expect(numberToABC(51)).toBe('AZ');
    });

    it('should repeat strings and build list-style letters', () => {
        expect(repeatStringNumTimes('ab', 3)).toBe('ababab');
        expect(repeatStringNumTimes('ab', 0)).toBe('');
        expect(numberToListABC(0)).toBe('a');
        expect(numberToListABC(25, true)).toBe('Z');
        expect(numberToListABC(26)).toBe('aa');
        expect(numberToListABC(27, true)).toBe('BB');
    });
});
