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

import { CellValueType, DEFAULT_NUMBER_FORMAT, DEFAULT_TEXT_FORMAT_EXCEL } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getScientificNotationFormatFromCell, isAllowedPatternForScientificNotationNumber, isScientificNotationNumericCell } from '../scientific-notation';

describe('scientific notation', () => {
    it('scientific notation helpers detect numeric cells and derive display patterns from mantissa decimals', () => {
        expect(isScientificNotationNumericCell({ v: 1e21, t: CellValueType.NUMBER })).toBe(true);
        expect(isScientificNotationNumericCell({ v: 1.2345e31, t: CellValueType.NUMBER })).toBe(true);
        expect(isScientificNotationNumericCell({ v: '1e21', t: CellValueType.STRING })).toBe(false);
        expect(isScientificNotationNumericCell({ v: 123, t: CellValueType.NUMBER })).toBe(false);
        expect(isScientificNotationNumericCell(null)).toBe(false);

        expect(getScientificNotationFormatFromCell({ v: 1e21, t: CellValueType.NUMBER })).toBe('0.00E+00');
        expect(getScientificNotationFormatFromCell({ v: 1.2e21, t: CellValueType.NUMBER })).toBe('0.00E+00');
        expect(getScientificNotationFormatFromCell({ v: 1.2345e31, t: CellValueType.NUMBER })).toBe('0.0000E+00');
        expect(getScientificNotationFormatFromCell({ v: -1.2345e-31, t: CellValueType.NUMBER })).toBe('0.0000E+00');
    });

    it('scientific notation format guard only allows general, text, and scientific patterns', () => {
        expect(isAllowedPatternForScientificNotationNumber(undefined)).toBe(true);
        expect(isAllowedPatternForScientificNotationNumber(DEFAULT_NUMBER_FORMAT)).toBe(true);
        expect(isAllowedPatternForScientificNotationNumber(DEFAULT_TEXT_FORMAT_EXCEL)).toBe(true);
        expect(isAllowedPatternForScientificNotationNumber('0.00E+00')).toBe(true);
        expect(isAllowedPatternForScientificNotationNumber('0.00')).toBe(false);
        expect(isAllowedPatternForScientificNotationNumber('0%')).toBe(false);
    });
});
