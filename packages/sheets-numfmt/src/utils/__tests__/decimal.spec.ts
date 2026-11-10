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
import { getDecimalFromPattern, getDecimalString, isPatternHasDecimal, setPatternDecimal } from '../decimal';

describe('decimal formats', () => {
    it('getDecimalFromPattern', () => {
        expect(getDecimalFromPattern('_(###0.000);--###0.00')).toBe(3);
        expect(getDecimalFromPattern('_(###0);-###0.00')).toBe(0); // the function decimal just use positive,negative configuration ignored
        expect(getDecimalFromPattern('_(###0.0);--###0.00')).toBe(1);
        expect(getDecimalFromPattern('_(###0.);--###0.00')).toBe(0);
    });

    it('getDecimalString', () => {
        expect(getDecimalString(3)).toBe('000');
        expect(getDecimalString(-1)).toBe('');
        expect(getDecimalString(0)).toBe('');
    });

    it('setPatternDecimal', () => {
        expect(setPatternDecimal('0.', 4)).toBe('0.0000');
        expect(setPatternDecimal('.', 4)).toBe('.0000');
        expect(setPatternDecimal('0.0', 4)).toBe('0.0000');
        expect(setPatternDecimal('0.0', 0)).toBe('0');
    });

    it('isPatternHasDecimal', () => {
        expect(isPatternHasDecimal('0.00')).toBe(true);
        expect(isPatternHasDecimal('#,##0')).toBe(true);
        expect(isPatternHasDecimal('General')).toBe(false);
    });
});
